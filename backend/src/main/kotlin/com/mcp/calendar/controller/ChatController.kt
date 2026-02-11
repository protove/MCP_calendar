package com.mcp.calendar.controller

import com.mcp.calendar.dto.request.ChatRequest
import com.mcp.calendar.dto.response.ApiResponse
import com.mcp.calendar.dto.response.ChatResponse
import com.mcp.calendar.service.GeminiService
import jakarta.validation.Valid
import mu.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/chat")
class ChatController(
    private val geminiService: GeminiService
){
    // POST /api/chat - 일반 채팅 응답
    @PostMapping
    fun chat(
        @Valid @RequestBody request: ChatRequest
    ): Mono<ResponseEntity<ApiResponse<ChatResponse>>> {
        logger.info { "Chat request received - conversationId: ${request.conversationId}" }

        return geminiService.generateContent(
            message = request.message,
            conversationId = request.conversationId,
        )
        .map { response ->
            ResponseEntity.ok(ApiResponse.success(response))
        }
        .onErrorResume { error ->
            logger.error(error) { "Chat error: ${error.message}" }
            Mono.just(
                ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                        ApiResponse.error<ChatResponse>(
                            message = error.message ?: "채팅 처리 중 오류가 발생했습니다.",
                            code = "CHAT_ERROR"
                        )
                    )
            )
        }
    }

    // POST /api/chat/stream - SSE 스트리밍 응답
    @PostMapping("/stream", produces = [MediaType.TEXT_EVENT_STREAM_VALUE])
    fun chatStream(
        @Valid @RequestBody request: ChatRequest
    ): Flux<String> {
        logger.info { "Stream chat request - conversationId: ${request.conversationId}" }

        return geminiService.streamGenerateContent(
            message = request.message,
            conversationId = request.conversationId,
        )
    }

    @GetMapping("/health")
    fun healthCheck(): Mono<ResponseEntity<ApiResponse<HealthStatus>>> {
        logger.debug { "Health check requested" }

        return geminiService.checkHealth()
            .map { isHealthy ->
                val status = HealthStatus(
                    status = if (isHealthy) "UP" else "DOWN",
                    geminiConfigured = isHealthy,
                    message = if(isHealthy) "Gemini API is operational" else "Gemini API is not available"
                ) 
                ResponseEntity.ok(ApiResponse.success(status))
            }
    }
}

data class HealthStatus(
    val status: String,
    val geminiConfigured: Boolean,
    val message: String
)