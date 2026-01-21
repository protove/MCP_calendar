package com.mcp.calendar.repository

import com.mcp.calendar.model.Event
import com.mcp.calendar.model.table.EventTable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
class EventRepository {
    
    fun save(event: Event): Event = transaction {
        val id = EventTable.insertAndGetId {
            it[userId] = event.userId
            it[title] = event.title
            it[description] = event.description
            it[location] = event.location
            it[startTime] = event.startTime
            it[endTime] = event.endTime
            it[createdAt] = event.createdAt
            it[updatedAt] = event.updatedAt
        }

        requireNotNull(findById(id.value)){
            "방금 저장한 레코드를 찾을 수 없습니다. ID: ${id.value}"
        }
    }

    fun findById(id: Long): Event? = transaction {
        EventTable.select { EventTable.id eq id }
            .map { rowToEvent(it) }
            .singleOrNull()
    }

    fun findAllByUserId(userId: Long): List<Event> = transaction {
        EventTable.select { EventTable.userId eq userId }
            .orderBy(EventTable.startTime, SortOrder.DESC)
            .map { rowToEvent(it) }
    }

    

    fun update(id: Long, event: Event): Event? = transaction {
        val updatedCount = EventTable.update({ EventTable.id eq id }) {
            it[title] = event.title
            it[description] = event.description
            it[location] = event.location
            it[startTime] = event.startTime
            it[endTime] = event.endTime
            it[updatedAt] = LocalDateTime.now()
        }

        if (updatedCount == 0) {
            null
        } else {
            findById(id)
        }
    }

    fun deleteById(id: Long): Boolean = transaction {
        EventTable.deleteWhere { EventTable.id eq id } > 0
    }

    private fun rowToEvent(row: ResultRow): Event {
        return Event(
            id = row[EventTable.id].value,
            userId = row[EventTable.userId].value,
            title = row[EventTable.title],
            description = row[EventTable.description],
            location = row[EventTable.location],
            startTime = row[EventTable.startTime],
            endTime = row[EventTable.endTime],
            createdAt = row[EventTable.createdAt],
            updatedAt = row[EventTable.updatedAt]
        )
    }

}