package com.mcp.calendar.service

import com.mcp.calendar.config.GeminiProperties
import com.mcp.calendar.dto.request.GenerationConfig
import com.mcp.calendar.dto.request.GeminiRequest
import com.mcp.calendar.dto.response.ChatResponse
import com.mcp.calendar.dto.response.GeminiResponse
import com.mcp.calendar.dto.response.GeminiStreamChunk
import com.mcp.calendar.exception.GeminiBlockedException
import com.mcp.calendar.exception.GeminiAuthException
import com.mcp.calendar.exception.GeminiConfigurationException
import com.mcp.calendar.exception.GeminiRateLimitException
import com.mcp.calendar.exception.GeminiException
import mu.KotlinLogging
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.WebClientResponseException
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.util.retry.Retry
import java.time.Duration
import java.time.LocalDateTime
import java.util.UUID

private val logger = KotlinLogging.logger {}

// API 키가 포함된 URL을 로그에서 마스킹
private fun sanitizeMessage(message: String?): String {
    if (message == null) return "unknown error"
    return message.replace(Regex("[?&]key=[^&\\s]*"), "?key=***")
}

@Service
class GeminiService(
    private val geminiWebClient: WebClient,
    private val geminiProperties: GeminiProperties
){
    companion object {
        // 무료 등급은 일일 20회 제한이므로 429 재시도 시 쿼타만 소진됨 → 재시도 비활성화
        // 유료 전환 시 MAX_RETRIES를 2~3으로 올리고 활성화
        private const val MAX_RETRIES = 0L
        private val INITIAL_BACKOFF = Duration.ofSeconds(5)

        private val retrySpec = Retry.backoff(MAX_RETRIES, INITIAL_BACKOFF)
            .maxBackoff(Duration.ofSeconds(30))
            .filter { it is WebClientResponseException.TooManyRequests }
            .doBeforeRetry { signal ->
                logger.warn { "429 Rate limit hit, retry #${signal.totalRetries() + 1} after backoff" }
            }
            .onRetryExhaustedThrow { _, signal ->
                signal.failure()
            }
    }

    fun generateContent(
        message: String,
        conversationId: String? = null,
        config: GenerationConfig? = null
    ): Mono<ChatResponse> {
        val convId = conversationId ?: generateConversationId()

        logger.info { "Generating content for conversation: $convId" }
        logger.debug { "Message: ${message.take(100)}..." }

        if (!geminiProperties.isConfigured()) {
            logger.error { "Gemini API is not configured" }
            return Mono.error(GeminiConfigurationException("Gemini API Key가 설정되지 않았습니다."))
        }

        val request = GeminiRequest.of(message, config ?: GenerationConfig.DEFAULT)

        return geminiWebClient.post()
            .uri(geminiProperties.getGenerateContentUrl())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .retrieve()
            .bodyToMono(GeminiResponse::class.java)
            .retryWhen(retrySpec)
            .map { response ->
                handleResponse(response, convId)
            }
            .doOnSuccess {
                logger.info { "Response generated for conversation: $convId" }
            }
            .doOnError { error ->
                logger.error { "Failed to generate content: ${sanitizeMessage(error.message)}" }
            }
            .onErrorMap { error ->
                mapToServiceException(error)
            }
    }

    fun streamGenerateContent(
        message: String,
        conversationId: String? = null,
        config: GenerationConfig? = null
    ): Flux<String> {
        val convId = conversationId ?: generateConversationId()

        logger.info { "Streaming content for conversation: $convId" }

        if (!geminiProperties.isConfigured()) {
            logger.error { "Gemini API is not configured" }
            return Flux.error(GeminiConfigurationException("Gemini API Key가 설정되지 않았습니다."))
        }

        val request = GeminiRequest.of(message, config ?: GenerationConfig.DEFAULT)

        return geminiWebClient.post()
            .uri(geminiProperties.getStreamGenerateContentUrl())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .retrieve()
            .bodyToFlux(GeminiStreamChunk::class.java)
            .retryWhen(retrySpec)
            .map { chunk -> chunk.getText() }
            .filter { it != null }
            .map { it!! }
            .doOnSubscribe {
                logger.debug { "Stream subscribed for conversation: $convId" }
            }
            .doOnComplete {
                logger.info { "Stream completed for conversation: $convId" }
            }
            .doOnError { error ->
                logger.error { "Stream error: ${sanitizeMessage(error.message)}" }
            }
            .onErrorMap { error ->
                mapToServiceException(error)
            }
    }

    fun checkHealth(): Mono<Boolean> {
        if(!geminiProperties.isConfigured()) {
            return Mono.just(false)
        }

        return generateContent("ping", config = GenerationConfig(maxOutputTokens = 10))
            .map { true }
            .onErrorReturn(false)
    }

    fun generateContentRaw(request: GeminiRequest): Mono<GeminiResponse> {
        logger.info { "Generating raw content with tools" }

        if (!geminiProperties.isConfigured()) {
            logger.error { "Gemini API is not configured" }
            return Mono.error(GeminiConfigurationException("Gemini API Key가 설정되지 않았습니다."))
        }

        logger.debug {
            val toolCount = request.tools?.sumOf { it.functionDeclarations.size } ?: 0
            val toolConfigMode = request.toolConfig?.functionCallingConfig?.mode
            "Gemini request - toolCount: $toolCount, toolConfig: $toolConfigMode, contents: ${request.contents.size}"
        }

        return geminiWebClient.post()
            .uri(geminiProperties.getGenerateContentUrl())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .retrieve()
            .bodyToMono(GeminiResponse::class.java)
            .retryWhen(retrySpec)
            .doOnSuccess { response ->
                logger.debug { "Raw response received - hasFunctionCall: ${response.hasFunctionCall()}" }
                response.usageMetadata?.let { usage ->
                    logger.debug {
                        "Token usage - Prompt: ${usage.promptTokenCount}, " +
                        "Response: ${usage.candidatesTokenCount}, " +
                        "Total: ${usage.totalTokenCount}"
                    }
                }
            }
            .doOnError { error ->
                logger.error { "Failed to generate raw content: ${sanitizeMessage(error.message)}" }
            }
            .onErrorMap { error ->
                mapToServiceException(error)
            }
    }

    private fun generateConversationId(): String {
        return "conv_${UUID.randomUUID().toString().replace("-", "").take(16)}"
    }

    private fun handleResponse(response: GeminiResponse, conversationId: String): ChatResponse {
        if (response.isBlocked()) {
            val reason = response.getBlockReason()
            logger.warn { "Response blocked: $reason" }
            throw GeminiBlockedException("응답이 안전 정책에 의해 차단되었습니다: $reason")
        }

        val text = response.getText()
            ?: throw GeminiException("응답 텍스트를 추출할 수 없습니다.")

        response.usageMetadata?.let { usage ->
            logger.debug {
                "Token usage - Prompt: ${usage.promptTokenCount}, " +
                "Response: ${usage.candidatesTokenCount}, " +
                "Total: ${usage.totalTokenCount}"
            }
        }

        return ChatResponse(
            message = text,
            conversationId = conversationId,
            timestamp = LocalDateTime.now()
        )
    }

    private fun mapToServiceException(error: Throwable): Throwable {
        return when (error) {
            is WebClientResponseException.Unauthorized ->
                GeminiAuthException("Gemini API 인증에 실패했습니다. API Key를 확인해주세요.")
            is WebClientResponseException.TooManyRequests ->
                GeminiRateLimitException("API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.")
            is WebClientResponseException.BadRequest -> {
                logger.warn { "Gemini BadRequest: ${error.responseBodyAsString.take(500)}" }
                GeminiException("Gemini API 요청 형식이 올바르지 않습니다.")
            }
            is WebClientResponseException -> {
                logger.warn { "Gemini API error (${error.statusCode}): ${error.responseBodyAsString.take(500)}" }
                GeminiException("Gemini API 오류가 발생했습니다 (${error.statusCode}). 잠시 후 다시 시도해주세요.")
            }
            is GeminiException -> error
            else -> GeminiException("Gemini API 호출 중 오류가 발생했습니다.")
        }
    }
}