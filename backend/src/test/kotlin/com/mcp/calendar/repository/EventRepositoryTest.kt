package com.mcp.calendar.repository

import com.mcp.calendar.model.Event
import com.mcp.calendar.model.User
import com.mcp.calendar.model.table.EventTable
import com.mcp.calendar.model.table.UserTable
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.*
import java.time.LocalDateTime

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class EventRepositoryTest {
    
    private lateinit var repository: EventRepository
    private var testUserId: Long = 0

    @BeforeAll
    fun setup() {
        Database.connect(
            url = "jdbc:h2:mem:test;DB_CLOSE_DELAY=-1",
            driver = "org.h2.Driver"
        )

        transaction {
            SchemaUtils.create(UserTable, EventTable)

            testUserId = UserTable.insertAndGetId {
                it[email] = "test@example.com"
                it[password] = "password"
                it[name] = "테스트"
                it[createdAt] = LocalDateTime.now()
            }.value
        }

        repository = EventRepository()
    }

    @AfterAll
    fun teardown() {
        transaction {
            SchemaUtils.drop(UserTable, EventTable)
        }
    }

    @Test
    fun 'save - 일정 저장 성공'() {
        val event = createTestEvent()

        val saved = repository.save(event)

        assertNotNull(saved.id)
        assertEquals(event.userId, saved.userId)
        assertEquals(event.title, saved.title)
        
    }

    @Test
    fun 'findById - 존재하는 ID 조회 성공'() {
        val event = createTestEvent()
        val saved = repository.save(event)

        val found = repository.findById(saved.id)

        assertNotNull(found)
        assertEquals(saved.id, found!!.id)
        assertEquals(saved.title, found.title)
    }

    @Test
    fun 'findById - 존재하지 않는 ID 조회'() {
        val found = repository.findById(999999L)
        assertNull(found)
    }

    @Test
    fun 'findAllByUserId - 특정 사용자 모든 일정 조회'() {
    
        repository.save(createTestEvent("일정 1"))
        repository.save(createTestEvent("일정 2"))
        repository.save(createTestEvent("일정 3"))

        val events = repository.findAllByUserId(testUserId)

        assertEquals(3, events.size)
        assertTrue(events[0].startTime >= events[1].startTime) // 최신순 조회 확인
    }

    @Test
    fun 'update - 일정 수정 성공'() {
        val event = createTestEvent("원본 제목")
        val saved = repository.save(event)

        val updated = saved.copy(
            title = "수정된 제목",
            location = "영국"
        )

        val result = repository.update(saved.id, updated)

        assertNotNull(result)
        assertEquals("수정된 제목", result!!.title)
        assertEquals("영국", result.location)
    }

    @Test
    fun 'update - 존재하지 않는 ID 수정 시도'() {
        val event = createTestEvent()

        val result = repository.update(999999L, event)

        assertNull(result)
    }

    @Test
    fun 'deleteById - 일정 삭제 성공'() {
        val event = createTestEvent()
        val saved = repository.save(event)

        val deleted = repository.deleteById(saved.id)

        assertTrue(deleted)
        assertNull(repository.findById(saved.id))
    }

    @Test
    fun 'deletebyId - 존재하지 않는 ID 삭제 시도'() {
        val deleted = repository.deleteById(999999L)
        assertFalse(deleted)
    }

    private fun createTestEvent(title: String = "테스트 일정"): Event {
        return Event(
            userId = testUserId,
            title = title,
            description = "설명",
            location = "대한민국",
            startTime = LocalDateTime.now().plusDays(1),
            endTime = LocalDateTime.now().plusDays(1).plusHours(2),
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
    }
}