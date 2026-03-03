package com.mcp.calendar.dto.response

import com.fasterxml.jackson.annotation.JsonInclude

/**
 * SSE 스트리밍 이벤트 DTO
 *
 * type:
 *  - thinking: Gemini API 호출 중 (사고 중)
 *  - tool_call: Function Call 감지 (도구 호출 시작)
 *  - tool_result: 도구 실행 결과
 *  - content: 최종 텍스트 응답
 *  - done: 스트리밍 완료
 *  - error: 오류 발생
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
data class ChatStreamEvent(
    val type: String,
    val data: String,
    val toolName: String? = null,
    val conversationId: String? = null
) {
    companion object {
        fun thinking(message: String) = ChatStreamEvent(type = "thinking", data = message)

        fun toolCall(toolName: String, message: String) =
            ChatStreamEvent(type = "tool_call", data = message, toolName = toolName)

        fun toolResult(toolName: String, message: String) =
            ChatStreamEvent(type = "tool_result", data = message, toolName = toolName)

        fun content(text: String) = ChatStreamEvent(type = "content", data = text)

        fun done(conversationId: String) =
            ChatStreamEvent(type = "done", data = "", conversationId = conversationId)

        fun error(message: String) = ChatStreamEvent(type = "error", data = message)
    }
}
