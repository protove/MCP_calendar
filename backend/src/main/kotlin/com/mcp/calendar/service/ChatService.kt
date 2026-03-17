package com.mcp.calendar.service

import com.mcp.calendar.config.SystemPrompt
import com.mcp.calendar.dto.request.*
import com.mcp.calendar.dto.response.ChatResponse
import com.mcp.calendar.dto.response.ChatStreamEvent
import com.mcp.calendar.mcp.GeminiFunctionAdapter
import com.mcp.calendar.mcp.McpToolRegistry
import mu.KotlinLogging
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.scheduler.Schedulers
import java.time.Duration
import java.time.LocalDateTime
import java.util.UUID

private val logger = KotlinLogging.logger {}

/**
 * 채팅 오케스트레이션 서비스
 *
 * Gemini Function Calling을 활용하여 사용자 메시지 → 도구 호출 → 응답 생성을 수행합니다.
 * 최대 10회의 도구 호출 루프를 지원합니다.
 */
@Service
class ChatService(
    private val geminiService: GeminiService,
    private val toolRegistry: McpToolRegistry,
    private val functionAdapter: GeminiFunctionAdapter,
    private val conversationService: ConversationService
) {

    companion object {
        private const val MAX_TOOL_ITERATIONS = 10
        private val BLOCK_TIMEOUT = Duration.ofSeconds(30)
    }

    fun chat(userId: Long, message: String, conversationId: String?): ChatResponse {
        val convId = conversationId ?: generateConversationId()

        logger.info { "Chat 시작 - userId: $userId, conversationId: $convId" }

        // 1. 대화 기록 로드
        val history = conversationService.getHistory(convId).toMutableList()

        // 2. 사용자 메시지 추가
        history.add(
            GeminiContent(
                role = "user",
                parts = listOf(GeminiPart(text = message))
            )
        )

        // 3. 시스템 프롬프트 생성 (role 없이 — Gemini system_instruction 스펙)
        val systemInstruction = GeminiContent(
            role = null,
            parts = listOf(GeminiPart(text = SystemPrompt.generateWithCurrentDate("사용자")))
        )

        // 4. Gemini 도구 목록 가져오기
        val geminiTools = functionAdapter.getGeminiTools()

        // 5. Function Calling 루프
        val contents = history.toMutableList()
        var iteration = 0
        val toolsUsed = mutableListOf<String>()

        while (iteration < MAX_TOOL_ITERATIONS) {
            iteration++

            // Gemini API 호출
            val request = GeminiRequest.withTools(
                contents = contents,
                tools = geminiTools,
                systemInstruction = systemInstruction,
                config = GenerationConfig.DEFAULT
            )

            val response = geminiService.generateContentRaw(request).block(BLOCK_TIMEOUT)
                ?: throw RuntimeException("Gemini API 응답이 null입니다.")

            if (response.isBlocked()) {
                val reason = response.getBlockReason()
                logger.warn { "응답 차단됨: $reason" }
                throw RuntimeException("응답이 안전 정책에 의해 차단되었습니다: $reason")
            }

            // Function Call 확인
            if (response.hasFunctionCall()) {
                val functionCall = response.getFunctionCall() ?: continue
                logger.info { "Function Call 감지 (반복 $iteration): ${functionCall.name}" }

                // 사용된 도구 추적
                toolsUsed.add(functionCall.name)

                // 모델의 function call 응답을 contents에 추가
                contents.add(
                    GeminiContent(
                        role = "model",
                        parts = listOf(GeminiPart(functionCall = functionCall))
                    )
                )

                // MCP 도구 실행
                val toolResult = executeToolCall(functionCall, userId)

                // function response를 contents에 추가 (success/failure 상태 포함)
                contents.add(
                    GeminiContent(
                        role = "user",
                        parts = listOf(
                            GeminiPart(
                                functionResponse = FunctionResponse(
                                    name = functionCall.name,
                                    response = mapOf(
                                        "success" to toolResult.success,
                                        "result" to toolResult.message
                                    )
                                )
                            )
                        )
                    )
                )

                logger.debug { "도구 실행 완료: ${functionCall.name}, 성공: ${toolResult.success}, 결과 길이: ${toolResult.message.length}" }

                // 루프 계속 — Gemini에게 결과를 전달하여 최종 응답 또는 추가 도구 호출을 받음
                continue
            }

            // Function Call이 아닌 경우: 텍스트 응답 추출
            val responseText = response.getText()
                ?: throw RuntimeException("Gemini 응답에서 텍스트를 추출할 수 없습니다.")

            // 모델 응답을 contents에 추가
            contents.add(
                GeminiContent(
                    role = "model",
                    parts = listOf(GeminiPart(text = responseText))
                )
            )

            // 6. 대화 기록 저장
            conversationService.saveHistory(convId, contents)

            val callCount = toolsUsed.size
            logger.info { "Chat 완료 - conversationId: $convId, 도구 호출 횟수: $callCount" }

            return ChatResponse(
                message = responseText,
                conversationId = convId,
                timestamp = LocalDateTime.now(),
                toolsUsed = toolsUsed.ifEmpty { null },
                functionCallCount = if (callCount > 0) callCount else null
            )
        }

        // 최대 반복 초과
        val callCount = toolsUsed.size
        logger.warn { "최대 도구 호출 횟수($MAX_TOOL_ITERATIONS) 초과 - conversationId: $convId" }
        conversationService.saveHistory(convId, contents)

        return ChatResponse(
            message = "요청을 처리하는 데 너무 많은 단계가 필요합니다. 요청을 간단히 나누어 다시 시도해 주세요.",
            conversationId = convId,
            timestamp = LocalDateTime.now(),
            toolsUsed = toolsUsed.ifEmpty { null },
            functionCallCount = if (callCount > 0) callCount else null
        )
    }

    /**
     * SSE 스트리밍 채팅 — Function Calling 루프를 포함하여 각 단계를 이벤트로 발행합니다.
     */
    fun chatStream(userId: Long, message: String, conversationId: String?): Flux<ChatStreamEvent> {
        return Flux.create<ChatStreamEvent> { sink ->
            try {
                val convId = conversationId ?: generateConversationId()
                logger.info { "Stream chat 시작 - userId: $userId, conversationId: $convId" }

                // 1. 대화 기록 로드
                val history = conversationService.getHistory(convId).toMutableList()

                // 2. 사용자 메시지 추가
                history.add(
                    GeminiContent(
                        role = "user",
                        parts = listOf(GeminiPart(text = message))
                    )
                )

                // 3. 시스템 프롬프트 생성 (role 없이 — Gemini system_instruction 스펙)
                val systemInstruction = GeminiContent(
                    role = null,
                    parts = listOf(GeminiPart(text = SystemPrompt.generateWithCurrentDate("사용자")))
                )

                // 4. Gemini 도구 목록
                val geminiTools = functionAdapter.getGeminiTools()

                // 5. Function Calling 루프
                val contents = history.toMutableList()
                var iteration = 0
                val toolsUsed = mutableListOf<String>()

                while (iteration < MAX_TOOL_ITERATIONS) {
                    iteration++

                    // thinking 이벤트 발행
                    sink.next(ChatStreamEvent.thinking(
                        if (iteration == 1) "생각하고 있습니다..." else "추가 정보를 처리하고 있습니다..."
                    ))

                    // Gemini API 호출
                    val request = GeminiRequest.withTools(
                        contents = contents,
                        tools = geminiTools,
                        systemInstruction = systemInstruction,
                        config = GenerationConfig.DEFAULT
                    )

                    val response = geminiService.generateContentRaw(request).block(BLOCK_TIMEOUT)
                    if (response == null) {
                        sink.next(ChatStreamEvent.error("Gemini API 응답이 null입니다."))
                        sink.next(ChatStreamEvent.done(convId))
                        sink.complete()
                        return@create
                    }

                    if (response.isBlocked()) {
                        val reason = response.getBlockReason()
                        sink.next(ChatStreamEvent.error("응답이 안전 정책에 의해 차단되었습니다: $reason"))
                        sink.next(ChatStreamEvent.done(convId))
                        sink.complete()
                        return@create
                    }

                    // Function Call 확인
                    if (response.hasFunctionCall()) {
                        val functionCall = response.getFunctionCall() ?: continue
                        val toolName = functionCall.name
                        logger.info { "Stream Function Call 감지 (반복 $iteration): $toolName" }

                        toolsUsed.add(toolName)

                        // tool_call 이벤트 발행
                        sink.next(ChatStreamEvent.toolCall(toolName, "${toolName} 도구를 호출하고 있습니다..."))

                        // 모델의 function call 응답을 contents에 추가
                        contents.add(
                            GeminiContent(
                                role = "model",
                                parts = listOf(GeminiPart(functionCall = functionCall))
                            )
                        )

                        // MCP 도구 실행
                        val toolResult = executeToolCall(functionCall, userId)

                        // tool_result 이벤트 발행
                        sink.next(ChatStreamEvent.toolResult(
                            toolName,
                            if (toolResult.success) "도구 실행이 완료되었습니다." else "도구 실행 실패: ${toolResult.message}"
                        ))

                        // function response를 contents에 추가 (success/failure 상태 포함)
                        contents.add(
                            GeminiContent(
                                role = "user",
                                parts = listOf(
                                    GeminiPart(
                                        functionResponse = FunctionResponse(
                                            name = functionCall.name,
                                            response = mapOf(
                                                "success" to toolResult.success,
                                                "result" to toolResult.message
                                            )
                                        )
                                    )
                                )
                            )
                        )

                        continue
                    }

                    // 텍스트 응답

                    val responseText = response.getText()
                    if (responseText == null) {
                        sink.next(ChatStreamEvent.error("응답에서 텍스트를 추출할 수 없습니다."))
                        sink.next(ChatStreamEvent.done(convId))
                        sink.complete()
                        return@create
                    }

                    // 모델 응답을 contents에 추가
                    contents.add(
                        GeminiContent(
                            role = "model",
                            parts = listOf(GeminiPart(text = responseText))
                        )
                    )

                    // 대화 기록 저장
                    conversationService.saveHistory(convId, contents)

                    // content 이벤트 발행
                    sink.next(ChatStreamEvent.content(responseText))

                    // done 이벤트 발행
                    sink.next(ChatStreamEvent.done(convId))
                    sink.complete()

                    logger.info { "Stream chat 완료 - conversationId: $convId, 도구 호출 횟수: ${toolsUsed.size}" }
                    return@create
                }

                // 최대 반복 초과
                logger.warn { "Stream 최대 도구 호출 횟수($MAX_TOOL_ITERATIONS) 초과 - conversationId: $convId" }
                conversationService.saveHistory(convId, contents)
                sink.next(ChatStreamEvent.content("요청을 처리하는 데 너무 많은 단계가 필요합니다. 요청을 간단히 나누어 다시 시도해 주세요."))
                sink.next(ChatStreamEvent.done(convId))
                sink.complete()

            } catch (e: Exception) {
                logger.error(e) { "Stream chat 오류: ${e.message}" }
                sink.next(ChatStreamEvent.error(e.message ?: "채팅 처리 중 오류가 발생했습니다."))
                sink.complete()
            }
        }.subscribeOn(Schedulers.boundedElastic())
    }

    data class ToolExecutionResult(
        val success: Boolean,
        val message: String
    )

    @Suppress("UNCHECKED_CAST")
    private fun executeToolCall(functionCall: FunctionCall, userId: Long): ToolExecutionResult {
        val toolName = functionCall.name
        val arguments = functionCall.args ?: emptyMap()

        val tool = toolRegistry.getTool(toolName)
        if (tool == null) {
            logger.warn { "등록되지 않은 도구: $toolName" }
            return ToolExecutionResult(false, "오류: 등록되지 않은 도구입니다 — $toolName")
        }

        return try {
            logger.info { "도구 실행 시작: $toolName, 인자: $arguments" }
            val result = tool.execute(arguments, userId)
            val resultText = result.content.joinToString("\n") { it.text }
            if (result.isError) {
                logger.warn { "도구 실행 오류: $toolName — $resultText" }
                ToolExecutionResult(false, resultText)
            } else {
                logger.info { "도구 실행 성공: $toolName" }
                ToolExecutionResult(true, resultText)
            }
        } catch (e: IllegalArgumentException) {
            logger.warn { "도구 파라미터 오류: $toolName — ${e.message}" }
            ToolExecutionResult(false, "파라미터 오류: ${e.message}")
        } catch (e: Exception) {
            logger.error(e) { "도구 실행 실패: $toolName" }
            ToolExecutionResult(false, "실행 오류: ${e.message}")
        }
    }

    private fun generateConversationId(): String {
        return "conv_${UUID.randomUUID().toString().replace("-", "").take(16)}"
    }
}
