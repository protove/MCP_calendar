package com.mcp.calendar.mcp.protocol

import com.faterxml.jackson.annotation.JsonIgnoreProperties
import com.faterxml.jackson.annotation.JsonInclude
import com.faterxml.jackson.annotation.JsonProperty


// JSON-RPC 2.0 Base Types
@JsonIgnoreProperties(ignoreUnknown = true)
data class JsonRequest(
    val jsonrpc: String = JSONRPC_VERSION,
    val method: String,
    val id: Any? = null,
    val params: Map<String, Any?>? = null
) {
    val isNotification: Boolean get() = id == null

    companion object {
        const val JSONRPC_VERSION = "2.0"
    }
}

@JsonInclude(JsonInclude.Include.NON_NULL)
data class JsonRpcResponse(
    val jsonrpc: String = JsonRequest.JSONRPC_VERSION,
    val id: Any? = null,
    val result: Any? = null,
    val error: JsonRpcError? = null
){
    companion object {
        fun success(id: Any?, result: Any?): JsonRpcResponse =
            JsonRpcResponse(id = id, result = result)
        

        fun error(id: Any?, code: Int, message: String, data: Any? = null): JsonRpcResponse =
            JsonRpcResponse(id = id, error = JsonRpcError(code, message, data))
    }
}

@JsonInclude(JsonInclude.Include.NON_NULL)
data class JsonRpcError(
    val code: Int,
    val message: String,
    val data: Any? = null
)

object JsonRpcErrorCodes {
    const val PARSE_ERROR = -32700
    const val INVALID_REQUEST = -32600
    const val METHOD_NOT_FOUND = -32601
    const val INVALID_PARAMS = -32602
    const val INTERNAL_ERROR = -32603
}

// MCP Protocol Types
data class Implementation(
    val name: String,
    val version: String
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class ServerCapabilities(
    val tools: ToolCapability? = null,
    val prompts: PromptCapability? = null,
    val resources: ResourceCapability? = null
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class ToolCapability(val listChanged: Boolean = false)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class PromptCapability(val listChanged: Boolean = false)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class ResourceCapability(
    val subscribe: Boolean = false,
    val listChanged: Boolean = false
)

data class InitializeResult(
    val protocolVersion: String,
    val capabilities: ServerCapabilities,
    val serverInfo: Implementation
)

data class ToolInfo(
    val name: String,
    val description: String,
    val inputSchema: Map<String, Any?>
)

data class ListToolsResult(val tools: List<ToolInfo>)

@JsonIgnoreProperties(ignoreUnknown = true)
data class CallToolParmas(
    val name: String,
    val arguments: Map<String, Any?>? = null
)

data class ToolContent(
    val type: String = "text",
    val text: String
)

data class CallToolResult(
    val content: List<ToolContent>,
    @get:JsonProperty("isError")
    val isError: Boolean = false
){
    companion object {
        fun text(text: String): CallToolResult =
            CallToolResult(content = listOf(ToolContent(text = text)))
        fun error(message: String): CallToolResult =
            CallToolResult(content = listOf(ToolContent(text = message)), isError = true)
    }
}

object McpMethod {
    const val INITIALIZE = "initialize"
    const val INITIALIZED = "notifications/initialized"
    const val TOOLS_LIST = "tools/list"
    const val TOOLS_CALL = "tools/call"
    const val PING = "ping"
    const val RESOURCES_LIST = "resources/list"
    const val PROMPTS_LIST = "prompts/list"
}

object McpConstants {
    const val PROTOCOL_VERSION = "2024-11-05"
    const val SERVER_NAME = "mcp-calendar-server"
    const val SERVER_VERSION = "1.0.0"
}


