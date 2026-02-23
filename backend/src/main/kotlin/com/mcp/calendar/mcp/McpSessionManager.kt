package com.mcp.calendar.mcp

import mu.KotlinLogging
import org.springframework.stereotype.Component
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

private val logger = KotlinLogging.logger {}

@Component
class McpSessionManager {

    private val sessions = ConcurrentHashMap<String, McpSession>()

    fun createSession(): Pair<String, SseEmitter> {
        val sessionId = UUID.randomUUID().toString()
        val emitter = SseEmitter(0L)  // 무제한 (McpConfig에서 기본 타임아웃 설정)
        val session = McpSession(id = sessionId, emitter = emitter)

        emitter.onCompletion { removeSession(sessionId) }
        emitter.onTimeout { removeSession(sessionId) }
        emitter.onError { removeSession(sessionId) }

        sessions[sessionId] = session
        logger.info { "MCP 세션 생성: $sessionId (활성: ${sessions.size})" }
        return sessionId to emitter
    }

    fun getSession(sessionId: String): McpSession? = sessions[sessionId]

    fun removeSession(sessionId: String) {
        sessions.remove(sessionId)?.let {
            logger.info { "MCP 세션 제거: $sessionId (활성: ${sessions.size})" }
        }
    }

    fun activeSessionCount(): Int = sessions.size
}

data class McpSession(
    val id: String,
    val emitter: SseEmitter,
    var initialized: Boolean = false
) {
    fun sendEvent(eventName: String, data: String) {
        emitter.send(
            SseEmitter.event()
                .name(eventName)
                .data(data)
        )
    }
}