package com.mcp.calendar.mcp.tool

import com.mcp.calendar.mcp.protocol.CallToolResult
import com.mcp.calendar.mcp.protocol.ToolInfo
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException

// Mcp interface
interface McpTool {
    val name: String
    val description: String
    val inputSchema: Map<String, Any?>
    fun execute(arguments: Map<String, Any?>): CallToolResult
    fun toToolInfo(): ToolInfo = ToolInfo(name, description, inputSchema)
}

// 인자 타입 변환 헬퍼
fun Map<String, Any?>.getString(key: String): String? =
    this[key]?.toString()

fun Map<String, Any?>.requireString(key: String): String =
    getString(key) ?: throw IllegalArgumentException("필수 파라미터 '$key'가 누락되었습니다.")

fun Map<String, Any?>.getLong(key: String): Long? =
    (this[key] as? Number)?.toLong()

fun Map<String, Any?>.requireLong(key: String): Long =
    getLong(key) ?: throw IllegalArgumentException("필수 파라미터 '$key'가 누락되었습니다.")

fun Map<String, Any?>.getInt(key: String): Int? =
    (this[key] as? Number)?.toInt()

fun Map<String, Any?>.requireInt(key: String): Int =
    getInt(key) ?: throw IllegalArgumentException("필수 파라미터 '$key'가 누락되었습니다.")

fun Map<String, Any?>.getBigDecimal(key: String): BigDecimal? =
    this[key]?.let { BigDecimal(it.toString()) }

fun Map<String, Any?>.requireBigDecimal(key: String): BigDecimal =
    getBigDecimal(key) ?: throw IllegalArgumentException("필수 파라미터 '$key'가 누락되었습니다.")

fun Map<String, Any?>.getBoolean(key: String): Boolean? =
    when (val v = this[key]) {
        is Boolean -> v
        is String -> v.toBooleanStrictOrNull()
        else -> null
    }

fun Map<String, Any?>.getLocalDateTime(key: String): LocalDateTime? =
    getString(key)?.let { raw ->
        try {
            LocalDateTime.parse(raw, DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        } catch (e: DateTimeParseException) {
            throw IllegalArgumentException(
                "'$key' 형식이 올바르지 않습니다. (예: 2025-01-15T10:00:00)"
            )
        }
    }

fun Map<String, Any?>.requireLocalDateTime(key: String): LocalDateTime =
    getLocalDateTime(key)
        ?: throw IllegalArgumentException("필수 파라미터 '$key'가 누락되었습니다.")

fun Map<String, Any?>.getLocalDate(key: String): LocalDate? =
    getString(key)?.let { raw ->
        try {
            LocalDate.parse(raw, DateTimeFormatter.ISO_LOCAL_DATE)
        } catch (e: DateTimeParseException) {
            throw IllegalArgumentException(
                "'$key' 형식이 올바르지 않습니다. (예: 2025-01-15)"
            )
        }
    }

fun Map<String, Any?>.requireLocalDate(key: String): LocalDate =
    getLocalDate(key)
        ?: throw IllegalArgumentException("필수 파라미터 '$key'가 누락되었습니다.")


// JSON Schema 빌더 헬퍼
fun stringProperty(
    description: String,
    enum: List<String>? = null,
    format: String? = null
): Map<String, Any?> = buildMap {
    put("type", "string")
    put("description", description)
    format?.let { put("format", it) }
    enum?.let { put("enum", it) }
}

fun numberProperty(description: String, type: String = "number"): Map<String, Any?> =
    mapOf("type" to type, "description" to description)

fun booleanProperty(description: String): Map<String, Any?> =
    mapOf("type" to "boolean", "description" to description)

fun objectSchema(
    properties: Map<String, Map<String, Any?>>,
    required: List<String> = emptyList()
): Map<String, Any?> = buildMap {
    put("type", "object")
    put("properties", properties)
    if (required.isNotEmpty()) put("required", required)
}