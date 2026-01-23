package com.mcp.calendar.service

import com.mcp.calendar.dto.request.CreateEventRequest
import com.mcp.calendar.dto.request.UpdateEventRequest
import com.mcp.calendar.dto.response.EventResponse
import com.mcp.calendar.exception.EventNotFoundException
import com.mcp.calendar.model.Event
import com.mcp.calendar.model.EventCategory
import com.mcp.calendar.repository.EventRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional


@Service
@Transactional
class EventService(
    private val eventRepository: EventRepository
) {

    // 일정 생성
    fun createEvent(userId: Long, request: CreateEventRequest): EventResponse {
        request.validate()

        val event = Event(
            userId = userId,
            title = request.title,
            description = request.description,
            location = request.location,
            startTime = request.startTime,
            endTime = request.endTime,
            category = EventCategory.fromString(request.category),
            allDay = request.allDay ?: false
        )

        val savedEvent = eventRepository.save(event)
        return EventResponse.from(savedEvent)
    }

    // 일정 단건 조회
    @Transactional(readOnly = true)
    fun getEvent(id: Long): EventResponse {
        val event = eventRepository.findById(id)
            ?: throw EventNotFoundException("일정을 찾을 수 없습니다. ID: $id")
        return EventResponse.from(event)
    }

    // 특정 사용자의 전체 일정 조회
    @Transactional(readOnly = true)
    fun getAllEvents(userId: Long): List<EventResponse> {
        return eventRepository.findAllByUserId(userId)
            .map { EventResponse.from(it) }
    }

    // 특정 사용자의 월별 일정 조회
    @Transactional(readOnly = true)
    fun getMonthlyEvents(userId: Long, year: Int, month: Int): List<EventResponse> {
        return eventRepository.findByUserIdAndMonth(userId, year, month)
            .map { EventResponse.from(it) }
    }

    // 일정 수정
    fun updateEvent(id: Long, userId: Long, request: UpdateEventRequest): EventResponse {
        val existingEvent = eventRepository.findById(id)
            ?: throw EventNotFoundException("일정을 찾을 수 없습니다. ID: $id")

        require(existingEvent.userId == userId) {
            "해당 일정을 수정할 권한이 없습니다."
        }

        require(request.hasChanges()) {
            "변경할 내용이 없습니다."
        }

        request.validate(existingEvent.startTime, existingEvent.endTime)

        val updatedEvent = existingEvent.copy(
            title = request.title ?: existingEvent.title,
            description = request.description ?: existingEvent.description,
            location = request.location ?: existingEvent.location,
            startTime = request.startTime ?: existingEvent.startTime,
            endTime = request.endTime ?: existingEvent.endTime,
            category = request.category?.let { EventCategory.fromString(it) } ?: existingEvent.category,
            allDay = request.allDay ?: existingEvent.allDay
        )

        val result = eventRepository.update(id, updatedEvent)
            ?: throw EventNotFoundException("일정 수정에 실패했습니다. ID: $id")

        return EventResponse.from(result)
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
}