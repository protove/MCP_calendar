package com.mcp.calendar.controller

import com.mcp.calendar.dto.request.ChatRequest
import com.mcp.calendar.dto.response.ApiResponse
import com.mcp.calendar.dto.response.ChatResponse
import com.mcp.calendar.dto.response.ChatStreamEvent
import com.mcp.calendar.security.UserPrincipal
import com.mcp.calendar.service.ChatService
import com.mcp.calendar.service.ConversationService
import com.mcp.calendar.service.GeminiService
import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.validation.Valid
import mu.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.http.codec.ServerSentEvent
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/chat")
class ChatController(
    private val chatService: ChatService,
    private val geminiService: GeminiService,
    private val conversationService: ConversationService,
    private val objectMapper: ObjectMapper
){
    // POST /api/chat - 일반 채팅 응답 (Function Calling 포함)
    @PostMapping
    fun chat(
        @AuthenticationPrincipal principal: UserPrincipal,
        @Valid @RequestBody request: ChatRequest
    ): ResponseEntity<ApiResponse<ChatResponse>> {
        logger.info { "Chat request received - userId: ${principal.id}, conversationId: ${request.conversationId}" }

        return try {
            val response = chatService.chat(principal.id, request.message, request.conversationId)
            ResponseEntity.ok(ApiResponse.success(response))
        } catch (e: Exception) {
            logger.error(e) { "Chat error: ${e.message}" }
            ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                    ApiResponse.error<ChatResponse>(
                        message = e.message ?: "채팅 처리 중 오류가 발생했습니다.",
                        code = "CHAT_ERROR"
                    )
                )
        }
    }

    // POST /api/chat/stream - SSE 스트리밍 응답 (Function Calling 포함)
    @PostMapping("/stream", produces = [MediaType.TEXT_EVENT_STREAM_VALUE])
    fun chatStream(
        @AuthenticationPrincipal principal: UserPrincipal,
        @Valid @RequestBody request: ChatRequest
    ): Flux<ServerSentEvent<String>> {
        logger.info { "Stream chat request - userId: ${principal.id}, conversationId: ${request.conversationId}" }

        return chatService.chatStream(principal.id, request.message, request.conversationId)
            .map { event ->
                ServerSentEvent.builder<String>()
                    .data(objectMapper.writeValueAsString(event))
                    .build()
            }
            .concatWith(
                Flux.just(
                    ServerSentEvent.builder<String>()
                        .data("[DONE]")
                        .build()
                )
            )
            .onErrorResume { e ->
                logger.error(e) { "Stream error: ${e.message}" }
                val errorEvent = ChatStreamEvent.error(e.message ?: "스트리밍 중 오류가 발생했습니다.")
                Flux.just(
                    ServerSentEvent.builder<String>()
                        .data(objectMapper.writeValueAsString(errorEvent))
                        .build(),
                    ServerSentEvent.builder<String>()
                        .data("[DONE]")
                        .build()
                )
            }
    }

    // DELETE /api/chat/{conversationId} - 대화 기록 삭제
    @DeleteMapping("/{conversationId}")
    fun clearConversation(
        @AuthenticationPrincipal principal: UserPrincipal,
        @PathVariable conversationId: String
    ): ResponseEntity<ApiResponse<Unit>> {
        logger.info { "Clear conversation: $conversationId - userId: ${principal.id}" }
        conversationService.clearHistory(conversationId)
        return ResponseEntity.ok(ApiResponse.success(Unit))
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