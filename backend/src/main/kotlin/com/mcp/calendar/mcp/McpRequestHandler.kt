package com.mcp.calendar.mcp

import com.fasterxml.jackson.databind.ObjectMapper
import com.mcp.calendar.mcp.protocol.*
import mu.KotlinLogging
import org.springframework.stereotype.Component

private val logger = KotlinLogging.logger {}

@Component
class McpRequestHandler(
    private val toolRegistry: McpToolRegistry,
    private val objectMapper: ObjectMapper
) {

    fun handleRequest(request: JsonRpcRequest): JsonRpcResponse? {
        logger.debug { "MCP 요청: method=${request.method}, id=${request.id}" }

        return try {
            when (request.method) {
                McpMethod.INITIALIZE -> handleInitialize(request)
                McpMethod.INITIALIZED -> { logger.info { "클라이언트 초기화 완료" }; null }
                McpMethod.PING -> JsonRpcResponse.success(request.id, emptyMap<String, Any>())
                McpMethod.TOOLS_LIST -> handleToolsList(request)
                McpMethod.TOOLS_CALL -> handleToolsCall(request)
                McpMethod.RESOURCES_LIST -> JsonRpcResponse.success(request.id, mapOf("resources" to emptyList<Any>()))
                McpMethod.PROMPTS_LIST -> JsonRpcResponse.success(request.id, mapOf("prompts" to emptyList<Any>()))
                else -> {
                    logger.warn { "알 수 없는 메서드: ${request.method}" }
                    if (request.isNotification) null
                    else JsonRpcResponse.error(request.id, JsonRpcErrorCodes.METHOD_NOT_FOUND,
                        "지원하지 않는 메서드: ${request.method}")
                }
            }
        } catch (e: Exception) {
            logger.error(e) { "요청 처리 오류: ${request.method}" }
            if (request.isNotification) null
            else JsonRpcResponse.error(request.id, JsonRpcErrorCodes.INTERNAL_ERROR,
                e.message ?: "내부 오류")
        }
    }

    private fun handleInitialize(request: JsonRpcRequest): JsonRpcResponse {
        logger.info { "MCP 초기화: tools=${toolRegistry.size()}개" }
        return JsonRpcResponse.success(request.id, InitializeResult(
            protocolVersion = McpConstants.PROTOCOL_VERSION,
            capabilities = ServerCapabilities(tools = ToolCapability(listChanged = false)),
            serverInfo = Implementation(McpConstants.SERVER_NAME, McpConstants.SERVER_VERSION)
        ))
    }

    private fun handleToolsList(request: JsonRpcRequest): JsonRpcResponse {
        val tools = toolRegistry.listTools()
        logger.info { "MCP tools/list: ${tools.size}개" }
        return JsonRpcResponse.success(request.id, ListToolsResult(tools))
    }

    @Suppress("UNCHECKED_CAST")
    private fun handleToolsCall(request: JsonRpcRequest): JsonRpcResponse {
        val params = request.params
            ?: return JsonRpcResponse.error(request.id, JsonRpcErrorCodes.INVALID_PARAMS, "params 누락")

        val toolName = params["name"]?.toString()
            ?: return JsonRpcResponse.error(request.id, JsonRpcErrorCodes.INVALID_PARAMS, "도구 이름 누락")

        val tool = toolRegistry.getTool(toolName)
            ?: return JsonRpcResponse.error(request.id, JsonRpcErrorCodes.METHOD_NOT_FOUND,
                "등록되지 않은 도구: $toolName")

        val arguments = (params["arguments"] as? Map<String, Any?>) ?: emptyMap()

        return try {
            val result = tool.execute(arguments)
            logger.info { "MCP tools/call 완료: $toolName (isError=${result.isError})" }
            JsonRpcResponse.success(request.id, result)
        } catch (e: IllegalArgumentException) {
            logger.warn { "도구 파라미터 오류: $toolName — ${e.message}" }
            JsonRpcResponse.success(request.id, CallToolResult.error("파라미터 오류: ${e.message}"))
        } catch (e: Exception) {
            logger.error(e) { "도구 실행 오류: $toolName" }
            JsonRpcResponse.success(request.id, CallToolResult.error("실행 오류: ${e.message}"))
        }
    }
}