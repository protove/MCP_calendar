package com.mcp.calendar.dto.response

import com.fasterxml.jackson.annotation.JsonInclude
import java.time.LocalDateTime

@JsonInclude(JsonInclude.Include.NON_NULL)
data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val error: ErrorDetails? = null,
    val timestamp: String = LocalDateTime.now().toString()
){
    companion object {
        fun <T> success(data: T? = null): ApiResponse<T> {
            return ApiResponse(success = true, data = data, error = null)
        }

        fun <T> error(message: String, code: String): ApiResponse<T> {
            return ApiResponse(success = false, data = null, error = ErrorDetails(code, message))
        }

        fun <T> sucessNoContent(): ApiResponse<T> {
            return ApiResponse(success = true, data = null, error = null)
        }
    }
}

data class ErrorDetails(
    val code: String,
    val message: String,
    val details: Map<String, Any>? = null
)