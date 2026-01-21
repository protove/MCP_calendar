package com.mcp.calendar.service

import com.mcp.calendar.dto.request.CreateEventRequest
import com.mcp.calendar.dto.request.UpdateEventRequest
import com.mcp.calendar.dto.response.EventResponse
import com.mcp.calendar.model.Event
import com.mcp.calendar.exception.EventNotFoundException
import com.mcp.calendar.repository.EventRepository
import org.springframework.streotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class EventService(
    private val eventRepository: EventRepository
){
    // 일정 생성
    fun createEvent(userId: Long, request: CreateEventRequest): EventResponse {
        val event = Event(
            userId = userId,
            title = request.title,
            description = request.description,
            location = request.location,
            startTime = request.startTime,
            endTime = request.endTime
        )

        val savedEvent = eventRepository.save(event)
        return toEventResponse(savedEvent)
    }

    // 일정 조회
    @Transactional(readOnly = true)
    fun getEvent(id: Long): EventResponse {
        val event = eventRepository.findById(id)
            ?: throw EventNotFoundException("일정을 찾을 수 없습니다. ID: $id")
        return toEventResponse(event)
    }

    // 특정 사용자 일정 전체 조회
    @Transactional(readOnly = true)
    fun getAllEvent(userId: Long): List<EventResponse>{
        return eventRepository.findAllByUserId(userId)
            .map { toEventResponse(it) }
    }

    // 일정 수정
    fun updateEvent(id: Long, userId: Long, request: UpdateEventRequest): EventResponse {
        
        val existingEvent = eventRepository.findById(id)
            ?: throw EventNotFoundException("일정을 찾을 수 없습니다. ID: $id")

        
        require(existingEvent.userId == userId) {
            "해당 일정을 수정할 권한이 없습니다."
        }

        val updatedEvent = existingEvent.copy(
            title = request.title ?: existingEvent.title,
            description = request.description ?: existingEvent.description,
            location = request.location ?: existingEvent.location,
            startTime = request.startTime ?: existingEvent.startTime,
            endTime = request.endTime ?: existingEvent.endTime
        )

        val result = eventRepository.update(id, updatedEvent)
            ?: throw EventNotFoundException("일정 수정에 실패했습니다.")
        
        return toEventResponse(result)
    }

    // 일정 삭제
    fun deleteEvent(id: Long, userId: Long) {
        
        val existingEvent = eventRepository.findById(id)
            ?: throw EventNotFoundException("일정을 찾을 수 없습니다. ID: $id")
        
        require(existingEvent.userId == userId) {
            "해당 일정을 삭제할 권한이 없습니다."
        }

        eventRepository.deleteById(id)
    }

    // Event -> EventResponse 변환
    private fun toEventResponse(event: Event): EventResponse {
        return EventResponse(
            id = event.id,
            userId = event.userId,
            title = event.title,
            description = event.description,
            location = event.location,
            startTime = event.startTime.toString(),
            endTime = event.endTime.toString(),
            createdAt = event.createdAt.toString()
        )
    }
}