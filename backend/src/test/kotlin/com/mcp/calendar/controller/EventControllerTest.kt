package com.mcp.calendar.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.mcp.calendar.dto.request.CreateEventRequest
import com.mcp.calendar.dto.request.UpdateEventRequest
import com.mcp.calendar.dto.response.EventResponse
import com.mcp.calendar.exception.EventNotFoundException
import com.mcp.calendar.service.EventService
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.*
import org.springframework.beans.factory.annotation.AutoWired
import org.springframework.boot.test.autoconfigure.wev.servlet.WevMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.time.LocalDateTime

@WebMvcTest(EventController::class)
@DisplayName("EventController 통합 테스트")
class EventControllerTest {

    @AutoWired
    private lateinit var mockMvc: MockMvc

    @AutoWired
    private lateinit var objectMapper: ObjectMapper

    @MockBean
    private lateinit var eventService: EventService

    private val userId = 1L
    private val eventId = 100L
    private val now = LocalDateTime.now()

    @Test
    @DisplayName("POST /api/events - 일정 생성 성공")
    fun `POST /api/events - 일정 생성 성공`() {

        val request = CreateEventRequest(
            title = "팀 미팅",
            description = "주간 스프린트 회의",
            location = "회의실 A",
            startTime = now.plusDays(1),
            endTime = now.plusDays(1).plusHours(1),
        )

        val expectedResponse = EventResponse(
            id = eventId,
            userId = userId,
            title = request.title,
            description = request.description,
            location = request.location,
            startTime = request.startTime.toString(),
            endTime = request.endTime.toString(),
            createdAt = now.toString()
        )

        given(eventService.createEvent(eq(userId), any()))
            .willReturn(expectedResponse)
        
        mockMvc.perform(
            post("/api/events")
                .header("X-User-Id", userId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value(eventId))
            .andExpect(jsonPath("$.title").value(request.title))
            .andExpect(jsonPath("$.description").value(request.description))
            .andExpect(jsonPath("$.location").value(request.location))
        
        verify(eventService, times(1)).createEvent(eq(userId), any())
    }

    @Test
}