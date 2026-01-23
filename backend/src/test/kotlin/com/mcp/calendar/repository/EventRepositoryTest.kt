package com.mcp.calendar.repository

import com.mcp.calendar.model.Event
import com.mcp.calendar.model.EventCategory
import com.mcp.calendar.model.table.EventTable
import com.mcp.calendar.model.table.UserTable
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.deleteAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.*
import java.time.LocalDateTime

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("EventRepository 단위 테스트")
class EventRepositoryTest {

    private lateinit var repository: EventRepository
    private var testUserId: Long = 0

    @BeforeAll
    fun setup() {
        Database.connect(
            url = "jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
            driver = "org.h2.Driver"
        )

        transaction {
            SchemaUtils.create(UserTable, EventTable)

            testUserId = UserTable.insertAndGetId {
                it[email] = "test@example.com"
                it[password] = "password123"
                it[name] = "테스트유저"
                it[createdAt] = LocalDateTime.now()
            }.value
        }

        repository = EventRepository()
    }

    @BeforeEach
    fun cleanUp() {
        transaction {
            EventTable.deleteAll()
        }
    }

    @AfterAll
    fun teardown() {
        transaction {
            SchemaUtils.drop(EventTable, UserTable)
        }
    }

    @Test
    @DisplayName("save - 일정 저장 성공")
    fun `save - 일정 저장 성공`() {
        val event = createTestEvent()

        val saved = transaction { repository.save(event) }

        assertNotNull(saved.id)
        assertTrue(saved.id > 0)
        assertEquals(event.title, saved.title)
        assertEquals(event.category, saved.category)
        assertEquals(event.allDay, saved.allDay)
    }

    @Test
    @DisplayName("findById - 존재하는 ID 조회 성공")
    fun `findById - 존재하는 ID 조회 성공`() {
        val event = createTestEvent()
        val saved = transaction { repository.save(event) }

        val found = transaction { repository.findById(saved.id) }

        assertNotNull(found)
        assertEquals(saved.id, found!!.id)
        assertEquals(saved.title, found.title)
        assertEquals(saved.category, found.category)
    }

    @Test
    @DisplayName("findById - 존재하지 않는 ID 조회")
    fun `findById - 존재하지 않는 ID 조회`() {
        val found = transaction { repository.findById(999999L) }
        assertNull(found)
    }

    @Test
    @DisplayName("findAllByUserId - 특정 사용자 모든 일정 조회")
    fun `findAllByUserId - 특정 사용자 모든 일정 조회`() {
        transaction {
            repository.save(createTestEvent("일정 1"))
            repository.save(createTestEvent("일정 2"))
            repository.save(createTestEvent("일정 3"))
        }

        val events = transaction { repository.findAllByUserId(testUserId) }

        assertEquals(3, events.size)
    }

    @Test
    @DisplayName("findByUserIdAndMonth - 월별 일정 조회")
    fun `findByUserIdAndMonth - 월별 일정 조회`() {
        val now = LocalDateTime.now()
        val currentYear = now.year
        val currentMonth = now.monthValue

        transaction {
            repository.save(createTestEvent("이번달 일정 1", now.plusDays(1)))
            repository.save(createTestEvent("이번달 일정 2", now.plusDays(2)))
            repository.save(createTestEvent("다음달 일정", now.plusMonths(1)))
        }

        val events = transaction {
            repository.findByUserIdAndMonth(testUserId, currentYear, currentMonth)
        }

        assertEquals(2, events.size)
        assertTrue(events.all { it.title.contains("이번달") })
    }

    @Test
    @DisplayName("update - 일정 수정 성공")
    fun `update - 일정 수정 성공`() {
        val event = createTestEvent("원본 제목")
        val saved = transaction { repository.save(event) }

        val updated = saved.copy(
            title = "수정된 제목",
            location = "수정된 장소",
            category = EventCategory.IMPORTANT
        )

        val result = transaction { repository.update(saved.id, updated) }

        assertNotNull(result)
        assertEquals("수정된 제목", result!!.title)
        assertEquals("수정된 장소", result.location)
        assertEquals(EventCategory.IMPORTANT, result.category)
    }

    @Test
    @DisplayName("update - 존재하지 않는 ID 수정 시도")
    fun `update - 존재하지 않는 ID 수정 시도`() {
        val event = createTestEvent()

        val result = transaction { repository.update(999999L, event) }

        assertNull(result)
    }

    @Test
    @DisplayName("deleteById - 일정 삭제 성공")
    fun `deleteById - 일정 삭제 성공`() {
        val event = createTestEvent()
        val saved = transaction { repository.save(event) }

        val deleted = transaction { repository.deleteById(saved.id) }

        assertTrue(deleted)
        assertNull(transaction { repository.findById(saved.id) })
    }

    @Test
    @DisplayName("deleteById - 존재하지 않는 ID 삭제 시도")
    fun `deleteById - 존재하지 않는 ID 삭제 시도`() {
        val deleted = transaction { repository.deleteById(999999L) }
        assertFalse(deleted)
    }

    private fun createTestEvent(
        title: String = "테스트 일정",
        startTime: LocalDateTime = LocalDateTime.now().plusDays(1)
    ): Event {
        return Event(
            userId = testUserId,
            title = title,
            description = "테스트 설명",
            location = "테스트 장소",
            startTime = startTime,
            endTime = startTime.plusHours(2),
            category = EventCategory.OTHER,
            allDay = false,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
    }
}