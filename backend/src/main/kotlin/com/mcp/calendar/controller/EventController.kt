package com.mcp.calendar.controller

import com.mcp.calendar.dto.request.CreateEventRequest
import com.mcp.calendar.dto.request.UpdateEventRequest
import com.mcp.calendar.dto.response.ApiResponse
import com.mcp.calendar.dto.response.EventResponse
import com.mcp.calendar.security.UserPrincipal
import com.mcp.calendar.service.EventService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("/api/events")
class EventController(
    private val eventService: EventService
) {

    // POST /api/events - 일정 생성
    @PostMapping
    fun createEvent(
        @AuthenticationPrincipal principal: UserPrincipal,
        @Valid @RequestBody request: CreateEventRequest
    ): ResponseEntity<ApiResponse<EventResponse>> {
        val createdEvent = eventService.createEvent(principal.id, request)
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(createdEvent))
    }

    // GET /api/events/{id} - 일정 단건 조회
    @GetMapping("/{id}")
    fun getEvent(
        @PathVariable id: Long
    ): ResponseEntity<ApiResponse<EventResponse>> {
        val event = eventService.getEvent(id)
        return ResponseEntity.ok(ApiResponse.success(event))
    }

    // GET /api/events - 전체 일정 조회
    @GetMapping
    fun getAllEvents(
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<List<EventResponse>>> {
        val events = eventService.getAllEvents(principal.id)
        return ResponseEntity.ok(ApiResponse.success(events))
    }

    // GET /api/events/monthly?year=2025&month=1 - 월별 일정 조회
    @GetMapping("/monthly")
    fun getMonthlyEvents(
        @AuthenticationPrincipal principal: UserPrincipal,
        @RequestParam year: Int,
        @RequestParam month: Int
    ): ResponseEntity<ApiResponse<List<EventResponse>>> {
        val events = eventService.getMonthlyEvents(principal.id, year, month)
        return ResponseEntity.ok(ApiResponse.success(events))
    }

    // PUT /api/events/{id} - 일정 수정
    @PutMapping("/{id}")
    fun updateEvent(
        @PathVariable id: Long,
        @AuthenticationPrincipal principal: UserPrincipal,
        @Valid @RequestBody request: UpdateEventRequest
    ): ResponseEntity<ApiResponse<EventResponse>> {
        val updatedEvent = eventService.updateEvent(id, principal.id, request)
        return ResponseEntity.ok(ApiResponse.success(updatedEvent))
    }

    // DELETE /api/events/{id} - 일정 삭제
    @DeleteMapping("/{id}")
    fun deleteEvent(
        @PathVariable id: Long,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<Unit>> {
        eventService.deleteEvent(id, principal.id)
        return ResponseEntity.ok(ApiResponse.successNoContent())
    }
}