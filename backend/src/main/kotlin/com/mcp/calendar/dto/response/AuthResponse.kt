package com.mcp.calendar.dto.response

import com.fasterxml.jackson.annotation.JsonInclude

@JsonInclude(JsonInclude.Include.NON_NULL)
data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val tokenType: String = "Bearer",
    val user: UserInfo
) {
    data class UserInfo(
        val id: Long,
        val email: String,
        val name: String,
        val role: String
    )
}
