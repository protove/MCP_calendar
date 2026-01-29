package com.mcp.calendar.service

import com.mcp.calendar.dto.request.CreateTransactionRequest
import com.mcp.calendar.dto.request.UpdateTransactionRequest
import com.mcp.calendar.exception.TransactionNotFoundException
import com.mcp.calendar.model.Transaction
import com.mcp.calendar.model.TransactionCategory
import com.mcp.calendar.model.TransactionType
import com.mcp.calendar.repository.TransactionRepository
import io.mockk.every
import io.mockk.junit5.MockKExtension
import io.mockk.mockk
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@ExtendWith(MockKExtension::class)
@DisplayName("TransactionService 단위 테스트")
class TransactionServiceTest {

    private lateinit var transactionRepository: TransactionRepository
    private lateinit var transactionService: TransactionService

    private val now = LocalDateTime.now()
    private val today = LocalDate.now()
    private val userId = 1L
    private val transactionId = 100L

    @BeforeEach
    fun setup() {
        transactionRepository = mockk()
        transactionService = TransactionService(transactionRepository)
    }

    @Nested
    @DisplayName("createTransaction 테스트")
    inner class CreateTransactionTest {

        @Test
        @DisplayName("거래 생성 성공")
        fun `createTransaction - 성공`() {
            val request = CreateTransactionRequest(
                type = "expense",
                category = "food",
                amount = BigDecimal("15000"),
                description = "점심 식사",
                date = today,
                memo = "회사 근처 식당"
            )

            val expectedTransaction = Transaction(
                id = transactionId,
                userId = userId,
                type = TransactionType.EXPENSE,
                category = TransactionCategory.FOOD,
                amount = request.amount,
                description = request.description,
                date = request.date,
                memo = request.memo,
                createdAt = now,
                updatedAt = now
            )

            every { transactionRepository.save(any()) } returns expectedTransaction

            val result = transactionService.createTransaction(userId, request)

            assertThat(result.id).isEqualTo(transactionId)
            assertThat(result.type).isEqualTo("expense")
            assertThat(result.category).isEqualTo("food")
            assertThat(result.amount).isEqualTo(BigDecimal("15000"))

            verify(exactly = 1) { transactionRepository.save(any()) }
        }

        @Test
        @DisplayName("금액이 0 이하일 경우 예외 발생")
        fun `createTransaction - 금액 0 이하 예외`() {
            val request = CreateTransactionRequest(
                type = "expense",
                category = "food",
                amount = BigDecimal.ZERO,
                description = "잘못된 거래",
                date = today
            )

            assertThatThrownBy { transactionService.createTransaction(userId, request) }
                .isInstanceOf(IllegalArgumentException::class.java)
                .hasMessageContaining("금액은 0보다 커야 합니다")
        }
    }

    @Nested
    @DisplayName("getTransaction 테스트")
    inner class GetTransactionTest {

        @Test
        @DisplayName("거래 내역 조회 성공")
        fun `getTransaction - 성공`() {
            val transaction = createTestTransaction()

            every { transactionRepository.findById(transactionId) } returns transaction

            val result = transactionService.getTransaction(transactionId)

            assertThat(result.id).isEqualTo(transactionId)
            assertThat(result.description).isEqualTo(transaction.description)

            verify(exactly = 1) { transactionRepository.findById(transactionId) }
        }

        @Test
        @DisplayName("존재하지 않는 거래 조회 시 예외 발생")
        fun `getTransaction - 존재하지 않는 거래 예외`() {
            every { transactionRepository.findById(transactionId) } returns null

            assertThatThrownBy { transactionService.getTransaction(transactionId) }
                .isInstanceOf(TransactionNotFoundException::class.java)
                .hasMessageContaining("거래 내역을 찾을 수 없습니다")

            verify(exactly = 1) { transactionRepository.findById(transactionId) }
        }
    }

    @Nested
    @DisplayName("getAllTransactions 테스트")
    inner class GetAllTransactionsTest {

        @Test
        @DisplayName("사용자의 모든 거래 내역 조회 성공")
        fun `getAllTransactions - 성공`() {
            val transactions = listOf(
                createTestTransaction(id = 1L, description = "거래 1"),
                createTestTransaction(id = 2L, description = "거래 2")
            )

            every { transactionRepository.findAllByUserId(userId) } returns transactions

            val result = transactionService.getAllTransactions(userId)

            assertThat(result).hasSize(2)
            assertThat(result[0].description).isEqualTo("거래 1")
            assertThat(result[1].description).isEqualTo("거래 2")

            verify(exactly = 1) { transactionRepository.findAllByUserId(userId) }
        }

        @Test
        @DisplayName("거래 내역이 없는 사용자 조회 시 빈 리스트 반환")
        fun `getAllTransactions - 빈 리스트`() {
            every { transactionRepository.findAllByUserId(userId) } returns emptyList()

            val result = transactionService.getAllTransactions(userId)

            assertThat(result).isEmpty()

            verify(exactly = 1) { transactionRepository.findAllByUserId(userId) }
        }
    }

