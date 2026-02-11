package com.mcp.calendar.controller

import com.mcp.calendar.config.GeminiProperties
import com.mcp.calendar.dto.request.GeminiContent
import com.mcp.calendar.dto.request.GeminiPart
import com.mcp.calendar.dto.response.Candidate
import com.mcp.calendar.dto.response.GeminiResponse
import com.mcp.calendar.dto.response.GeminiStreamChunk
import com.mcp.calendar.dto.response.PromptFeedback
import com.mcp.calendar.exception.GeminiBlockedException
import com.mcp.calendar.exception.GeminiConfigurationException
import com.mcp.calendar.exception.GeminiException
import io.mockk.every
import io.mockk.junit5.MockKExtension
import io.mockk.mockk
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@ExtendWith(MockKExtension::class)
@DisplayName("GeminiService 단위 테스트")
class GeminiServiceTest {

    private lateinit var geminiWebClient: WebClient
    private lateinit var geminiProperties: GeminiProperties
    private lateinit var geminiService: GeminiService

    private lateinit var requestBodyUriSpec: WebClient.RequestBodyUriSpec
    private lateinit var responseSpec: WebClient.ResponseSpec

    @BeforeEach
    fun setup() {
        geminiWebClient = mockk()
        geminipProperties = mockk()
        requestBodyUriSpec = mockk()
        responseSpec = mockk()

        geminiService = GeminiService(geminiWebClient, geminiProperties)

        every { geminiWebClient.post() } returns requestBodyUriSpec
        every { requestBodyUriSpec.uri(any<String>()) } returns requestBodyUriSpec
        every { requestBodyUriSpec.contentType(any()) } returns requestBodyUriSpec
        every { requestBodyUriSpec.bodyValue(any()) } returns requestBodyUriSpec
        every { requestBodyUriSpec.retrieve() } returns responseSpec
    }

    // generateContent 테스트
    @Nested
    @DisplayName("generateContent 테스트")
    inner class GenerateContentTest {

        @Test
        @DisplayName("성공 - 정상 응답 반환")
        fun 'generateContent - 성공'() {
            //given
            val message = "안녕하세요"
            val conversationId = "conv-123"
            val geminiResponse = createSuccessResponse("AI 응답입니다.")

            every { geminiProperties.isConfigured() } returns true
            every { geminiProperties.getGenerateContentUrl() } returns "https://test-url/generateContent"
            every { responseSpec.bodyToMono(GeminiResponse::class.java) } returns Mono.just(geminiResponse)

            val result = geminiService.generateContent(message, conversationId).block()!!

            assertThat(result.message).isEqualTo("AI 응답입니다.")
            assertThat(result.conversationId).isEqualTo(conversationId)
            assertThat(result.timestamp).isNotNull()

            verify(exactly = 1) { geminiWebClient.post() }
        }

        @Test
        @DisplayName("성공 - conversationId 미전달 시 자동 생성")
        fun 'generateContent - conversationId 자동 생성'() {

            val geminiResponse = createSuccessResponse("응답입니다.")

            every { geminiProperties.isConfigured() } returns true
            every { geminiProperties.getGenerateContentUrl() } returns "https://test-url/generateContent"
            every { responseSpec.bodyToMono(GeminiResponse::class.java) } returns Mono.just(geminiResponse)

            val result = geminiService.generateContent("test").block()!!

            assertThat(result.conversationId).startsWith("conv_")
            assertThat(result.message).isEqualTo("응답입니다.")
        }

        @Test
        @DisplayName("실패 - API Key 미설정 시 GeminiConfigurationException")
        fun 'generateContent - API Key 미설정'() {

            every { geminiProperties.isConfigured() } returns false

            assertThatThrownBy { geminiService.generateContent("test").block() }
                .isInstanceOf(GeminiConfigurationException::class.java)
                .hasMessageContaining("Gemini API Key가 설정되지 않았습니다.")
        }

        @Test
        @DisplayName("실패 - 응답 차단 시 GeminiBlockedException")
        fun 'generateContent - 응답 차단'() {

            val blockedResponse = GeminiResponse(
                candidates = listOf(
                    Candidate(content = null, finishReason = "SAFETY", index = null, safetyRatings = null)
                ),
                promptFeedback = null
            )

            every { geminiProperties.isConfigured() } returns true
            every { geminiProperties.getGenerateContentUrl() } returns "https://test-url/generateContent"
            every { responseSpec.bodyToMono(GeminiResponse::class.java) } returns Mono.just(blockedResponse)

            assertThatThrownBy { geminiService.generateContent("test, conv_test").block() }
                .isInstanceOf(GeminiBlockedException::class.java)
                .hasMessageContaining("안전 정책에 의해 차단")
        }

        @Test
        @DisplayName("실패 - promptFeedback.blockReason 으로 차단")
        fun 'generateContent - promptFeedback 차단'() {
            
            val blockedResponse = GeminiResponse(
                candidates = listOf(
                    Candidate = null,
                    promptFeedback = PromptFeedback(blockReason = "SAFETY")
                )
            )

            every { geminiProperties.isConfigured() } returns true
            every { geminiProperties.getGenerateContentUrl() } returns "https://test-url/generateContent"
            every { responseSpec.bodyToMono(GeminiResponse::class.java) } returns Mono.just(blockedResponse)

            assertThatThrownBy { geminiService.generateContent("test, conv_test").block() }
                .isInstanceOf(GeminiBlockedException::class.java)
        }

        @Test
        @DisplayName("실패 - 응답 텍스트 없을 때 GeminiException")
        fun 'generateContent - 응답 텍스트 없음'() {

            val emptyResponse = GeminiResponse(
                candidates = listOf(
                    Candidate(content = GeminiContent(role = "model", parts = emptyList()),
                        finishReason = "STOP",
                        index = null,
                        safetyRatings = null
                    )
                )

                every { geminiProperties.isConfigured() } returns true
                every { geminiProperties.getGenerateContentUrl() } returns "https://test-url/generateContent"
                every { responseSpec.bodyToMono(GeminiResponse::class.java) } returns Mono.just(emptyResponse)

                assertThatThrownBy { geminiService.generateContent("test", "conv_test").block() }
                    .isInstanceOf(GeminiException::class.java)
                    .hasMessageContaining("응답 텍스트를 추출할 수 없습니다.")
            )
        }

        @Test
        @DisplayName("실패 - candidates가 null인 경우")
        fun 'generateContent - candidates null'() {
            val emptyResponse = GeminiResponse(candidates = null)

            every { geminiProperties.isConfigured() } returns true
            every { geminiProperties.getGenerateContentUrl() } returns "https://test-url/generateContent"
            every { responseSpec.bodyToMono(GeminiResponse::class.java) } returns Mono.just(emptyResponse)

            assertThatThrownBy { geminiService.generateContent("test", "conv_test").block() }
                .isInstanceOf(GeminiException::class.java)
                .hasMessageContaining("응답 텍스트를 추출할 수 없습니다.")
        }
    }

