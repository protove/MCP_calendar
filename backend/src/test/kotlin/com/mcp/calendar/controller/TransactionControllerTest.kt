package com.mcp.calendar.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.mcp.calendar.dto.request.CreateTransactionRequest
import com.mcp.calendar.dto.request.UpdateTransactionRequest
import com.mcp.calendar.dto.response.TransactionResponse
import com.mcp.calendar.dto.response.TransactionSummaryResponse
import com.mcp.calendar.exception.GlobalExceptionHandler
import com.mcp.calendar.exception.TransactionNotFoundException
import com.mcp.calendar.service.TransactionService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.*
import org.mockito.Mockito
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@DisplayName("TransactionController 단위 테스트")
class TransactionControllerTest {

    private lateinit var mockMvc: MockMvc
    private lateinit var objectMapper: ObjectMapper
    private lateinit var transactionService: TransactionService

    private val userId = 1L
    private val transactionId = 100L
    private val now = LocalDateTime.now()
    private val today = LocalDate.now()

    @BeforeEach
    fun setup() {
        transactionService = Mockito.mock(TransactionService::class.java)

        val transactionController = TransactionController(transactionService)

        mockMvc = MockMvcBuilders
            .standaloneSetup(transactionController)
            .setControllerAdvice(GlobalExceptionHandler())
            .build()

        objectMapper = ObjectMapper().apply {
            registerModule(JavaTimeModule())
        }
    }

