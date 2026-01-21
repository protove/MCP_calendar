package com.mcp.calendar.service

import com.mcp.calendar.dto.request.CreateEventRequest
import com.mcp.calendar.dto.request.UpdateEventRequest
import com.mcp.calendar.dto.response.EventResponse
import com.mcp.calendar.model.Event
import com.mcp.calendar.exception.NotFoundException
import com.mcp.calendar.repository.EventRepository
import io.mockk.every
import io.mockk.junit5.MockKExtension
import io.mockk.mockk
import io.mockk.verify
import org.assertj.core.api.Assertions.aseertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import java.time.LocalDateTime

@ExtendWith(MockKExtension::class)
@DisplayName("EventService 단위 테스트")
class EventServiceTest {

    private lateinit var eventRepository: EventRepository
    private lateinit var eventService: EventService

    private val now = LocalDateTime.now()
    private val userId = 1L
    private val eventId = 100L

    @BeforeEach
    fun setup() {
        eventRepository = mockk()
        eventService = EventService(eventRepository)
    }

    // createEvent 테스트
    @Test
    @DisplayName("일정 생성 성공")
    fun 'createEvent - 성공'() {
        val request = CreateEventRequest(
            title = "팀 미팅",
            description = "주간 스프린트 회의",
            location = "회의실 A",
            startTime = now.plusDays(1),
            endTime = now.plusDays(1).plusHours(1)
        )

        val expectedEvent = Event(
            id = eventId,
            userId = userId,
            title = request.title,
            description = request.description,
            location = request.location,
            startTime = request.startTime,
            endTime = request.endTime
        )

        every { eventRepository.save(any()) } returns expectedEvent

        val result = eventService.createEvent(userId, request)

        assertThat(result.id).isEqualTo(eventId)
        assertThat(result.title).isEqualTo(request.title)
        assertThat(result.description).isEqualTo(request.description)
        assertThat(result.location).isEqualTo(request.location)
        
        verify(exactly = 1) { eventRepository.save(any()) }
    }

    // createEvent 필수 필드 테스트
    @Test
    @DisplayName("일정 생성 시 필수 필드만 제공")
    fun 'createEvent - 필수 필드 테스트'() {
        
        val request = CreateEventRequest(
            title = "일정"
            discription = null,
            location = null,
            startTime = now.plusDays(1),
            endTime = now.plusDays(1).plusHours(1)
        )

        val expectedEvent = Event(
            id = eventId,
            userId = userId,
            title = request.title,
            description = null,
            location = null,
            startTime = request.startTime,
            endTime = request.endTime,
            createdAt = now
        )

        every { eventRepository.save(any()) } returns expectedEvent

        val result = eventService.createEvent(userId, request)

        assertThat(result.title).isEqualTo(request.title)
        assertThat(result.description).isNull()
        assertThat(result.location).isNull()

        verify(exactly = 1) { eventRepository.save(any()) }
    }

    // getEvent 테스트
    @Test
    @DisplayName("일정 조회 성공")
    fun 'getEvent - 성공'() {

        val event = Event(
            id = eventId,
            userId = userId,
            title = "회의",
            description = "중요한 회의",
            location = "본사",
            startTime = now.plusDays(1),
            endTime = now.plusDays(1).plusHours(1),
            createdAt = now
        )

        every { eventRepository.findById(eventId) } returns event

        val result = eventService.getEvent(eventId)

        assertThat(result.id).isEqualTo(eventId)
        assertThat(result.title).isEqualTo(event.title)
        assertThat(result.description).isEqualTo(event.description)
        
        verify(exactly = 1) { eventRepository.findById(eventId) }
    }

    @Test
    @DisplayName("존재하지 않은 일정 조회시 예외 발생")
    fun 'getEvent - 존재하지 않은 일정 예외 발생'() {

        every { eventRepository.findById(eventId) } returns null

        assertThatThrownBy { eventService.getEvent(eventId) }
            .isInstanceOf(EventNotFoundException::class.java)
            .hasMessageContaining("일정을 찾을 수 없습니다. ID: $eventId")
        
        verify(exactly = 1) { eventRepository.findById(eventId) }
    }

    // getAllEvent 테스트
    @Test
    @DisplayName("사용자의 모든 일정 조회 성공")
    fun 'getAllEvent - 성공'() {
        val evnets = listOf(
            Event(
                id = 1L,
                userId = userId,
                title = '일정 1',
                dscription = '설명 1',
                location = '장소 1',
                startTime = now.plusDays(1),
                endTime = now.plusDays(1).plusHours(1),
                createdAt = now
            ),
            Event(
                id = 2L,
                userId = userId,
                title = '일정 2',
                description = '설명 2',
                location = '장소 2',
                startTime = now.plusDays(2),
                endTime = now.plusDays(2).plusHours(1),
                createdAt = now
            )
        )

        every { eventRepository.findAllByUserId(userId) } returns events

        val result = eventService.getAllEvent(userId)

        assertThat(result).hasSize(2)
        assertThat(result[0].title).isEqualTo("일정 1")
        assertThat(result[1].title).isEqualTo("일정 2")

        verify(exactly = 1) { eventRepository.findAllByUserId(userId) }
    }

    @Test
    @DisplayName("일정이 없는 사용자 조회 시 빈 리스트 반환")
    fun 'getAllEvent - 일정이 없는 사용자 조회'() {
        every { eventRepository.findAllByUserId(userId) } returns emptyList()

        val result = eventService.getAllEvent(userId)

        assertThat(result).isEmpty()

        verify(exactly = 1) { eventRepository.findAllByUserId(userId) }
    }

