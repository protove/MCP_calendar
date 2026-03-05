package com.mcp.calendar.mcp

import com.mcp.calendar.dto.request.GeminiFunctionDeclaration
import com.mcp.calendar.dto.request.GeminiTool
import mu.KotlinLogging
import org.springframework.stereotype.Component

private val logger = KotlinLogging.logger {}

/**
 * MCP 도구를 Gemini Function Calling 형식으로 변환하는 어댑터
 *
 * MCP inputSchema (JSON Schema) → Gemini FunctionDeclaration (OpenAPI schema)
 * 두 형식이 유사하므로 직접 매핑합니다.
 */
@Component
class GeminiFunctionAdapter(
    private val toolRegistry: McpToolRegistry
) {

    // 도구 목록은 런타임에 변경되지 않으므로 캐싱
    private val cachedTools: List<GeminiTool> by lazy {
        val declarations = toolRegistry.listTools().map { toolInfo ->
            GeminiFunctionDeclaration(
                name = toolInfo.name,
                description = toolInfo.description,
                parameters = toolInfo.inputSchema
            )
        }
        logger.info { "Gemini 도구 변환 완료 (캐싱됨): ${declarations.size}개" }
        listOf(GeminiTool(functionDeclarations = declarations))
    }

    fun getGeminiTools(): List<GeminiTool> = cachedTools
}