    @Nested
    @DisplayName("getMonthlyTransactions 테스트")
    inner class GetMonthlyTransactionsTest {

        @Test
        @DisplayName("월별 거래 내역 조회 성공")
        fun `getMonthlyTransactions - 성공`() {
            val transactions = listOf(
                createTestTransaction(id = 1L, description = "1월 거래 1"),
                createTestTransaction(id = 2L, description = "1월 거래 2")
            )

            every { transactionRepository.findByUserIdAndMonth(userId, 2026, 1) } returns transactions

            val result = transactionService.getMonthlyTransactions(userId, 2026, 1)

            assertThat(result).hasSize(2)

            verify(exactly = 1) { transactionRepository.findByUserIdAndMonth(userId, 2026, 1) }
        }
    }

    @Nested
    @DisplayName("getMonthlySummary 테스트")
    inner class GetMonthlySummaryTest {

        @Test
        @DisplayName("월별 거래 요약 조회 성공")
        fun `getMonthlySummary - 성공`() {
            val transactions = listOf(
                createTestTransaction(id = 1L, type = TransactionType.INCOME, amount = BigDecimal("1000000")),
                createTestTransaction(id = 2L, type = TransactionType.EXPENSE, amount = BigDecimal("300000")),
                createTestTransaction(id = 3L, type = TransactionType.EXPENSE, amount = BigDecimal("200000"))
            )

            every { transactionRepository.findByUserIdAndMonth(userId, 2026, 1) } returns transactions

            val result = transactionService.getMonthlySummary(userId, 2026, 1)

            assertThat(result.totalIncome).isEqualByComparingTo(BigDecimal("1000000"))
            assertThat(result.totalExpense).isEqualByComparingTo(BigDecimal("500000"))
            assertThat(result.balance).isEqualByComparingTo(BigDecimal("500000"))
            assertThat(result.transactionCount).isEqualTo(3)

            verify(exactly = 1) { transactionRepository.findByUserIdAndMonth(userId, 2026, 1) }
        }

        @Test
        @DisplayName("거래 내역이 없을 경우 빈 요약 반환")
        fun `getMonthlySummary - 빈 결과`() {
            every { transactionRepository.findByUserIdAndMonth(userId, 2026, 1) } returns emptyList()

            val result = transactionService.getMonthlySummary(userId, 2026, 1)

            assertThat(result.totalIncome).isEqualByComparingTo(BigDecimal.ZERO)
            assertThat(result.totalExpense).isEqualByComparingTo(BigDecimal.ZERO)
            assertThat(result.balance).isEqualByComparingTo(BigDecimal.ZERO)
            assertThat(result.transactionCount).isEqualTo(0)

            verify(exactly = 1) { transactionRepository.findByUserIdAndMonth(userId, 2026, 1) }
        }
    }

