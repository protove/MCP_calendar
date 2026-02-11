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
import java.time.LocalDateTime
import java.util.UUID

private val logger = KotlinLogging.logger {}

@Service
class GeminiService(
    private val geminiWebClient: WebClient,
    private val geminiProperties: GeminiProperties
){
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
            .map { response ->
                handleResponse(response, convId)
            }
            .doOnSuccess {
                logger.info { "Response generated for conversation: $convId" }
            }
            .doOnError { error ->
                logger.error(error) { "Failed to generate content: ${error.message}" }
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
            .mapNotNull { chunk -> chunk.getText() }
            .doOnSubscribe {
                logger.debug { "Stream subscribed for conversation: $convId" }
            }
            .doOnComplete {
                logger.info { "Stream completed for conversation: $convId" }
            }
            .doOnError { error ->
                logger.error(error) { "Stream error: ${error.message}" }
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
            is WebClientResponseException.BadRequest ->
                GeminiException("잘못된 요청입니다: ${error.responseBodyAsString}")
            is WebClientResponseException ->
                GeminiException("Gemini API 오류 (${error.statusCode}): ${error.responseBodyAsString}")
            is GeminiException -> error
            else -> GeminiException("Gemini API 호출 중 오류가 발생했습니다: ${error.message}")
        }
    }
}