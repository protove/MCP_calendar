package com.mcp.calendar.service

import com.mcp.calendar.dto.request.CreateTransactionRequest
import com.mcp.calendar.dto.request.UpdateTransactionRequest
import com.mcp.calendar.dto.response.TransactionResponse
import com.mcp.calendar.dto.response.TransactionSummaryResponse
import com.mcp.calendar.exception.TransactionNotFoundException
import com.mcp.calendar.model.Transaction
import com.mcp.calendar.model.TransactionType
import com.mcp.calendar.model.TransactionCategory
import com.mcp.calendar.repository.TransactionRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate

@Service
@Transactional
class TransactionService(
    private val transactionRepository: TransactionRepository
){

    //거래 내역 생성
    fun createTransaction(userId: Long, request: CreateTransactionRequest): TransactionResponse {
        request.validate()

        val transaction = Transaction(
            userId = userId,
            type = TransactionType.fromString(request.type),
            category = TransactionCategory.fromString(request.category),
            amount = request.amount,
            description = request.description,
            date = request.date,
            memo = request.memo
        )

        val savedTransaction = transactionRepository.save(transaction)
        return TransactionResponse.from(savedTransaction)
    }

    //거래 내역 단건 조회
    @Transactional(readOnly = true)
    fun getTransaction(id: Long): TransactionResponse {
        val transaction = transactionRepository.findById(id)
            ?: throw TransactionNotFoundException("거래 내역을 찾을 수 없습니다 ID: $id")
        return TransactionResponse.from(transaction)
    }

    //특정 사용자의 전체 거래 내역 조회
    @Transactional(readOnly = true)
    fun getAllTransactions(userId: Long): List<TransactionResponse> {
        return transactionRepository.findAllByUserId(userId)
            .map { TransactionResponse.from(it) }
    }

    //특정 사용자의 월별 거래 내역 조회
    @Transactional(readOnly = true)
    fun getMonthlyTransactions(userId: Long, year: Int, month: Int): List<TransactionResponse> {
        return transactionRepository.findByUserIdAndMonth(userId, year, month)
            .map { TransactionResponse.from(it) }
    }

    // 특정 사용자의 기간별 거래 내역 조회
    @Transactional(readOnly = true)
    fun getTransactionsByDateRange(userId: Long, startDate: LocalDate, endDate: LocalDate): List<TransactionResponse> {
        require(!startDate.isAfter(endDate)) {
            "시작일은 종료일보다 이후일 수 없습니다."
        }
        return transactionRepository.findByUserIdAndDateRange(userId, startDate, endDate)
            .map { TransactionResponse.from(it) }
    }

    //특정 사용자의 거래 유형별 조회
    @Transactional(readOnly = true)
    fun getTransactionsByType(userId: Long, type: TransactionType): List<TransactionResponse> {
        return transactionRepository.findByUserIdAndType(userId, type)
            .map { TransactionResponse.from(it) }
    }

    //특정 사용자의 거래 카테고리별 조회
    @Transactional(readOnly = true)
    fun getTransactionsByCategory(userId: Long, category: TransactionCategory): List<TransactionResponse> {
        return transactionRepository.findByUserIdAndCategory(userId, category)
            .map { TransactionResponse.from(it) }
    }

    //월별 거래 요약 조회(총 수입, 총 지출, 잔액, 거래 건수)
    @Transactional(readOnly = true)
    fun getMonthlySummary(userId: Long, year: Int, month: Int): TransactionSummaryResponse {
        val transactions = transactionRepository.findByUserIdAndMonth(userId, year, month)

        if (transactions.isEmpty()) {
            return TransactionSummaryResponse.empty()
        }

        val totalIncome = transactions
            .filter { it.type == TransactionType.INCOME }
            .sumOf { it.amount }

        val totalExpense = transactions
            .filter { it.type == TransactionType.EXPENSE }
            .sumOf { it.amount }

        return TransactionSummaryResponse.of(
            totalIncome = totalIncome,
            totalExpense = totalExpense,
            transactionCount = transactions.size
        )
    }

    //거래 내역 수정
    fun updateTransaction(id: Long, userId: Long, request: UpdateTransactionRequest): TransactionResponse {
        val existingTransaction = transactionRepository.findById(id)
            ?: throw TransactionNotFoundException("거래 내역을 찾을 수 없습니다 ID: $id")
        
        require(existingTransaction.userId == userId) {
            "해당 거래 내역을 수정할 권한이 없습니다."
        }

        require(request.hasChanges()) {
            "변경할 내용이 없습니다."
        }

        request.validate()

        val updatedTransaction = existingTransaction.copy(
            type = request.type?.let { TransactionType.fromString(it) } ?: existingTransaction.type,
            category = request.category?.let { TransactionCategory.fromString(it) } ?: existingTransaction.category,
            amount = request.amount ?: existingTransaction.amount,
            description = request.description ?: existingTransaction.description,
            date = request.date ?: existingTransaction.date,
            memo = request.memo ?: existingTransaction.memo
        )

        val result = transactionRepository.update(id, updatedTransaction)
            ?: throw TransactionNotFoundException("거래 내역 수정에 실패했습니다 ID: $id")
        
        return TransactionResponse.from(result)
    }

    //거래 내역 삭제
    fun deleteTransaction(id: Long, userId: Long) {
        val existingTransaction = transactionRepository.findById(id)
            ?: throw TransactionNotFoundException("거래 내역을 찾을 수 없습니다 ID: $id")
        
        require(existingTransaction.userId == userId) {
            "해당 거래 내역을 삭제할 권한이 없습니다."
        }

        transactionRepository.deleteById(id)
    }

    //카테고리별 지출 통계 조회
    @Transactional(readOnly = true)
    fun getCategoryExpenseStats(userId: Long, year: Int, month: Int): Map<TransactionCategory, BigDecimal> {
        val transactions = transactionRepository.findByUserIdAndMonthAndType(userId, year, month, TransactionType.EXPENSE)

        return transactions
            .groupBy { it.category }
            .mapValues { (_, txlist) -> txlist.sumOf { it.amount } }
    }
}

