package com.mcp.calendar.service

import com.mcp.calendar.dto.request.CreateEventRequest
import com.mcp.calendar.dto.request.UpdateEventRequest
import com.mcp.calendar.exception.EventNotFoundException
import com.mcp.calendar.model.Event
import com.mcp.calendar.model.EventCategory
import com.mcp.calendar.repository.EventRepository
import io.mockk.every
import io.mockk.junit5.MockKExtension
import io.mockk.mockk
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
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

    @Nested
    @DisplayName("createEvent 테스트")
    inner class CreateEventTest {

        @Test
        @DisplayName("일정 생성 성공")
        fun `createEvent - 성공`() {
            val request = CreateEventRequest(
                title = "팀 미팅",
                description = "주간 스프린트 회의",
                location = "회의실 A",
                startTime = now.plusDays(1),
                endTime = now.plusDays(1).plusHours(1),
                category = "meeting",
                allDay = false
            )

            val expectedEvent = Event(
                id = eventId,
                userId = userId,
                title = request.title,
                description = request.description,
                location = request.location,
                startTime = request.startTime,
                endTime = request.endTime,
                category = EventCategory.MEETING,
                allDay = false,
                createdAt = now,
                updatedAt = now
            )

            every { eventRepository.save(any()) } returns expectedEvent

            val result = eventService.createEvent(userId, request)

            assertThat(result.id).isEqualTo(eventId)
            assertThat(result.title).isEqualTo(request.title)
            assertThat(result.category).isEqualTo("meeting")
            assertThat(result.allDay).isFalse()

            verify(exactly = 1) { eventRepository.save(any()) }
        }

        @Test
        @DisplayName("일정 생성 - 필수 필드만 제공")
        fun `createEvent - 필수 필드만 제공`() {
            val request = CreateEventRequest(
                title = "간단한 일정",
                description = null,
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
                category = EventCategory.OTHER,
                allDay = false,
                createdAt = now,
                updatedAt = now
            )

            every { eventRepository.save(any()) } returns expectedEvent

            val result = eventService.createEvent(userId, request)

            assertThat(result.title).isEqualTo(request.title)
            assertThat(result.description).isNull()
            assertThat(result.location).isNull()
            assertThat(result.category).isEqualTo("other")

            verify(exactly = 1) { eventRepository.save(any()) }
        }

        @Test
        @DisplayName("종료 시간이 시작 시간보다 빠르면 예외 발생")
        fun `createEvent - 유효성 검증 실패`() {
            val request = CreateEventRequest(
                title = "잘못된 일정",
                startTime = now.plusDays(1).plusHours(2),
                endTime = now.plusDays(1)
            )

            assertThatThrownBy { eventService.createEvent(userId, request) }
                .isInstanceOf(IllegalArgumentException::class.java)
                .hasMessageContaining("종료 시간")
        }
    }

    @Nested
    @DisplayName("getEvent 테스트")
    inner class GetEventTest {

        @Test
        @DisplayName("일정 조회 성공")
        fun `getEvent - 성공`() {
            val event = createTestEvent()

            every { eventRepository.findById(eventId) } returns event

            val result = eventService.getEvent(eventId)

            assertThat(result.id).isEqualTo(eventId)
            assertThat(result.title).isEqualTo(event.title)

            verify(exactly = 1) { eventRepository.findById(eventId) }
        }

        @Test
        @DisplayName("존재하지 않는 일정 조회 시 예외 발생")
        fun `getEvent - 존재하지 않는 일정 예외`() {
            every { eventRepository.findById(eventId) } returns null

            assertThatThrownBy { eventService.getEvent(eventId) }
                .isInstanceOf(EventNotFoundException::class.java)
                .hasMessageContaining("일정을 찾을 수 없습니다. ID: $eventId")

            verify(exactly = 1) { eventRepository.findById(eventId) }
        }
    }

    @Nested
    @DisplayName("getAllEvents 테스트")
    inner class GetAllEventsTest {

        @Test
        @DisplayName("사용자의 모든 일정 조회 성공")
        fun `getAllEvents - 성공`() {
            val events = listOf(
                createTestEvent(id = 1L, title = "일정 1"),
                createTestEvent(id = 2L, title = "일정 2")
            )

            every { eventRepository.findAllByUserId(userId) } returns events

            val result = eventService.getAllEvents(userId)

            assertThat(result).hasSize(2)
            assertThat(result[0].title).isEqualTo("일정 1")
            assertThat(result[1].title).isEqualTo("일정 2")

            verify(exactly = 1) { eventRepository.findAllByUserId(userId) }
        }

        @Test
        @DisplayName("일정이 없는 사용자 조회 시 빈 리스트 반환")
        fun `getAllEvents - 빈 리스트`() {
            every { eventRepository.findAllByUserId(userId) } returns emptyList()

            val result = eventService.getAllEvents(userId)

            assertThat(result).isEmpty()

            verify(exactly = 1) { eventRepository.findAllByUserId(userId) }
        }
    }

    @Nested
    @DisplayName("getMonthlyEvents 테스트")
    inner class GetMonthlyEventsTest {

        @Test
        @DisplayName("월별 일정 조회 성공")
        fun `getMonthlyEvents - 성공`() {
            val events = listOf(
                createTestEvent(id = 1L, title = "1월 일정 1"),
                createTestEvent(id = 2L, title = "1월 일정 2")
            )

            every { eventRepository.findByUserIdAndMonth(userId, 2025, 1) } returns events

            val result = eventService.getMonthlyEvents(userId, 2025, 1)

            assertThat(result).hasSize(2)

            verify(exactly = 1) { eventRepository.findByUserIdAndMonth(userId, 2025, 1) }
        }
    }

    @Nested
    @DisplayName("updateEvent 테스트")
    inner class UpdateEventTest {

        @Test
        @DisplayName("일정 수정 성공")
        fun `updateEvent - 성공`() {
            val existingEvent = createTestEvent()

            val updateRequest = UpdateEventRequest(
                title = "수정된 제목",
                description = "수정된 설명",
                location = "수정된 장소",
                category = "important"
            )

            val updatedEvent = existingEvent.copy(
                title = "수정된 제목",
                description = "수정된 설명",
                location = "수정된 장소",
                category = EventCategory.IMPORTANT
            )

            every { eventRepository.findById(eventId) } returns existingEvent
            every { eventRepository.update(eventId, any()) } returns updatedEvent

            val result = eventService.updateEvent(eventId, userId, updateRequest)

            assertThat(result.title).isEqualTo("수정된 제목")
            assertThat(result.category).isEqualTo("important")

            verify(exactly = 1) { eventRepository.findById(eventId) }
            verify(exactly = 1) { eventRepository.update(eventId, any()) }
        }

        @Test
        @DisplayName("다른 사용자의 일정 수정 시 예외 발생")
        fun `updateEvent - 권한 없음`() {
            val otherUserId = 999L
            val existingEvent = createTestEvent().copy(userId = otherUserId)

            val updateRequest = UpdateEventRequest(title = "수정 시도")

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
        fun `updateEvent - 존재하지 않는 일정`() {
            val updateRequest = UpdateEventRequest(title = "수정 시도")

            every { eventRepository.findById(eventId) } returns null

            assertThatThrownBy {
                eventService.updateEvent(eventId, userId, updateRequest)
            }
                .isInstanceOf(EventNotFoundException::class.java)
                .hasMessageContaining("일정을 찾을 수 없습니다. ID: $eventId")

            verify(exactly = 1) { eventRepository.findById(eventId) }
            verify(exactly = 0) { eventRepository.update(any(), any()) }
        }

        @Test
        @DisplayName("변경 사항이 없으면 예외 발생")
        fun `updateEvent - 변경 사항 없음`() {
            val existingEvent = createTestEvent()
            val updateRequest = UpdateEventRequest()

            every { eventRepository.findById(eventId) } returns existingEvent

            assertThatThrownBy {
                eventService.updateEvent(eventId, userId, updateRequest)
            }
                .isInstanceOf(IllegalArgumentException::class.java)
                .hasMessageContaining("변경할 내용이 없습니다")
        }
    }

    @Nested
    @DisplayName("deleteEvent 테스트")
    inner class DeleteEventTest {

        @Test
        @DisplayName("일정 삭제 성공")
        fun `deleteEvent - 성공`() {
            val event = createTestEvent()

            every { eventRepository.findById(eventId) } returns event
            every { eventRepository.deleteById(eventId) } returns true

            eventService.deleteEvent(eventId, userId)

            verify(exactly = 1) { eventRepository.findById(eventId) }
            verify(exactly = 1) { eventRepository.deleteById(eventId) }
        }

        @Test
        @DisplayName("다른 사용자의 일정 삭제 시 예외 발생")
        fun `deleteEvent - 권한 없음`() {
            val otherUserId = 999L
            val event = createTestEvent().copy(userId = otherUserId)

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
        fun `deleteEvent - 존재하지 않는 일정`() {
            every { eventRepository.findById(eventId) } returns null

            assertThatThrownBy {
                eventService.deleteEvent(eventId, userId)
            }
                .isInstanceOf(EventNotFoundException::class.java)
                .hasMessageContaining("일정을 찾을 수 없습니다. ID: $eventId")

            verify(exactly = 1) { eventRepository.findById(eventId) }
            verify(exactly = 0) { eventRepository.deleteById(any()) }
        }
    }

    private fun createTestEvent(
        id: Long = eventId,
        title: String = "테스트 일정"
    ): Event {
        return Event(
            id = id,
            userId = userId,
            title = title,
            description = "테스트 설명",
            location = "테스트 장소",
            startTime = now.plusDays(1),
            endTime = now.plusDays(1).plusHours(1),
            category = EventCategory.OTHER,
            allDay = false,
            createdAt = now,
            updatedAt = now
        )
    }
}
