package com.mcp.calendar.exception

open class GeminiException(
    message: String,
    cause: Throwable? = null
) : RuntimeException(message, cause)

class GeminiAuthException(message: String) : GeminiException(message)
class GeminiRateLimitException(message: String) : GeminiException(message)
class GeminiBlockedException(message: String) : GeminiException(message)
class GeminiConfigurationException(message: String) : GeminiException(message)