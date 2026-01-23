package com.mcp.calendar.dto.response

import com.fasterxml.jackson.annotation.JsonInclude
import java.time.LocalDateTime

// API 공통 응답 DTO
@JsonInclude(JsonInclude.Include.NON_NULL)
data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val error: ErrorDetails? = null,
    val timestamp: String = LocalDateTime.now().toString()
) {
    companion object {
        // 성공 응답 (데이터 포함)
        fun <T> success(data: T): ApiResponse<T> {
            return ApiResponse(success = true, data = data, error = null)
        }

        // 성공 응답 (데이터 없음)
        fun <T> successNoContent(): ApiResponse<T> {
            return ApiResponse(success = true, data = null, error = null)
        }

        // 에러 응답
        fun <T> error(message: String, code: String): ApiResponse<T> {
            return ApiResponse(success = false, data = null, error = ErrorDetails(code, message))
        }
    }
}

// 에러 상세 정보
data class ErrorDetails(
    val code: String,
    val message: String,
    val details: Map<String, Any>? = null
)