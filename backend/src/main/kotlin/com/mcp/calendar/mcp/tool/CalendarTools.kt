package com.mcp.calendar.mcp.tool

import com.mcp.calendar.dto.request.CreateEventRequest
import com.mcp.calendar.dto.request.UpdateEventRequest
import com.mcp.calendar.mcp.protocol.CallToolResult
import com.mcp.calendar.service.EventService
import mu.KotlinLogging
import org.springframework.stereotype.Component

private val logger = KotlinLogging.logger {}

@Component
class CalendarTools(private val eventService: EventService) {

    private val defaultUserId = 1L  // Phase 2에서 인증 연동 예정

    fun getTools(): List<McpTool> = listOf(
        CreateEventTool(), GetEventTool(), ListEventsTool(),
        GetMonthlyEventsTool(), UpdateEventTool(), DeleteEventTool()
    )

    // --- 1. 일정 생성 ---
    private inner class CreateEventTool : McpTool {
        override val name = "create_event"
        override val description = "새로운 일정을 생성합니다. 제목, 시작/종료 시간은 필수입니다."
        override val inputSchema = objectSchema(
            properties = mapOf(
                "title" to stringProperty("일정 제목 (필수)"),
                "description" to stringProperty("일정 상세 설명"),
                "location" to stringProperty("일정 장소"),
                "startTime" to stringProperty("시작 시간 (필수, 예: 2025-02-15T10:00:00)", format = "date-time"),
                "endTime" to stringProperty("종료 시간 (필수, 예: 2025-02-15T11:00:00)", format = "date-time"),
                "category" to stringProperty("카테고리", enum = listOf("work","personal","meeting","important","other")),
                "allDay" to booleanProperty("종일 일정 여부 (기본값: false)")
            ),
            required = listOf("title", "startTime", "endTime")
        )

        override fun execute(arguments: Map<String, Any?>): CallToolResult {
            logger.info { "MCP create_event: ${arguments["title"]}" }
            val request = CreateEventRequest(
                title = arguments.requireString("title"),
                description = arguments.getString("description"),
                location = arguments.getString("location"),
                startTime = arguments.requireLocalDateTime("startTime"),
                endTime = arguments.requireLocalDateTime("endTime"),
                category = arguments.getString("category") ?: "other",
                allDay = arguments.getBoolean("allDay") ?: false
            )
            val result = eventService.createEvent(defaultUserId, request)
            return CallToolResult.text(buildString {
                appendLine("✅ 일정이 생성되었습니다.")
                appendLine("• ID: ${result.id}")
                appendLine("• 제목: ${result.title}")
                result.description?.let { appendLine("• 설명: $it") }
                result.location?.let { appendLine("• 장소: $it") }
                appendLine("• 시작: ${result.startTime}")
                appendLine("• 종료: ${result.endTime}")
                appendLine("• 카테고리: ${result.category}")
                appendLine("• 종일: ${if (result.allDay) "예" else "아니오"}")
            })
        }
    }

    // --- 2. 일정 단건 조회 ---
    private inner class GetEventTool : McpTool {
        override val name = "get_event"
        override val description = "ID로 특정 일정의 상세 정보를 조회합니다."
        override val inputSchema = objectSchema(
            properties = mapOf("eventId" to numberProperty("일정 ID (필수)", "integer")),
            required = listOf("eventId")
        )
        override fun execute(arguments: Map<String, Any?>): CallToolResult {
            val eventId = arguments.requireLong("eventId")
            logger.info { "MCP get_event: $eventId" }
            val event = eventService.getEvent(eventId)
            return CallToolResult.text(buildString {
                appendLine("📅 일정 상세")
                appendLine("• ID: ${event.id} | 제목: ${event.title}")
                event.description?.let { appendLine("• 설명: $it") }
                event.location?.let { appendLine("• 장소: $it") }
                appendLine("• 시작: ${event.startTime} → 종료: ${event.endTime}")
                appendLine("• 카테고리: ${event.category} | 종일: ${if (event.allDay) "예" else "아니오"}")
            })
        }
    }

