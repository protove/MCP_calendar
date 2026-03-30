package com.mcp.calendar.service

import mu.KotlinLogging
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.Instant

private val logger = KotlinLogging.logger {}

/**
 * Redis Sorted Set 슬라이딩 윈도우 방식 Rate Limiting
 *
 * - 분당 10회 / 일 50회 제한
 * - Gemini 무료 등급 quota 보호: quota 소진 시 전체 사용자 장애 전파 방지
 */
@Service
class RateLimitService(
    private val redisTemplate: StringRedisTemplate
) {

    companion object {
        private const val MINUTE_LIMIT = 10
        private const val DAILY_LIMIT = 50
        private val MINUTE_WINDOW = Duration.ofMinutes(1)
        private val DAILY_WINDOW = Duration.ofDays(1)
        private const val KEY_PREFIX = "rate_limit:chat:"
    }

    /**
     * 요청 허용 여부를 확인하고, 허용 시 카운트를 증가시킵니다.
     * @return 허용되면 null, 차단되면 에러 메시지 반환
     */
    fun checkAndIncrement(userId: Long): String? {
        val now = Instant.now()
        val nowMillis = now.toEpochMilli().toDouble()

        // 분당 제한 확인
        val minuteKey = "${KEY_PREFIX}minute:$userId"
        val minuteCount = slidingWindowCount(minuteKey, now, MINUTE_WINDOW)
        if (minuteCount >= MINUTE_LIMIT) {
            logger.warn { "Rate limit exceeded (minute) - userId: $userId, count: $minuteCount" }
            return "요청이 너무 많습니다. 1분 후 다시 시도해주세요. (분당 ${MINUTE_LIMIT}회 제한)"
        }

        // 일일 제한 확인
        val dailyKey = "${KEY_PREFIX}daily:$userId"
        val dailyCount = slidingWindowCount(dailyKey, now, DAILY_WINDOW)
        if (dailyCount >= DAILY_LIMIT) {
            logger.warn { "Rate limit exceeded (daily) - userId: $userId, count: $dailyCount" }
            return "일일 요청 한도를 초과했습니다. 내일 다시 시도해주세요. (일 ${DAILY_LIMIT}회 제한)"
        }

        // 허용 → 두 키 모두 카운트 증가
        redisTemplate.opsForZSet().add(minuteKey, "$nowMillis", nowMillis)
        redisTemplate.expire(minuteKey, MINUTE_WINDOW.plusSeconds(10))

        redisTemplate.opsForZSet().add(dailyKey, "$nowMillis", nowMillis)
        redisTemplate.expire(dailyKey, DAILY_WINDOW.plusSeconds(60))

        return null
    }

    private fun slidingWindowCount(key: String, now: Instant, window: Duration): Long {
        val windowStart = now.minus(window).toEpochMilli().toDouble()
        val nowMillis = now.toEpochMilli().toDouble()

        // 윈도우 밖의 오래된 데이터 제거
        redisTemplate.opsForZSet().removeRangeByScore(key, Double.NEGATIVE_INFINITY, windowStart)

        // 현재 윈도우 내 요청 수 조회
        return redisTemplate.opsForZSet().count(key, windowStart, nowMillis) ?: 0
    }
}
