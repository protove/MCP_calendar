package com.mcp.calendar.mcp

import com.fasterxml.jackson.databind.ObjectMapper
import com.mcp.calendar.mcp.protocol.JsonRpcErrorCodes
import com.mcp.calendar.mcp.protocol.JsonRpcRequest
import com.mcp.calendar.mcp.protocol.JsonRpcResponse
import mu.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter

private val logger = KotlinLogging.logger {}

/**
 * MCP SSE Transport Controller
 *
 * 흐름:
 * 1. GET /mcp/sse → SSE 연결, "endpoint" 이벤트로 메시지 URL 전달
 * 2. POST /mcp/message?sessionId={id} → JSON-RPC 요청 수신
 * 3. SSE "message" 이벤트로 JSON-RPC 응답 전송
 */
@RestController
@RequestMapping("/mcp")
class McpController(
    private val sessionManager: McpSessionManager,
    private val requestHandler: McpRequestHandler,
    private val objectMapper: ObjectMapper,
    private val toolRegistry: McpToolRegistry
) {

    @GetMapping("/sse", produces = [MediaType.TEXT_EVENT_STREAM_VALUE])
    fun connectSse(): SseEmitter {
        val (sessionId, emitter) = sessionManager.createSession()
        logger.info { "MCP SSE 연결: $sessionId" }

        try {
            emitter.send(
                SseEmitter.event()
                    .name("endpoint")
                    .data("/mcp/message?sessionId=$sessionId")
            )
        } catch (e: Exception) {
            logger.error(e) { "endpoint 이벤트 전송 실패" }
            sessionManager.removeSession(sessionId)
        }

        return emitter
    }

    @PostMapping("/message", consumes = [MediaType.APPLICATION_JSON_VALUE])
    fun handleMessage(
        @RequestParam sessionId: String,
        @RequestBody body: String
    ): ResponseEntity<Void> {
        val session = sessionManager.getSession(sessionId)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).build()

        val request = try {
            objectMapper.readValue(body, JsonRpcRequest::class.java)
        } catch (e: Exception) {
            logger.error(e) { "JSON-RPC 파싱 실패" }
            sendSseResponse(session, JsonRpcResponse.error(
                null, JsonRpcErrorCodes.PARSE_ERROR, "JSON 파싱 오류: ${e.message}"
            ))
            return ResponseEntity.accepted().build()
        }

        val response = requestHandler.handleRequest(request)
        if (response != null) {
            sendSseResponse(session, response)
        }

        return ResponseEntity.accepted().build()
    }

    @GetMapping("/health")
    fun health(): ResponseEntity<Map<String, Any>> = ResponseEntity.ok(mapOf(
        "status" to "UP",
        "server" to "mcp-calendar-server",
        "version" to "1.0.0",
        "activeSessions" to sessionManager.activeSessionCount(),
        "registeredTools" to toolRegistry.size()
    ))

    private fun sendSseResponse(session: McpSession, response: JsonRpcResponse) {
        try {
            session.sendEvent("message", objectMapper.writeValueAsString(response))
        } catch (e: Exception) {
            logger.error(e) { "SSE 응답 전송 실패: ${session.id}" }
            sessionManager.removeSession(session.id)
        }
    }
}