    // streamGenerateContent 테스트
    @Nested
    @DisplayName("streamGenerateContent 테스트")
    inner class StreamGenerateContentTest {

        @Test
        @DisplayName("성공 - 스트림 청크 반환")
        fun 'streamGenerateContent - 성공'() {

            val chunk1 = createStreamChunk("안녕")
            val chunk2 = createStreamChunk("하세요")

            every { geminiProperties.isConfigured() } returns true
            every { geminiProperties.getStreamGenerateContentUrl() } returns "https://test-url/stream"
            every { responseSpec.bodyToFlux(GeminiStreamChunk::class.java) } returns Flux.just(chunk1, chunk2)

            val result = geminiService.streamGenerateContent("test", "conv_test")
                .collectList()
                .block()!!
            
            assertThat(result).hasSize(2)
            assertThat(result).containsExactly("안녕", "하세요")

            verify(exactly = 1) { geminiWebClient.post() }
        }

        @Test
        @DisplayName("성공 - null 텍스트 청크 필터링")
        fun 'streamGenerateContent - null 텍스트 필터링'() {

            val chunk1 = createStreamChunk("안녕")
            val nullChunk = GeminiStreamChunk(
                candidates = listOf(
                    Candidate(
                        content = GeminiContent(role = "model", parts = listOf(GeminiPart(text = null)))
                    )
                )
            )
            val chunk2 = createStreamChunk("하세요")

            every { geminiProperties.isConfigured() } returns true
            every { geminiProperties.getStreamGenerateContentUrl() } returns "https://test-url/stream"
            every { responseSpec.bodyToFlux(GeminiStreamChunk::class.java) } returns Flux.just(chunk1, nullChunk, chunk2)

            val result = geminiService.streamGenerateContent("test", "conv_test")
                .collectList()
                .block()!!
                
            assertThat(result).hasSize(2)
            assertThat(result).containsExactly("안녕", "하세요")
        }

        @Test
        @DisplayName("실패 - API Key 미설정 시 GeminiConfigurationException")
        fun 'streamGenerateContent - API Key 미설정'() {

            every { geminiProperties.isConfigured() } returns false

            assertThatThrownBy { geminiService.streamGenerateContent("test").collectList().block() }
                .isInstanceOf(GeminiConfigurationException::class.java)
                .hasMessageContaining("Gemini API Key가 설정되지 않았습니다.")
        }
    }

    //checkHealth 테스트
    @Nested
    @DisplayName("checkHealth 테스트")
    inner class CheckHealthTest {

        @Test
        @DisplayName("성공 - 설정됨 + 정상 응답 시 true")
        fun 'checkHealth - 성공 시 true'() {
            val geminiResponse = createSuccessResponse("pong")

            every { geminiProperties.isConfigured() } returns true
            every { geminiProperties.getGenerateContentUrl() } returns "https://test-url/generateContent"
            every { responseSpec.bodyToMono(GeminiResponse::class.java) } returns Mono.just(geminiResponse)

            val result = geminiService.checkHealth().block()!!

            assertThat(result).isTrue()
        }

        @Test
        @DisplayName("미설정 시 false 반환")
        fun 'checkHealth - 미설정 시 false'() {

            every { geminiProperties.isConfigured() } returns false

            val result = geminiService.checkHealth().block()!!

            assertThat(result).isFalse()
        }

        @Test
        @DisplayName("API 에러 시 false 반환")
        fun 'checkHealth - API 에러 시 false'() {

            every { geminiProperties.isConfigured() } returns true
            every { geminiProperties.getGenerateContentUrl() } returns "https://test-url/generateContent"
            every { responseSpec.bodyToMono(GeminiResponse::class.java) } returns Mono.error(RuntimeException("API error"))

            val result = geminiService.checkHealth().block()!!

            assertThat(result).isFalse()
        }
    }

    private fun createSuccessResponse(text: String): GeminiResponse {
        return GeminiResponse(
            candidates = listOf(
                Candidate(
                    content = GeminiContent(
                        role = "model",
                        parts = listOf(GeminiPart(text = text))
                    ),
                    finishReason = "STOP",
                    index = 0,
                    safetyRatings = null
                )
            )
        )
    }

    private fun createStreamChunk(text: String): GeminiStreamChunk {
        return GeminiStreamChunk(
            candidates = listOf(
                Candidate(
                    content = GeminiContent(
                        role = "model",
                        parts = listOf(GeminiPart(text = text))
                    )
                )
            )
        )
    }
}