package com.mcp.calandar.model.table

import org.jetbrains.exposed.dao.id.LongIdTable
import org.jetbrains.exposed.sql.kotlin.datetime.datetime

object EventTable : LongIdTable("events") {
    val userId = reference("user_id", UserTable)
    val title = varchar("title", 255)
    val description = text("description").nullable()
    val location = varchar("location", 255).nullable()
    val startTime = datetime("start_time")
    val endTime = datetime("end_time")
    val createdAt = datetime("created_at")
    val updatedAt = datetime("updated_at")
}