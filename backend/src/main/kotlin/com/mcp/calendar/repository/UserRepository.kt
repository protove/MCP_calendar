package com.mcp.calendar.repository

import com.mcp.calendar.model.User
import com.mcp.calendar.model.UserRole
import com.mcp.calendar.model.table.UserTable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Repository
@Transactional
class UserRepository {

    fun save(user: User): User {
        val now = LocalDateTime.now()
        val id = UserTable.insertAndGetId {
            it[email] = user.email
            it[password] = user.password
            it[name] = user.name
            it[role] = user.role.name
            it[createdAt] = now
            it[updatedAt] = now
        }
        return user.copy(id = id.value, createdAt = now, updatedAt = now)
    }

    @Transactional(readOnly = true)
    fun findById(id: Long): User? {
        return UserTable.select { UserTable.id eq id }
            .map { toUser(it) }
            .singleOrNull()
    }

    @Transactional(readOnly = true)
    fun findByEmail(email: String): User? {
        return UserTable.select { UserTable.email eq email }
            .map { toUser(it) }
            .singleOrNull()
    }

    @Transactional(readOnly = true)
    fun existsByEmail(email: String): Boolean {
        return UserTable.select { UserTable.email eq email }
            .count() > 0
    }

    private fun toUser(row: ResultRow): User {
        return User(
            id = row[UserTable.id].value,
            email = row[UserTable.email],
            password = row[UserTable.password],
            name = row[UserTable.name],
            role = UserRole.fromString(row[UserTable.role]),
            createdAt = row[UserTable.createdAt],
            updatedAt = row[UserTable.updatedAt]
        )
    }
}
