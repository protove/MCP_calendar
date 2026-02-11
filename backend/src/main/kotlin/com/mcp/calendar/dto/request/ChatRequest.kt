package com.mcp.calendar.dto.request

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class ChatRequest(
    @field:NotBlank(message = "메세지는 필수입니다.")
    @field:Size(max = 10000, message = "메세지는 10000자 이내여야 합니다.")
    val message: String,

    val conversationId: String? = null
)