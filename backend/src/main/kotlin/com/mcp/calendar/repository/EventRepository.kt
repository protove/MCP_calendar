package com.mcp.calendar.repository

import com.mcp.calendar.model.Event
import com.mcp.calendar.model.EventCategory
import com.mcp.calendar.model.table.EventTable
import com.mcp.calendar.model.table.UserTable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.greaterEq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.less
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime


@Repository
@Transactional
class EventRepository {

    // 일정 저장
    fun save(event: Event): Event {
        val id = EventTable.insertAndGetId {
            it[userId] = event.userId
            it[title] = event.title
            it[description] = event.description
            it[location] = event.location
            it[startTime] = event.startTime
            it[endTime] = event.endTime
            it[category] = event.category.name
            it[allDay] = event.allDay
            it[createdAt] = event.createdAt
            it[updatedAt] = event.updatedAt
        }

        return requireNotNull(findById(id.value)) {
            "방금 저장한 레코드를 찾을 수 없습니다. ID: ${id.value}"
        }
    }

    // ID로 일정 조회
    @Transactional(readOnly = true)
    fun findById(id: Long): Event? {
        return EventTable.select { EventTable.id eq id }
            .map { rowToEvent(it) }
            .singleOrNull()
    }

    // 특정 사용자의 모든 일정 조회
    @Transactional(readOnly = true)
    fun findAllByUserId(userId: Long): List<Event> {
        return EventTable.select { EventTable.userId eq userId }
            .orderBy(EventTable.startTime, SortOrder.ASC)
            .map { rowToEvent(it) }
    }

    // 특정 사용자의 월별 일정 조회
    @Transactional(readOnly = true)
    fun findByUserIdAndMonth(userId: Long, year: Int, month: Int): List<Event> {
        val startOfMonth = LocalDateTime.of(year, month, 1, 0, 0, 0)
        val endOfMonth = startOfMonth.plusMonths(1)

        return EventTable.select {
            (EventTable.userId eq userId) and
            (EventTable.startTime greaterEq startOfMonth) and
            (EventTable.startTime less endOfMonth)
        }
            .orderBy(EventTable.startTime, SortOrder.ASC)
            .map { rowToEvent(it) }
    }

    // 일정 수정
    fun update(id: Long, event: Event): Event? {
        val updatedCount = EventTable.update({ EventTable.id eq id }) {
            it[title] = event.title
            it[description] = event.description
            it[location] = event.location
            it[startTime] = event.startTime
            it[endTime] = event.endTime
            it[category] = event.category.name
            it[allDay] = event.allDay
            it[updatedAt] = LocalDateTime.now()
        }

        return if (updatedCount > 0) findById(id) else null
    }

    // 일정 삭제
    fun deleteById(id: Long): Boolean {
        return EventTable.deleteWhere { EventTable.id eq id } > 0
    }

    // ResultRow → Event 변환
    private fun rowToEvent(row: ResultRow): Event {
        return Event(
            id = row[EventTable.id].value,
            userId = row[EventTable.userId].value,
            title = row[EventTable.title],
            description = row[EventTable.description],
            location = row[EventTable.location],
            startTime = row[EventTable.startTime],
            endTime = row[EventTable.endTime],
            category = EventCategory.fromString(row[EventTable.category]),
            allDay = row[EventTable.allDay],
            createdAt = row[EventTable.createdAt],
            updatedAt = row[EventTable.updatedAt]
        )
    }
}