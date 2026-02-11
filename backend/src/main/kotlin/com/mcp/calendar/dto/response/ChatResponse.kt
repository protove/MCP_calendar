package com.mcp.calendar.dto.response

import java.time.LocalDateTime

data class ChatResponse(
    val message: String,
    val conversationId: String,
    val timestamp: LocalDateTime = LocalDateTime.now()
)