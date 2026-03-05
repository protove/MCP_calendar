package com.mcp.calendar.mcp

import com.mcp.calendar.mcp.protocol.ToolInfo
import com.mcp.calendar.mcp.tool.CalendarTools
import com.mcp.calendar.mcp.tool.LedgerTools
import com.mcp.calendar.mcp.tool.McpTool
import com.mcp.calendar.mcp.tool.WeatherTools
import mu.KotlinLogging
import org.springframework.stereotype.Component
import jakarta.annotation.PostConstruct

private val logger = KotlinLogging.logger {}

@Component
class McpToolRegistry(
    private val calendarTools: CalendarTools,
    private val ledgerTools: LedgerTools,
    private val weatherTools: WeatherTools
) {
    private val tools = mutableMapOf<String, McpTool>()

    @PostConstruct
    fun initialize() {
        calendarTools.getTools().forEach { tools[it.name] = it }
        ledgerTools.getTools().forEach { tools[it.name] = it }
        weatherTools.getTools().forEach { tools[it.name] = it }
        logger.info { "MCP 도구 레지스트리: ${tools.size}개 도구 등록 완료" }
    }

    fun listTools(): List<ToolInfo> = tools.values.map { it.toToolInfo() }.sortedBy { it.name }
    fun getTool(name: String): McpTool? = tools[name]
    fun size(): Int = tools.size
}