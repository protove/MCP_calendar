package com.mcp.calendar.model

import java.time.LocalDateTime

data class User(
    val id: Long = 0,
    val email: String,
    val password: String,
    val name: String,
    val role: UserRole = UserRole.USER,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)

enum class UserRole {
    USER, ADMIN;

    companion object {
        fun fromString(value: String): UserRole =
            entries.find { it.name.equals(value, ignoreCase = true) }
                ?: throw IllegalArgumentException("알 수 없는 역할: $value")
    }
}