    @Nested
    @DisplayName("updateTransaction 테스트")
    inner class UpdateTransactionTest {

        @Test
        @DisplayName("거래 내역 수정 성공")
        fun `updateTransaction - 성공`() {
            val existingTransaction = createTestTransaction()

            val updateRequest = UpdateTransactionRequest(
                type = "income",
                category = "salary",
                amount = BigDecimal("5000000"),
                description = "월급"
            )

            val updatedTransaction = existingTransaction.copy(
                type = TransactionType.INCOME,
                category = TransactionCategory.SALARY,
                amount = BigDecimal("5000000"),
                description = "월급"
            )

            every { transactionRepository.findById(transactionId) } returns existingTransaction
            every { transactionRepository.update(transactionId, any()) } returns updatedTransaction

            val result = transactionService.updateTransaction(transactionId, userId, updateRequest)

            assertThat(result.type).isEqualTo("income")
            assertThat(result.category).isEqualTo("salary")
            assertThat(result.amount).isEqualByComparingTo(BigDecimal("5000000"))

            verify(exactly = 1) { transactionRepository.findById(transactionId) }
            verify(exactly = 1) { transactionRepository.update(transactionId, any()) }
        }

        @Test
        @DisplayName("다른 사용자의 거래 수정 시 예외 발생")
        fun `updateTransaction - 권한 없음 예외`() {
            val otherUserId = 999L
            val existingTransaction = createTestTransaction().copy(userId = otherUserId)

            val updateRequest = UpdateTransactionRequest(description = "수정 시도")

            every { transactionRepository.findById(transactionId) } returns existingTransaction

            assertThatThrownBy {
                transactionService.updateTransaction(transactionId, userId, updateRequest)
            }
                .isInstanceOf(IllegalArgumentException::class.java)
                .hasMessageContaining("해당 거래 내역을 수정할 권한이 없습니다")

            verify(exactly = 1) { transactionRepository.findById(transactionId) }
            verify(exactly = 0) { transactionRepository.update(any(), any()) }
        }

        @Test
        @DisplayName("존재하지 않는 거래 수정 시 예외 발생")
        fun `updateTransaction - 존재하지 않는 거래`() {
            val updateRequest = UpdateTransactionRequest(description = "수정 시도")

            every { transactionRepository.findById(transactionId) } returns null

            assertThatThrownBy {
                transactionService.updateTransaction(transactionId, userId, updateRequest)
            }
                .isInstanceOf(TransactionNotFoundException::class.java)
                .hasMessageContaining("거래 내역을 찾을 수 없습니다")

            verify(exactly = 1) { transactionRepository.findById(transactionId) }
            verify(exactly = 0) { transactionRepository.update(any(), any()) }
        }

        @Test
        @DisplayName("변경 사항이 없으면 예외 발생")
        fun `updateTransaction - 변경 사항 없음 예외`() {
            val existingTransaction = createTestTransaction()
            val updateRequest = UpdateTransactionRequest()

            every { transactionRepository.findById(transactionId) } returns existingTransaction

            assertThatThrownBy {
                transactionService.updateTransaction(transactionId, userId, updateRequest)
            }
                .isInstanceOf(IllegalArgumentException::class.java)
                .hasMessageContaining("변경할 내용이 없습니다")
        }
    }

    @Nested
    @DisplayName("deleteTransaction 테스트")
    inner class DeleteTransactionTest {

        @Test
        @DisplayName("거래 내역 삭제 성공")
        fun `deleteTransaction - 성공`() {
            val transaction = createTestTransaction()

            every { transactionRepository.findById(transactionId) } returns transaction
            every { transactionRepository.deleteById(transactionId) } returns true

            transactionService.deleteTransaction(transactionId, userId)

            verify(exactly = 1) { transactionRepository.findById(transactionId) }
            verify(exactly = 1) { transactionRepository.deleteById(transactionId) }
        }

        @Test
        @DisplayName("다른 사용자의 거래 삭제 시 예외 발생")
        fun `deleteTransaction - 권한 없음 예외`() {
            val otherUserId = 999L
            val transaction = createTestTransaction().copy(userId = otherUserId)

            every { transactionRepository.findById(transactionId) } returns transaction

            assertThatThrownBy {
                transactionService.deleteTransaction(transactionId, userId)
            }
                .isInstanceOf(IllegalArgumentException::class.java)
                .hasMessageContaining("해당 거래 내역을 삭제할 권한이 없습니다")

            verify(exactly = 1) { transactionRepository.findById(transactionId) }
            verify(exactly = 0) { transactionRepository.deleteById(any()) }
        }

        @Test
        @DisplayName("존재하지 않는 거래 삭제 시 예외 발생")
        fun `deleteTransaction - 존재하지 않는 거래`() {
            every { transactionRepository.findById(transactionId) } returns null

            assertThatThrownBy {
                transactionService.deleteTransaction(transactionId, userId)
            }
                .isInstanceOf(TransactionNotFoundException::class.java)
                .hasMessageContaining("거래 내역을 찾을 수 없습니다")

            verify(exactly = 1) { transactionRepository.findById(transactionId) }
            verify(exactly = 0) { transactionRepository.deleteById(any()) }
        }
    }

    private fun createTestTransaction(
        id: Long = transactionId,
        description: String = "테스트 거래",
        type: TransactionType = TransactionType.EXPENSE,
        category: TransactionCategory = TransactionCategory.FOOD,
        amount: BigDecimal = BigDecimal("10000")
    ): Transaction {
        return Transaction(
            id = id,
            userId = userId,
            type = type,
            category = category,
            amount = amount,
            description = description,
            date = today,
            memo = "테스트 메모",
            createdAt = now,
            updatedAt = now
        )
    }
}