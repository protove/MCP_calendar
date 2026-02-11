package com.mcp.calendar.controller

import com.mcp.calendar.dto.request.ChatRequest
import com.mcp.calendar.dto.response.ChatResponse
import com.mcp.calendar.exception.GeminiConfigurationException
import com.mcp.calendar.exception.GeminiException
import com.mcp.calendar.service.GeminiService
import io.mockk.every
import io.mockk.junit5.MockKExtension
import io.mockk.mockk
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.http.MediaType
import org.springframework.test.web.reactive.server.WebTestClient
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.LocalDateTime

@ExtendWith(MockKExtension::class)
@DisplayName("ChatController 단위 테스트")
class ChatControllerTest {
    
    private lateinit var webTestClient: WebTestClient
    private lateinit var geminiService: GeminiService

    private val now = LocalDateTime.now()

    @BeforeEach
    fun setup() {
        geminiService = mockk()
        val chatController = ChatController(geminiService)

        webTestClient = WebTestClient.bindToController(chatController).build()
    }

    // POST /api/chat 테스트
    @Nested
    @DisplayName("POST /api/chat")
    inner class ChatTest {

        @Test
        @DisplayName("성공 - 200 OK")
        fun '채팅 성공'() {
            
            val chatResponse = ChatResponse(
                message = "AI 응답입니다.",
                conversationId = "conv_test123",
                timestamp = now
            )

            every { geminiService.generateContent(any(), any(), any()) } returns Mono.just(chatResponse)

            webTestClient.post()
                .uri("/api/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(ChatRequest(message = "안녕하세요"))
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.success").isEqualTo(true)
                .jsonPath("$.data.message").isEqualTo("AI 응답입니다.")
                .jsonPath("$.data.conversationId").isEqualTo("conv_test123")
            
            verify(exactly = 1) { geminiService.generateContent(any(), any(), any()) }
        }

        @Test
        @DisplayName("성공 - conversationId 전달")
        fun 'conversationId 포함 요청'() {

            val chatResponse = ChatResponse(
                message = "AI 응답입니다.",
                conversationId = "conv_existing",
                timestamp = now
            )

            every { geminiService.generateContent(any(), any(), any()) } returns Mono.just(chatResponse)

            webTestClient.post()
                .uri("/api/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(ChatRequest(message = "안녕", conversationId = "conv_existing"))
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.data.conversationId").isEqualTo("conv_existing")
        }

        @Test
        @DisplayName("실패 - GeminiException 시 500 응답")
        fun 'GeminiException 시 500 응답'() {
            
            every { geminiService.generateContent(any(), any(), any()) } returns Mono.error(GeminiException("Gemini API 오류"))

            webTestClient.post()
                .uri("/api/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(ChatRequest(message = "안녕하세요"))
                .exchange()
                .expectStatus().isEqualTo(500)
                .expectBody()
                .jsonPath("$.success").isEqualTo(false)
                .jsonPath("$.error.code").isEqualTo("CHAT_ERROR")
                .jsonPath("$.error.message").isEqualTo("Gemini API 오류")
        }

        @Test
        @DisplayName("실패 - GeminiConfigurationException 시 500 응답")
        fun 'GeminiConfigurationException 시 500 응답'() {

            every { geminiService.generateContent(any(), any(), any()) } returns Mono.error(GeminiConfigurationException("Gemini API Key가 설정되지 않았습니다."))

            webTestClient.post()
                .uri("/api/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(ChatRequest(message = "안녕하세요"))
                .exchange()
                .expectStatus().isEqualTo(500)
                .expectBody()
                .jsonPath("$.success").isEqualTo(false)
                .jsonPath("$.error.message").isEqualTo("Gemini API Key가 설정되지 않았습니다.")
        }
    }

    // POST /api/chat/stream 테스트
    @Nested
    @DisplayName("POST /api/chat/stream")
    inner class ChatStreamTest {

        @Test
        @DisplayName("성공 - SSE 스트림 응답")
        fun '스트리밍 성공'() {

            every { geminiService.streamGenerateContent(any(), any(), any()) } returns Flux.just("안녕", "하세요")

            val result = webTestClient.post()
                .uri("/api/chat/stream")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(ChatRequest(message = "안녕하세요"))
                .exchange()
                .expectStatus().isOk
                .expectHeader().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM)
                .returnResult(String::class.java)
                .responseBody
                .collectList()
                .block()

            assertThat(result).isNotNull
            assertThat(result).containsExactly("안녕", "하세요")

            verify(exactly = 1) { geminiService.streamGenerateContent(any(), any(), any()) }
        }
    }

    // GET /api/chat/health 테스트
    @Nested
    @DisplayName("GET /api/chat/health")
    inner class HealthCheckTest {

        @Test
        @DisplayName("성공 - Gemini API UP")
        fun '헬스체크 UP'() {

            every { geminiService.checkHealth() } returns Mono.just(true)

            WebTestClient.get()
                .uri("/api/chat/health")
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.success").isEqualTo(true)
                .jsonPath("$.data.status").isEqualTo("UP")
                .jsonPath("$.data.geminiConfigured").isEqualTo(true)
                .jsonPath("$.data.message").isEqualTo("Gemini API is operational")
        }

        @Test
        @DisplayName("성공 - Gemini API DOWN")
        fun '헬스체크 DOWN'() {

            every { geminiService.checkHealth() } returns Mono.just(false)

            webTestClient.get()
                .uri("/api/chat/health")
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.success").isEqualTo(true)
                .jsonPath("$.data.status").isEqualTo("DOWN")
                .jsonPath("$.data.geminiConfigured").isEqualTo(false)
                .jsonPath("$.data.message").isEqualTo("Gemini API is not available")
        }
    }
}