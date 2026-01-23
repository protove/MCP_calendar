package com.mcp.calendar.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.mcp.calendar.dto.request.CreateEventRequest
import com.mcp.calendar.dto.request.UpdateEventRequest
import com.mcp.calendar.dto.response.EventResponse
import com.mcp.calendar.exception.EventNotFoundException
import com.mcp.calendar.exception.GlobalExceptionHandler
import com.mcp.calendar.service.EventService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.*
import org.mockito.Mockito
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import java.time.LocalDateTime

@DisplayName("EventController 단위 테스트")
class EventControllerTest {

    private lateinit var mockMvc: MockMvc
    private lateinit var objectMapper: ObjectMapper
    private lateinit var eventService: EventService

    private val userId = 1L
    private val eventId = 100L
    private val now = LocalDateTime.now()

    @BeforeEach
    fun setup() {
        eventService = Mockito.mock(EventService::class.java)

        val eventController = EventController(eventService)

        mockMvc = MockMvcBuilders
            .standaloneSetup(eventController)
            .setControllerAdvice(GlobalExceptionHandler())
            .build()

        objectMapper = ObjectMapper().apply {
            registerModule(JavaTimeModule())
        }
    }

    @Nested
    @DisplayName("POST /api/events - 일정 생성")
    inner class CreateEventTest {

        @Test
        @DisplayName("성공 - 201 Created")
        fun `일정 생성 성공`() {
            val request = CreateEventRequest(
                title = "팀 미팅",
                description = "주간 스프린트 회의",
                location = "회의실 A",
                startTime = now.plusDays(1),
                endTime = now.plusDays(1).plusHours(1),
                category = "meeting",
                allDay = false
            )

            val expectedResponse = createEventResponse()

            given(eventService.createEvent(eq(userId), any()))
                .willReturn(expectedResponse)

            mockMvc.perform(
                post("/api/events")
                    .header("X-User-Id", userId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isCreated)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(eventId))
                .andExpect(jsonPath("$.data.title").value(request.title))
                .andExpect(jsonPath("$.data.category").value("meeting"))

            verify(eventService, times(1)).createEvent(eq(userId), any())
        }

        @Test
        @DisplayName("실패 - 제목 누락 시 400 Bad Request")
        fun `제목 누락 시 400`() {
            val invalidRequest = mapOf(
                "startTime" to now.plusDays(1).toString(),
                "endTime" to now.plusDays(1).plusHours(1).toString()
            )

            mockMvc.perform(
                post("/api/events")
                    .header("X-User-Id", userId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest))
            )
                .andExpect(status().isBadRequest)
        }
    }

    @Nested
    @DisplayName("GET /api/events/{id} - 일정 단건 조회")
    inner class GetEventTest {

        @Test
        @DisplayName("성공 - 200 OK")
        fun `일정 조회 성공`() {
            val expectedResponse = createEventResponse()

            given(eventService.getEvent(eventId))
                .willReturn(expectedResponse)

            mockMvc.perform(
                get("/api/events/{id}", eventId)
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(eventId))
                .andExpect(jsonPath("$.data.title").value("테스트 일정"))

            verify(eventService, times(1)).getEvent(eventId)
        }

        @Test
        @DisplayName("실패 - 존재하지 않는 일정 404 Not Found")
        fun `존재하지 않는 일정 404`() {
            given(eventService.getEvent(eventId))
                .willThrow(EventNotFoundException("일정을 찾을 수 없습니다. ID: $eventId"))

            mockMvc.perform(
                get("/api/events/{id}", eventId)
            )
                .andExpect(status().isNotFound)
                .andExpect(jsonPath("$.message").value("일정을 찾을 수 없습니다. ID: $eventId"))

            verify(eventService, times(1)).getEvent(eventId)
        }
    }

    @Nested
    @DisplayName("GET /api/events - 전체 일정 조회")
    inner class GetAllEventsTest {

        @Test
        @DisplayName("성공 - 200 OK")
        fun `전체 일정 조회 성공`() {
            val events = listOf(
                createEventResponse(id = 1L, title = "일정 1"),
                createEventResponse(id = 2L, title = "일정 2")
            )

            given(eventService.getAllEvents(userId))
                .willReturn(events)

            mockMvc.perform(
                get("/api/events")
                    .header("X-User-Id", userId)
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].title").value("일정 1"))
                .andExpect(jsonPath("$.data[1].title").value("일정 2"))

            verify(eventService, times(1)).getAllEvents(userId)
        }
    }

    @Nested
    @DisplayName("GET /api/events/monthly - 월별 일정 조회")
    inner class GetMonthlyEventsTest {

        @Test
        @DisplayName("성공 - 200 OK")
        fun `월별 일정 조회 성공`() {
            val events = listOf(
                createEventResponse(id = 1L, title = "1월 일정")
            )

            given(eventService.getMonthlyEvents(userId, 2025, 1))
                .willReturn(events)

            mockMvc.perform(
                get("/api/events/monthly")
                    .header("X-User-Id", userId)
                    .param("year", "2025")
                    .param("month", "1")
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1))

            verify(eventService, times(1)).getMonthlyEvents(userId, 2025, 1)
        }
    }

    @Nested
    @DisplayName("PUT /api/events/{id} - 일정 수정")
    inner class UpdateEventTest {

        @Test
        @DisplayName("성공 - 200 OK")
        fun `일정 수정 성공`() {
            val request = UpdateEventRequest(
                title = "수정된 제목",
                category = "important"
            )

            val updatedResponse = createEventResponse(title = "수정된 제목", category = "important")

            given(eventService.updateEvent(eq(eventId), eq(userId), any()))
                .willReturn(updatedResponse)

            mockMvc.perform(
                put("/api/events/{id}", eventId)
                    .header("X-User-Id", userId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("수정된 제목"))
                .andExpect(jsonPath("$.data.category").value("important"))

            verify(eventService, times(1)).updateEvent(eq(eventId), eq(userId), any())
        }

        @Test
        @DisplayName("실패 - 권한 없음 400 Bad Request")
        fun `권한 없음 400`() {
            val request = UpdateEventRequest(title = "수정 시도")

            given(eventService.updateEvent(eq(eventId), eq(userId), any()))
                .willThrow(IllegalArgumentException("해당 일정을 수정할 권한이 없습니다."))

            mockMvc.perform(
                put("/api/events/{id}", eventId)
                    .header("X-User-Id", userId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("$.message").value("해당 일정을 수정할 권한이 없습니다."))
        }
    }

    @Nested
    @DisplayName("DELETE /api/events/{id} - 일정 삭제")
    inner class DeleteEventTest {

        @Test
        @DisplayName("성공 - 200 OK")
        fun `일정 삭제 성공`() {
            doNothing().`when`(eventService).deleteEvent(eventId, userId)

            mockMvc.perform(
                delete("/api/events/{id}", eventId)
                    .header("X-User-Id", userId)
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))

            verify(eventService, times(1)).deleteEvent(eventId, userId)
        }

        @Test
        @DisplayName("실패 - 존재하지 않는 일정 404 Not Found")
        fun `존재하지 않는 일정 삭제 404`() {
            doThrow(EventNotFoundException("일정을 찾을 수 없습니다. ID: $eventId"))
                .`when`(eventService).deleteEvent(eventId, userId)

            mockMvc.perform(
                delete("/api/events/{id}", eventId)
                    .header("X-User-Id", userId)
            )
                .andExpect(status().isNotFound)
                .andExpect(jsonPath("$.message").value("일정을 찾을 수 없습니다. ID: $eventId"))
        }
    }

    private fun createEventResponse(
        id: Long = eventId,
        title: String = "테스트 일정",
        category: String = "other"
    ): EventResponse {
        return EventResponse(
            id = id,
            title = title,
            description = "테스트 설명",
            location = "테스트 장소",
            startTime = now.plusDays(1).toString(),
            endTime = now.plusDays(1).plusHours(1).toString(),
            category = category,
            allDay = false,
            createdAt = now.toString(),
            updatedAt = now.toString(),
            durationMinutes = 60,
            isMultiDay = false,
            isPast = false
        )
    }
}