    @Nested
    @DisplayName("POST /api/transactions - 거래 생성")
    inner class CreateTransactionTest {

        @Test
        @DisplayName("성공 - 201 Created")
        fun `거래 생성 성공`() {
            val request = CreateTransactionRequest(
                type = "expense",
                category = "food",
                amount = BigDecimal("15000"),
                description = "점심 식사",
                date = today,
                memo = "회사 근처 식당"
            )

            val expectedResponse = createTransactionResponse()

            given(transactionService.createTransaction(eq(userId), any()))
                .willReturn(expectedResponse)

            mockMvc.perform(
                post("/api/transactions")
                    .header("X-User-Id", userId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isCreated)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(transactionId))
                .andExpect(jsonPath("$.data.type").value("expense"))
                .andExpect(jsonPath("$.data.category").value("food"))

            verify(transactionService, times(1)).createTransaction(eq(userId), any())
        }

        @Test
        @DisplayName("실패 - 필수 필드 누락 시 400 Bad Request")
        fun `필수 필드 누락 시 400`() {
            val invalidRequest = mapOf(
                "type" to "expense",
                "category" to "food"
            )

            mockMvc.perform(
                post("/api/transactions")
                    .header("X-User-Id", userId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest))
            )
                .andExpect(status().isBadRequest)
        }
    }

    @Nested
    @DisplayName("GET /api/transactions/{id} - 거래 단건 조회")
    inner class GetTransactionTest {

        @Test
        @DisplayName("성공 - 200 OK")
        fun `거래 조회 성공`() {
            val expectedResponse = createTransactionResponse()

            given(transactionService.getTransaction(transactionId))
                .willReturn(expectedResponse)

            mockMvc.perform(
                get("/api/transactions/{id}", transactionId)
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(transactionId))
                .andExpect(jsonPath("$.data.description").value("테스트 거래"))

            verify(transactionService, times(1)).getTransaction(transactionId)
        }

        @Test
        @DisplayName("실패 - 존재하지 않는 거래 404 Not Found")
        fun `존재하지 않는 거래 404`() {
            given(transactionService.getTransaction(transactionId))
                .willThrow(TransactionNotFoundException("거래 내역을 찾을 수 없습니다. ID: $transactionId"))

            mockMvc.perform(
                get("/api/transactions/{id}", transactionId)
            )
                .andExpect(status().isNotFound)

            verify(transactionService, times(1)).getTransaction(transactionId)
        }
    }

    @Nested
    @DisplayName("GET /api/transactions - 전체 거래 조회")
    inner class GetAllTransactionsTest {

        @Test
        @DisplayName("성공 - 200 OK")
        fun `전체 거래 조회 성공`() {
            val transactions = listOf(
                createTransactionResponse(id = 1L, description = "거래 1"),
                createTransactionResponse(id = 2L, description = "거래 2")
            )

            given(transactionService.getAllTransactions(userId))
                .willReturn(transactions)

            mockMvc.perform(
                get("/api/transactions")
                    .header("X-User-Id", userId)
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].description").value("거래 1"))
                .andExpect(jsonPath("$.data[1].description").value("거래 2"))

            verify(transactionService, times(1)).getAllTransactions(userId)
        }
    }

    @Nested
    @DisplayName("GET /api/transactions/monthly - 월별 거래 조회")
    inner class GetMonthlyTransactionsTest {

        @Test
        @DisplayName("성공 - 200 OK")
        fun `월별 거래 조회 성공`() {
            val transactions = listOf(
                createTransactionResponse(id = 1L, description = "1월 거래")
            )

            given(transactionService.getMonthlyTransactions(userId, 2026, 1))
                .willReturn(transactions)

            mockMvc.perform(
                get("/api/transactions/monthly")
                    .header("X-User-Id", userId)
                    .param("year", "2026")
                    .param("month", "1")
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].description").value("1월 거래"))

            verify(transactionService, times(1)).getMonthlyTransactions(userId, 2026, 1)
        }
    }

    @Nested
    @DisplayName("GET /api/transactions/summary - 월별 요약 조회")
    inner class GetMonthlySummaryTest {

        @Test
        @DisplayName("성공 - 200 OK")
        fun `월별 요약 조회 성공`() {
            val summaryResponse = TransactionSummaryResponse(
                totalIncome = BigDecimal("1000000"),
                totalExpense = BigDecimal("500000"),
                balance = BigDecimal("500000"),
                transactionCount = 10
            )

            given(transactionService.getMonthlySummary(userId, 2026, 1))
                .willReturn(summaryResponse)

            mockMvc.perform(
                get("/api/transactions/summary")
                    .header("X-User-Id", userId)
                    .param("year", "2026")
                    .param("month", "1")
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalIncome").value(1000000))
                .andExpect(jsonPath("$.data.totalExpense").value(500000))
                .andExpect(jsonPath("$.data.balance").value(500000))
                .andExpect(jsonPath("$.data.transactionCount").value(10))

            verify(transactionService, times(1)).getMonthlySummary(userId, 2026, 1)
        }
    }

    @Nested
    @DisplayName("PUT /api/transactions/{id} - 거래 수정")
    inner class UpdateTransactionTest {

        @Test
        @DisplayName("성공 - 200 OK")
        fun `거래 수정 성공`() {
            val request = UpdateTransactionRequest(
                description = "수정된 거래 설명",
                amount = BigDecimal("20000")
            )

            val updatedResponse = createTransactionResponse(
                description = "수정된 거래 설명",
                amount = BigDecimal("20000")
            )

            given(transactionService.updateTransaction(eq(transactionId), eq(userId), any()))
                .willReturn(updatedResponse)

            mockMvc.perform(
                put("/api/transactions/{id}", transactionId)
                    .header("X-User-Id", userId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.description").value("수정된 거래 설명"))
                .andExpect(jsonPath("$.data.amount").value(20000))

            verify(transactionService, times(1)).updateTransaction(eq(transactionId), eq(userId), any())
        }

        @Test
        @DisplayName("실패 - 존재하지 않는 거래 404 Not Found")
        fun `존재하지 않는 거래 수정 404`() {
            val request = UpdateTransactionRequest(description = "수정 시도")

            given(transactionService.updateTransaction(eq(transactionId), eq(userId), any()))
                .willThrow(TransactionNotFoundException("거래 내역을 찾을 수 없습니다. ID: $transactionId"))

            mockMvc.perform(
                put("/api/transactions/{id}", transactionId)
                    .header("X-User-Id", userId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
                .andExpect(status().isNotFound)

            verify(transactionService, times(1)).updateTransaction(eq(transactionId), eq(userId), any())
        }
    }

    @Nested
    @DisplayName("DELETE /api/transactions/{id} - 거래 삭제")
    inner class DeleteTransactionTest {

        @Test
        @DisplayName("성공 - 200 OK")
        fun `거래 삭제 성공`() {
            doNothing().`when`(transactionService).deleteTransaction(transactionId, userId)

            mockMvc.perform(
                delete("/api/transactions/{id}", transactionId)
                    .header("X-User-Id", userId)
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.success").value(true))

            verify(transactionService, times(1)).deleteTransaction(transactionId, userId)
        }

        @Test
        @DisplayName("실패 - 존재하지 않는 거래 404 Not Found")
        fun `존재하지 않는 거래 삭제 404`() {
            doThrow(TransactionNotFoundException("거래 내역을 찾을 수 없습니다. ID: $transactionId"))
                .`when`(transactionService).deleteTransaction(transactionId, userId)

            mockMvc.perform(
                delete("/api/transactions/{id}", transactionId)
                    .header("X-User-Id", userId)
            )
                .andExpect(status().isNotFound)

            verify(transactionService, times(1)).deleteTransaction(transactionId, userId)
        }
    }

    private fun createTransactionResponse(
        id: Long = transactionId,
        type: String = "expense",
        category: String = "food",
        amount: BigDecimal = BigDecimal("15000"),
        description: String = "테스트 거래"
    ): TransactionResponse {
        return TransactionResponse(
            id = id,
            type = type,
            category = category,
            amount = amount,
            description = description,
            date = today.toString(),
            memo = "테스트 메모",
            createdAt = now.toString(),
            updatedAt = now.toString(),
            isIncome = type == "income"
        )
    }
}