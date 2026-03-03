package com.mcp.calendar.service

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.mcp.calendar.dto.request.GeminiContent
import mu.KotlinLogging
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.stereotype.Service
import java.util.concurrent.TimeUnit

private val logger = KotlinLogging.logger {}

/**
 * Redis 기반 대화 기록 관리 서비스
 *
 * - 키 패턴: chat:conv:{conversationId}
 * - TTL: 2시간
 * - 최대 히스토리: 20개 메시지
 */
@Service
class ConversationService(
    private val redisTemplate: RedisTemplate<String, String>,
    private val objectMapper: ObjectMapper
) {

    companion object {
        private const val KEY_PREFIX = "chat:conv:"
        private const val TTL_HOURS = 2L
        private const val MAX_HISTORY_SIZE = 50
    }

    fun getHistory(conversationId: String): List<GeminiContent> {
        val key = buildKey(conversationId)
        return try {
            val json = redisTemplate.opsForValue().get(key) ?: return emptyList()
            val contents: List<GeminiContent> = objectMapper.readValue(
                json,
                object : TypeReference<List<GeminiContent>>() {}
            )
            logger.debug { "대화 기록 로드: $conversationId (${contents.size}개 메시지)" }
            contents
        } catch (e: Exception) {
            logger.warn(e) { "대화 기록 파싱 실패: $conversationId — 빈 히스토리로 시작합니다." }
            emptyList()
        }
    }

    fun saveHistory(conversationId: String, contents: List<GeminiContent>) {
        val key = buildKey(conversationId)
        try {
            // 최대 크기 제한: 오래된 메시지 제거
            val trimmed = if (contents.size > MAX_HISTORY_SIZE) {
                contents.takeLast(MAX_HISTORY_SIZE)
            } else {
                contents
            }
            val json = objectMapper.writeValueAsString(trimmed)
            redisTemplate.opsForValue().set(key, json, TTL_HOURS, TimeUnit.HOURS)
            logger.debug { "대화 기록 저장: $conversationId (${trimmed.size}개 메시지)" }
        } catch (e: Exception) {
            logger.error(e) { "대화 기록 저장 실패: $conversationId" }
        }
    }

    fun clearHistory(conversationId: String) {
        val key = buildKey(conversationId)
        try {
            redisTemplate.delete(key)
            logger.info { "대화 기록 삭제: $conversationId" }
        } catch (e: Exception) {
            logger.error(e) { "대화 기록 삭제 실패: $conversationId" }
        }
    }

    private fun buildKey(conversationId: String): String = "$KEY_PREFIX$conversationId"
}