    // --- 3. 전체 일정 조회 ---
    private inner class ListEventsTool : McpTool {
        override val name = "list_events"
        override val description = "사용자의 전체 일정 목록을 조회합니다."
        override val inputSchema = objectSchema(properties = emptyMap())
        override fun execute(arguments: Map<String, Any?>): CallToolResult {
            logger.info { "MCP list_events" }
            val events = eventService.getAllEvents(defaultUserId)
            if (events.isEmpty()) return CallToolResult.text("📅 등록된 일정이 없습니다.")
            return CallToolResult.text(buildString {
                appendLine("📅 전체 일정 (${events.size}건)")
                events.forEach { e ->
                    appendLine("• [${e.id}] ${e.title} — ${e.startTime} ~ ${e.endTime} (${e.category})")
                }
            })
        }
    }

    // --- 4. 월별 일정 조회 ---
    private inner class GetMonthlyEventsTool : McpTool {
        override val name = "get_monthly_events"
        override val description = "특정 연/월의 일정 목록을 조회합니다."
        override val inputSchema = objectSchema(
            properties = mapOf(
                "year" to numberProperty("연도 (필수)", "integer"),
                "month" to numberProperty("월 (필수, 1~12)", "integer")
            ),
            required = listOf("year", "month")
        )
        override fun execute(arguments: Map<String, Any?>): CallToolResult {
            val year = arguments.requireInt("year")
            val month = arguments.requireInt("month")
            require(month in 1..12) { "월은 1~12 사이여야 합니다." }
            logger.info { "MCP get_monthly_events: $year-$month" }
            val events = eventService.getMonthlyEvents(defaultUserId, year, month)
            if (events.isEmpty()) return CallToolResult.text("📅 ${year}년 ${month}월 일정이 없습니다.")
            return CallToolResult.text(buildString {
                appendLine("📅 ${year}년 ${month}월 일정 (${events.size}건)")
                events.forEach { e ->
                    appendLine("• [${e.id}] ${e.title} — ${e.startTime} ~ ${e.endTime} (${e.category})")
                }
            })
        }
    }

    // --- 5. 일정 수정 ---
    private inner class UpdateEventTool : McpTool {
        override val name = "update_event"
        override val description = "기존 일정을 수정합니다. eventId 필수, 수정할 필드만 전달."
        override val inputSchema = objectSchema(
            properties = mapOf(
                "eventId" to numberProperty("일정 ID (필수)", "integer"),
                "title" to stringProperty("새 제목"),
                "description" to stringProperty("새 설명"),
                "location" to stringProperty("새 장소"),
                "startTime" to stringProperty("새 시작 시간", format = "date-time"),
                "endTime" to stringProperty("새 종료 시간", format = "date-time"),
                "category" to stringProperty("새 카테고리", enum = listOf("work","personal","meeting","important","other")),
                "allDay" to booleanProperty("종일 여부")
            ),
            required = listOf("eventId")
        )
        override fun execute(arguments: Map<String, Any?>): CallToolResult {
            val eventId = arguments.requireLong("eventId")
            logger.info { "MCP update_event: $eventId" }
            val request = UpdateEventRequest(
                title = arguments.getString("title"),
                description = arguments.getString("description"),
                location = arguments.getString("location"),
                startTime = arguments.getLocalDateTime("startTime"),
                endTime = arguments.getLocalDateTime("endTime"),
                category = arguments.getString("category"),
                allDay = arguments.getBoolean("allDay")
            )
            val result = eventService.updateEvent(eventId, defaultUserId, request)
            return CallToolResult.text(buildString {
                appendLine("✏️ 일정이 수정되었습니다.")
                appendLine("• ID: ${result.id} | 제목: ${result.title}")
                appendLine("• 시작: ${result.startTime} → 종료: ${result.endTime}")
                appendLine("• 카테고리: ${result.category}")
            })
        }
    }

    // --- 6. 일정 삭제 ---
    private inner class DeleteEventTool : McpTool {
        override val name = "delete_event"
        override val description = "ID로 특정 일정을 삭제합니다."
        override val inputSchema = objectSchema(
            properties = mapOf("eventId" to numberProperty("일정 ID (필수)", "integer")),
            required = listOf("eventId")
        )
        override fun execute(arguments: Map<String, Any?>): CallToolResult {
            val eventId = arguments.requireLong("eventId")
            logger.info { "MCP delete_event: $eventId" }
            eventService.deleteEvent(eventId, defaultUserId)
            return CallToolResult.text("🗑️ 일정(ID: $eventId)이 삭제되었습니다.")
        }
    }
}