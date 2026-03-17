package com.mcp.calendar.exception

import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import java.time.LocalDateTime


@RestControllerAdvice
class GlobalExceptionHandler {

    private val logger = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    // EventNotFoundException - 404 Not Found
    @ExceptionHandler(EventNotFoundException::class)
    fun handleEventNotFoundException(
        e: EventNotFoundException
    ): ResponseEntity<ErrorResponse> {
        logger.warn("EventNotFoundException: {}", e.message)

        val errorResponse = ErrorResponse(
            timestamp = LocalDateTime.now(),
            status = HttpStatus.NOT_FOUND.value(),
            error = HttpStatus.NOT_FOUND.reasonPhrase,
            message = e.message ?: "일정을 찾을 수 없습니다."
        )

        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(errorResponse)
    }

    // TransactionNotFoundException - 404 Not Found
    @ExceptionHandler(TransactionNotFoundException::class)
    fun handleTransactionNotFoundException(e: TransactionNotFoundException): ResponseEntity<ErrorResponse> {
        logger.warn("TransactionNotFoundException: {}", e.message)

        val errorResponse = ErrorResponse(
            timestamp = LocalDateTime.now(),
            status = HttpStatus.NOT_FOUND.value(),
            error = HttpStatus.NOT_FOUND.reasonPhrase,
            message = e.message ?: "거래 내역을 찾을 수 없습니다."
        )

        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(errorResponse)
    }

    // IllegalArgumentException - 400 Bad Request
    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgumentException(
        e: IllegalArgumentException
    ): ResponseEntity<ErrorResponse> {
        logger.warn("IllegalArgumentException: {}", e.message)

        val errorResponse = ErrorResponse(
            timestamp = LocalDateTime.now(),
            status = HttpStatus.BAD_REQUEST.value(),
            error = HttpStatus.BAD_REQUEST.reasonPhrase,
            message = e.message ?: "잘못된 요청입니다."
        )

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(errorResponse)
    }

    // MethodArgumentNotValidException - 400 Bad Request (유효성 검사 실패)
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationException(
        e: MethodArgumentNotValidException
    ): ResponseEntity<ErrorResponse> {
        logger.warn("MethodArgumentNotValidException: {}", e.message)

        val errors = e.bindingResult.allErrors
            .joinToString(", ") { error ->
                val fieldName = (error as? FieldError)?.field ?: "unknown"
                val errorMessage = error.defaultMessage ?: "유효하지 않은 값"
                "$fieldName: $errorMessage"
            }

        val errorResponse = ErrorResponse(
            timestamp = LocalDateTime.now(),
            status = HttpStatus.BAD_REQUEST.value(),
            error = HttpStatus.BAD_REQUEST.reasonPhrase,
            message = errors
        )

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(errorResponse)
    }

    // GeminiException - Gemini API 관련 에러
    @ExceptionHandler(GeminiException::class)
    fun handleGeminiException(
        e: GeminiException
    ): ResponseEntity<ErrorResponse> {
        val httpStatus = when (e) {
            is GeminiAuthException -> HttpStatus.UNAUTHORIZED
            is GeminiRateLimitException -> HttpStatus.TOO_MANY_REQUESTS
            is GeminiBlockedException -> HttpStatus.FORBIDDEN
            is GeminiConfigurationException -> HttpStatus.SERVICE_UNAVAILABLE
            else -> HttpStatus.INTERNAL_SERVER_ERROR
        }
        logger.warn("GeminiException [{}]: {}", httpStatus.value(), e.message)

        val errorResponse = ErrorResponse(
            timestamp = LocalDateTime.now(),
            status = httpStatus.value(),
            error = httpStatus.reasonPhrase,
            message = e.message ?: "AI 서비스 오류가 발생했습니다."
        )

        return ResponseEntity
            .status(httpStatus)
            .body(errorResponse)
    }

    // 그 외 모든 에러 - 500 Internal Server Error
    @ExceptionHandler(Exception::class)
    fun handleGenericException(
        e: Exception
    ): ResponseEntity<ErrorResponse> {
        logger.error("Unhandled exception: ", e)

        val errorResponse = ErrorResponse(
            timestamp = LocalDateTime.now(),
            status = HttpStatus.INTERNAL_SERVER_ERROR.value(),
            error = HttpStatus.INTERNAL_SERVER_ERROR.reasonPhrase,
            message = "서버 내부 오류가 발생했습니다."
        )

        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(errorResponse)
    }


}

// 에러 응답 DTO
data class ErrorResponse(
    val timestamp: LocalDateTime,
    val status: Int,
    val error: String,
    val message: String
)