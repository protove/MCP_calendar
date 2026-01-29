package com.mcp.calendar.repository

import com.mcp.calendar.model.Transaction
import com.mcp.calendar.model.TransactionCategory
import com.mcp.calendar.model.TransactionType
import com.mcp.calendar.model.table.TransactionTable
import com.mcp.calendar.model.table.UserTable
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.deleteAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("TransactionRepository 단위 테스트")
class TransactionRepositoryTest {

    private lateinit var repository: TransactionRepository
    private var testUserId: Long = 0

    @BeforeAll
    fun setup() {
        Database.connect(
            url = "jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
            driver = "org.h2.Driver"
        )

        transaction {
            SchemaUtils.create(UserTable, TransactionTable)

            testUserId = UserTable.insertAndGetId {
                it[email] = "test@example.com"
                it[password] = "password123"
                it[name] = "테스트유저"
                it[createdAt] = LocalDateTime.now()
            }.value
        }

        repository = TransactionRepository()
    }

    @BeforeEach
    fun cleanUp() {
        transaction {
            TransactionTable.deleteAll()
        }
    }

    @AfterAll
    fun teardown() {
        transaction {
            SchemaUtils.drop(TransactionTable, UserTable)
        }
    }

    @Test
    @DisplayName("save - 거래 내역 저장 성공")
    fun `save - 거래 내역 저장 성공`() {
        val txn = createTestTransaction()

        val saved = transaction { repository.save(txn) }

        assertNotNull(saved.id)
        assertTrue(saved.id > 0)
        assertEquals(txn.amount, saved.amount)
        assertEquals(txn.type, saved.type)
        assertEquals(txn.category, saved.category)
        assertEquals(txn.description, saved.description)
    }

    @Test
    @DisplayName("findById - 존재하는 ID 조회 성공")
    fun `findById - 존재하는 ID 조회 성공`() {
        val txn = createTestTransaction()
        val saved = transaction { repository.save(txn) }

        val found = transaction { repository.findById(saved.id) }

        assertNotNull(found)
        assertEquals(saved.id, found!!.id)
        assertEquals(saved.amount, found.amount)
        assertEquals(saved.type, found.type)
        assertEquals(saved.category, found.category)
    }

    @Test
    @DisplayName("findById - 존재하지 않는 ID 조회")
    fun `findById - 존재하지 않는 ID 조회`() {
        val found = transaction { repository.findById(999999L) }
        assertNull(found)
    }

    @Test
    @DisplayName("findAllByUserId - 특정 사용자 모든 거래 조회")
    fun `findAllByUserId - 특정 사용자 모든 거래 조회`() {
        transaction {
            repository.save(createTestTransaction(description = "거래 1"))
            repository.save(createTestTransaction(description = "거래 2"))
            repository.save(createTestTransaction(description = "거래 3"))
        }

        val transactions = transaction { repository.findAllByUserId(testUserId) }

        assertEquals(3, transactions.size)
    }

    @Test
    @DisplayName("findByUserIdAndMonth - 월별 거래 조회")
    fun `findByUserIdAndMonth - 월별 거래 조회`() {
        val now = LocalDate.now()
        val currentYear = now.year
        val currentMonth = now.monthValue

        transaction {
            repository.save(createTestTransaction(description = "이번달 거래 1", date = now.plusDays(1)))
            repository.save(createTestTransaction(description = "이번달 거래 2", date = now.plusDays(2)))
            repository.save(createTestTransaction(description = "다음달 거래", date = now.plusMonths(1)))
        }

        val transactions = transaction {
            repository.findByUserIdAndMonth(testUserId, currentYear, currentMonth)
        }

        assertEquals(2, transactions.size)
        assertTrue(transactions.all { it.description.contains("이번달") })
    }

    @Test
    @DisplayName("findByUserIdAndDateRange - 기간별 거래 조회")
    fun `findByUserIdAndDateRange - 기간별 거래 조회`() {
        val today = LocalDate.now()
        val startDate = today.minusDays(7)
        val endDate = today.plusDays(7)

        transaction {
            repository.save(createTestTransaction(description = "범위 내 거래 1", date = today))
            repository.save(createTestTransaction(description = "범위 내 거래 2", date = today.plusDays(3)))
            repository.save(createTestTransaction(description = "범위 외 거래", date = today.plusMonths(1)))
        }

        val transactions = transaction {
            repository.findByUserIdAndDateRange(testUserId, startDate, endDate)
        }

        assertEquals(2, transactions.size)
        assertTrue(transactions.all { it.description.contains("범위 내") })
    }

