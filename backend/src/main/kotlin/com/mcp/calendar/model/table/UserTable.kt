package com.mcp.calendar.model.table

import org.jetbrains.exposed.dao.id.LongIdTable
import org.jetbrains.exposed.sql.javatime.datetime

object UserTable : LongIdTable("users") {
    val email = varchar("email", 255).uniqueIndex()
    val password = varchar("password", 255)
    val name = varchar("name", 100)
    val role = varchar("role", 20).default("USER")
    val createdAt = datetime("created_at")
    val updatedAt = datetime("updated_at")
}