package com.mcp.calendar.repository

import com.mcp.calendar.model.Transaction
import com.mcp.calendar.model.TransactionType
import com.mcp.calendar.model.TransactionCategory
import com.mcp.calendar.model.table.TransactionTable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime

@Repository
@Transactional
class TransactionRepository {

    fun save(transaction: Transaction): Transaction {
        val id = TransactionTable.insertAndGetId {
            it[userId] = transaction.userId
            it[type] = transaction.type.name
            it[category] = transaction.category.name
            it[amount] = transaction.amount
            it[description] = transaction.description
            it[date] = transaction.date
            it[memo] = transaction.memo
            it[createdAt] = transaction.createdAt
            it[updatedAt] = transaction.updatedAt
        }

        return requireNotNull(findById(id.value)) {
            "방금 저장한 거래 내역을 찾을 수 없습니다 ID: ${id.value}"
        }
    }

    @Transactional(readOnly = true)
    fun findById(id: Long): Transaction? {
        return TransactionTable.selectAll()
            .where { TransactionTable.id eq id }
            .map { rowToTransaction(it) }
            .singleOrNull()
    }

    @Transactional(readOnly = true)
    fun findAllByUserId(userId: Long): List<Transaction> {
        return TransactionTable.selectAll()
            .where { TransactionTable.userId eq userId }
            .orderBy(TransactionTable.date, SortOrder.DESC)
            .map { rowToTransaction(it) }
    }

    //특정 사용자 월별 거래내역
    @Transactional(readOnly = true)
    fun findByUserIdAndMonth(userId: Long, year: Int, month: Int): List<Transaction> {
        val startOfMonth = LocalDate.of(year, month, 1)
        val endOfMonth = startOfMonth.plusMonths(1).minusDays(1)

        return TransactionTable.selectAll()
            .where {
                (TransactionTable.userId eq userId) and
                (TransactionTable.date greaterEq startOfMonth) and
                (TransactionTable.date lessEq endOfMonth)
            }
            .orderBy(TransactionTable.date, SortOrder.DESC)
            .map { rowToTransaction(it) }
    }

    //특정 사용자 기간별 거래내역
    @Transactional(readOnly = true)
    fun findByUserIdAndDateRange(userId: Long, startDate: LocalDate, endDate: LocalDate): List<Transaction> {
        return TransactionTable.selectAll()
            .where {
                (TransactionTable.userId eq userId) and
                (TransactionTable.date greaterEq startDate) and
                (TransactionTable.date lessEq endDate)
            }
            .orderBy(TransactionTable.date, SortOrder.DESC)
            .map { rowToTransaction(it) }
    }

    //특정 사용자 거래 유형별 조회(수입/지출)
    @Transactional(readOnly = true)
    fun findByUserIdAndType(userId: Long, type: TransactionType): List<Transaction> {
        return TransactionTable.selectAll()
            .where {
                (TransactionTable.userId eq userId) and
                (TransactionTable.type eq type.name)
            }
            .orderBy(TransactionTable.date, SortOrder.DESC)
            .map { rowToTransaction(it) }
    }

    //특정 사용자 카테고리별 조회
    @Transactional(readOnly = true)
    fun findByUserIdAndCategory(userId: Long, category: TransactionCategory): List<Transaction> {
        return TransactionTable.selectAll()
            .where {
                (TransactionTable.userId eq userId) and
                (TransactionTable.category eq category.name)
            }
            .orderBy(TransactionTable.date, SortOrder.DESC)
            .map { rowToTransaction(it) }
    }
    
    //특정 사용자의 월별 + 거래 유형별 조회
    @Transactional(readOnly = true)
    fun findByUserIdAndMonthAndType(userId: Long, year: Int, month: Int, type: TransactionType): List<Transaction> {
        val startOfMonth = LocalDate.of(year, month, 1)
        val endOfMonth = startOfMonth.plusMonths(1).minusDays(1)

        return TransactionTable.selectAll()
            .where {
                (TransactionTable.userId eq userId) and
                (TransactionTable.date greaterEq startOfMonth) and
                (TransactionTable.date lessEq endOfMonth) and
                (TransactionTable.type eq type.name)
            }
            .orderBy(TransactionTable.date, SortOrder.DESC)
            .map { rowToTransaction(it) }
    }

    //거래 내역 수정
    fun update(id: Long, transaction: Transaction): Boolean {
        val updatedCount = TransactionTable.update({ TransactionTable.id eq id }) {
            it[type] = transaction.type.name
            it[category] = transaction.category.name
            it[amount] = transaction.amount
            it[description] = transaction.description
            it[date] = transaction.date
            it[memo] = transaction.memo
            it[updatedAt] = LocalDateTime.now()
        }

        return if (updatedCount > 0) findById(id) else null
    }

    //거래 내역 삭제
    fun deleteById(id: Long): Boolean {
        return TransactionTable.deleteWhere { TransactionTable.id eq id } > 0
    }

    //ResultRow -> Transaction 변환
    private fun rowToTransaction(row: ResultRow): Transaction {
        return Transaction(
            id = row[TransactionTable.id].value,
            userId = row[TransactionTable.userId].value,
            type = TransactionType.fromString(row[TransactionTable.type]),
            category = TransactionCategory.fromString(row[TransactionTable.category]),
            amount = row[TransactionTable.amount],
            description = row[TransactionTable.description],
            date = row[TransactionTable.date],
            memo = row[TransactionTable.memo],
            createdAt = row[TransactionTable.createdAt],
            updatedAt = row[TransactionTable.updatedAt]
        )
    }
}