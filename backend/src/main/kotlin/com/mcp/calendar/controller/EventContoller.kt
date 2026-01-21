package com.mcp.calendar.controller

import com.mcp.calendar.dto.request.CreateEventRequest
import com.mcp.calendar.dto.request.UpdateEventRequest
import com.mcp.calendar.dto.response.EventResponse
import com.mcp.calendar.service.EventService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/events")
class EventController(
    private val eventService: EventService
) {
    
    // 새로운 일정 생성
    @PostMapping
    fun createEvent(
        @RequestHeader("X-User-Id") userId: Long,
        @Valid @RequestBody request: CreateEventRequest
    ): ResponseEntity<EventResponse> {
        val createdEvent = eventService.createEvent(userId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent)
    }

    // 특정 일정 조회
    @GetMapping("/{id}")
    fun getEvent(
        @PathVariable id: Long
    ): ResponseEntity<EventResponse> {
        val event = eventService.getEvent(id)
        return ResponseEntity.ok(event)
    }

    // 특정 사용자의 모든 일정 조회
    @GetMapping
    fun getAllEvents(
        @RequestHeader("X-User-Id") userId: Long
    ): ResponseEntity<List<EventResponse>> {
        val events = eventService.getAllEvent(userId)
        return ResponseEntity.ok(events)
    }

    // 일정 수정
    @PutMapping("/{id}")
    fun updateEvent(
        @PathVariable id: Long,
        @RequestHeader("X-User-Id") userId: Long,
        @Valid @RequestBody request: UpdateEventRequest
    ): ResponseEntity<EventResponse> {
        val updatedEvent = eventService.updateEvent(id, userId, request)
        return ResponseEntity.ok(updatedEvent)
    }

    // 일정 삭제
    @DeleteMapping("/{id}")
    fun deleteEvent(
        @PathVariable id: Long,
        @RequestHeader("X-User-Id") userId: Long
    ): ResponseEntity<Void> {
        eventService.deleteEvent(id, userId)
        return ResponseEntity.noContent().build()
    }
}