package com.mcp.calendar.mcp

import mu.KotlinLogging
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.annotation.Configuration
import org.springframework.context.event.EventListener
import org.springframework.web.servlet.config.annotation.AsyncSupportConfigurer
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

private val logger = KotlinLogging.logger {}

@Configuration
class McpConfig(private val toolRegistry: McpToolRegistry) : WebMvcConfigurer {

    override fun configureAsyncSupport(configurer: AsyncSupportConfigurer) {
        configurer.setDefaultTimeout(1_800_000L)  // SSE 연결 타임아웃: 30분
    }

    @EventListener(ApplicationReadyEvent::class)
    fun onApplicationReady() {
        logger.info { "═".repeat(50) }
        logger.info { "  MCP Calendar Server 시작" }
        logger.info { "  SSE: /mcp/sse | Message: /mcp/message" }
        logger.info { "  Health: /mcp/health | Tools: ${toolRegistry.size()}개" }
        toolRegistry.listTools().forEach { logger.info { "  • ${it.name}" } }
        logger.info { "═".repeat(50) }
    }
}