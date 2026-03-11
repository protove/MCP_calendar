package com.mcp.calendar.controller

import com.mcp.calendar.dto.response.ApiResponse
import mu.KotlinLogging
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import javax.sql.DataSource

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/health")
class HealthController(
    private val dataSource: DataSource,
    private val redisTemplate: StringRedisTemplate
) {
    @GetMapping
    fun health(): ResponseEntity<ApiResponse<HealthResponse>> {
        val dbHealthy = checkDatabase()
        val redisHealthy = checkRedis()
        val allHealthy = dbHealthy && redisHealthy

        val response = HealthResponse(
            status = if (allHealthy) "UP" else "DOWN",
            db = if (dbHealthy) "UP" else "DOWN",
            redis = if (redisHealthy) "UP" else "DOWN"
        )

        return if (allHealthy) {
            ResponseEntity.ok(ApiResponse.success(response))
        } else {
            ResponseEntity.status(503).body(ApiResponse.success(response))
        }
    }

    private fun checkDatabase(): Boolean = try {
        dataSource.connection.use { it.isValid(3) }
    } catch (e: Exception) {
        logger.warn { "DB health check failed: ${e.message}" }
        false
    }

    private fun checkRedis(): Boolean = try {
        redisTemplate.connectionFactory?.connection?.ping() != null
    } catch (e: Exception) {
        logger.warn { "Redis health check failed: ${e.message}" }
        false
    }
}

data class HealthResponse(
    val status: String,
    val db: String,
    val redis: String
)
