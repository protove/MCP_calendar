package com.mcp.calendar.dto.response

import com.fasterxml.jackson.annotation.JsonInclude
import java.time.LocalDateTime

@JsonInclude(JsonInclude.Include.NON_NULL)
data class ChatResponse(
    val message: String,
    val conversationId: String,
    val timestamp: LocalDateTime = LocalDateTime.now(),
    val toolsUsed: List<String>? = null,
    val functionCallCount: Int? = null
)