package com.mcp.calendar.model.table

import org.jetbrains.exposed.dao.id.LongIdTable
import org.jetbrains.exposed.sql.javatime.date
import org.jetbrains.exposed.sql.javatime.datetime

object TransactionTable : LongIdTable("transactions") {
    val userId = reference("user_id", UserTable)
    val type = varchar("type", 20)
    val category = varchar("category", 20)
    val amount = decimal("amount", 15, 2)
    val description = varchar("description", 255)
    val date = date("date")
    val memo = text("memo").nullable()
    val createdAt = datetime("created_at")
    val updatedAt = datetime("updated_at")
}