    @Test
    @DisplayName("findByUserIdAndType - 거래 유형별 조회")
    fun `findByUserIdAndType - 거래 유형별 조회`() {
        transaction {
            repository.save(createTestTransaction(type = TransactionType.EXPENSE, category = TransactionCategory.FOOD))
            repository.save(createTestTransaction(type = TransactionType.EXPENSE, category = TransactionCategory.TRANSPORT))
            repository.save(createTestTransaction(type = TransactionType.INCOME, category = TransactionCategory.SALARY))
        }

        val expenseTransactions = transaction {
            repository.findByUserIdAndType(testUserId, TransactionType.EXPENSE)
        }

        val incomeTransactions = transaction {
            repository.findByUserIdAndType(testUserId, TransactionType.INCOME)
        }

        assertEquals(2, expenseTransactions.size)
        assertTrue(expenseTransactions.all { it.type == TransactionType.EXPENSE })

        assertEquals(1, incomeTransactions.size)
        assertTrue(incomeTransactions.all { it.type == TransactionType.INCOME })
    }

    @Test
    @DisplayName("findByUserIdAndCategory - 카테고리별 조회")
    fun `findByUserIdAndCategory - 카테고리별 조회`() {
        transaction {
            repository.save(createTestTransaction(category = TransactionCategory.FOOD))
            repository.save(createTestTransaction(category = TransactionCategory.FOOD))
            repository.save(createTestTransaction(category = TransactionCategory.TRANSPORT))
        }

        val foodTransactions = transaction {
            repository.findByUserIdAndCategory(testUserId, TransactionCategory.FOOD)
        }

        val transportTransactions = transaction {
            repository.findByUserIdAndCategory(testUserId, TransactionCategory.TRANSPORT)
        }

        assertEquals(2, foodTransactions.size)
        assertTrue(foodTransactions.all { it.category == TransactionCategory.FOOD })

        assertEquals(1, transportTransactions.size)
        assertTrue(transportTransactions.all { it.category == TransactionCategory.TRANSPORT })
    }

    @Test
    @DisplayName("update - 거래 수정 성공")
    fun `update - 거래 수정 성공`() {
        val txn = createTestTransaction(description = "원본 설명")
        val saved = transaction { repository.save(txn) }

        val updated = saved.copy(
            description = "수정된 설명",
            amount = BigDecimal("50000.00"),
            category = TransactionCategory.SHOPPING
        )

        val result = transaction { repository.update(saved.id, updated) }

        assertNotNull(result)
        val found = transaction { repository.findById(saved.id) }
        assertNotNull(found)
        assertEquals("수정된 설명", found!!.description)
        assertEquals(BigDecimal("50000.00"), found.amount)
        assertEquals(TransactionCategory.SHOPPING, found.category)
    }

    @Test
    @DisplayName("update - 존재하지 않는 ID 수정 시도")
    fun `update - 존재하지 않는 ID 수정 시도`() {
        val txn = createTestTransaction()

        val result = transaction { repository.update(999999L, txn) }

        assertNull(result)
    }

    @Test
    @DisplayName("deleteById - 거래 삭제 성공")
    fun `deleteById - 거래 삭제 성공`() {
        val txn = createTestTransaction()
        val saved = transaction { repository.save(txn) }

        val deleted = transaction { repository.deleteById(saved.id) }

        assertTrue(deleted)
        assertNull(transaction { repository.findById(saved.id) })
    }

    @Test
    @DisplayName("deleteById - 존재하지 않는 ID 삭제 시도")
    fun `deleteById - 존재하지 않는 ID 삭제 시도`() {
        val deleted = transaction { repository.deleteById(999999L) }
        assertFalse(deleted)
    }

    private fun createTestTransaction(
        description: String = "테스트 거래",
        amount: BigDecimal = BigDecimal("10000.00"),
        type: TransactionType = TransactionType.EXPENSE,
        category: TransactionCategory = TransactionCategory.FOOD,
        date: LocalDate = LocalDate.now()
    ): Transaction {
        return Transaction(
            userId = testUserId,
            type = type,
            category = category,
            amount = amount,
            description = description,
            date = date,
            memo = "테스트 메모",
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
    }
}