    // updateEvent 테스트
    @Test
    @DisplayName("일정 수정 성공")
    fun 'updateEvent - 성공'() {
        
        val existingEvent = Event(
            id = eventId,
            userId = userId,
            title = "기존 제목",
            description = "기존 설명",
            location = "기존 장소",
            startTime = now.plusDays(1),
            endTime = now.plusDays(1).plusHours(1),
            createdAt = now
        )

        val updateRequest = UpdateEventRequest(
            title = "수정된 제목",
            description = "수정된 설명",
            location = "수정된 장소",
            startTime = now.plusDays(2),
            endTime = now.plusDays(2).plusHours(1)
        )

        val updatedEvent = existingEvent.copy(
            title = updateRequest.title,
            description = updateRequest.description,
            location = updateRequest.location,
            startTime = updateRequest.startTime,
            endTime = updateRequest.endTime
        )

        every { eventRepository.findById(eventId) } returns existingEvent
        every { eventRepository.update(eventId, any()) } returns updatedEvent

        val result = eventService.updateEvent(eventId, userId, updateRequest)

        assertThat(result.id).isEqualTo(eventId)
        assertThat(result.title).isEqualTo(updateRequest.title)
        assertThat(result.description).isEqualTo(updateRequest.description)
        assertThat(result.location).isEqualTo(updateRequest.location)
        assertThat(result.startTime).isEqualTo(updateRequest.startTime)
        assertThat(result.endTime).isEqualTo(updateRequest.endTime)

        verify(exactly = 1) { eventRepository.findById(eventId) }
        verify(exactly = 1) { eventRepository.update(eventId, any()) }
    }

    @Test
    @DisplayName("다른 사용자의 일정 수정 시 예외 발생")
    fun 'updateEvent - 다른 사용자의 일정 수정'() {

        val otherUserId = 999L
        val existingEvent = Event(
            id = eventId,
            userId = otherUserId,
            title = "기존 제목",
            description = "기존 설명",
            location = "기존 장소",
            startTime = now.plusDays(1),
            endTime = now.plusDays(1).plusHours(1),
            createdAt = now
        )

        val updateRequest = UpdateEventRequest(
            title = "수정 시도",
            description = "수정 시도",
            location = "수정 시도",
            startTime = now.plusDays(2),
            endTime = now.plusDays(2).plusHours(1)
        )

        every { eventRepository.findById(eventId) } returns existingEvent

        assertThatThrownBy {
            eventService.updateEvent(eventId, userId, updateRequest)
        }
            .isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("권한이 없습니다")
        
        verify(exactly = 1) { eventRepository.findById(eventId) }
        verify(exactly = 0) { eventRepository.update(any(), any()) }
    }

    @Test
    @DisplayName("존재하지 않는 일정 수정 시 예외 발생")
    fun 'updateEvent - 존재하지 않는 일정 수정'() {

        val updateRequest = UpdateEventRequest(
            title = "수정 시도",
            description = "수정 시도",
            location = "수정 시도"
            startTime = now.plusDays(2),
            endTime = now.plusDays(2).plusHours(1)
        )

        every { eventRepository.findById(eventId) } returns nll

        assertThatThrownBy {
            eventService.updateEvent(eventId, userId, updateRequest)
        }
            .isInstanceOf(EventNotFoundException::class.java)
            .hasMessageContaining("일정을 찾을 수 없습니다 ID: $eventId")
        
        verify(exactly = 1) { eventRepository.findById(eventId) }
        verify(exactly = 0) { eventRepository.update(any(), any()) }
    }
    
    // deleteEvent 테스트
    @Test
    @DisplayName("일정 삭제 성공")
    fun 'deleteEvent - 성공'() {

        val event = Event(
            id = eventId,
            userId = userId,
            title = "삭제할 일정",
            description = "설명",
            location = "장소",
            startTime = now.plusDays(1),
            endTime = now.plusDays(1).plusHours(1),
            createdAt = now
        )

        every { eventRepository.findById(evnetId) } returns event
        every { eventRepository.deleteById(evnetId) } returns Unit

        eventService.deleteEvent(eventId, userId)

        verify(exactly = 1) { eventRepository.findById(eventId) }
        verify(exactly = 1) { eventRepository.deleteById(eventId) }
    }

    @Test
    @DisplayName("다른 사용자 일정 삭제 시 예외 발생")
    fun 'deleteEvent - 다른 사용자 일정 삭제'() {
        
        val otherUserId = 999L
        val event = Event(
            id = eventId,
            userId = otherUserId,
            title = "삭제 시도",
            description = "설명",
            location = "장소",
            startTime = now.plusDays(1),
            endTime = now.plusDays(1).plusHours(1),
            createdAt = now
        )

        every { eventRepository.findById(eventId) } returns event

        assertThatThrownBy {
            eventService.deleteEvent(eventId, userId)
        }
            .isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("권한이 없습니다")
        
        verify(exactly = 1) { eventRepository.findById(eventId) }
        verify(exactly = 0) { eventRepository.deleteById(any()) }
    }

    @Test
    @DisplayName("존재하지 않는 일정 삭제 시 예외 발생")
    fun 'deleteEvent - 존재하지 않는 일정 삭제'() {

        every { eventRepository.findById(eventId) } returns null

        assertThatThrownBy {
            eventService.deleteEvent(eventId, userId)
        }
            .isInstanceOf(EventNotFoundException::class.java)
            .hasMessageContaining("일정을 찾을 수 없습니다 ID: $eventId")

        verify(exactly = 1) { eventRepository.findById(eventId) }
        verify(exactly = 0) { eventRepository.deleteById(any()) }
    }
    
}
