package com.mcp.calendar.mcp.tool

import com.mcp.calendar.dto.request.CreateTransactionRequest
import com.mcp.calendar.dto.request.UpdateTransactionRequest
import com.mcp.calendar.mcp.protocol.CallToolResult
import com.mcp.calendar.service.TransactionService
import mu.KotlinLogging
import org.springframework.stereotype.Component
import java.math.BigDecimal
import java.math.RoundingMode

private val logger = KotlinLogging.logger {}

@Component
class LedgerTools(private val transactionService: TransactionService) {

    private val defaultUserId = 1L

    private fun BigDecimal.formatKrw(): String = "%,.0f원".format(this)

    fun getTools(): List<McpTool> = listOf(
        CreateTransactionTool(), GetTransactionTool(), ListTransactionsTool(),
        GetMonthlyTransactionsTool(), GetTransactionsByDateRangeTool(),
        GetMonthlySummaryTool(), GetCategoryExpenseStatsTool(),
        UpdateTransactionTool(), DeleteTransactionTool()
    )

    // --- 1. 거래 생성 ---
    private inner class CreateTransactionTool : McpTool {
        override val name = "create_transaction"
        override val description = "새로운 수입 또는 지출 거래 내역을 등록합니다."
        override val inputSchema = objectSchema(
            properties = mapOf(
                "type" to stringProperty("거래 유형 (필수)", enum = listOf("income","expense")),
                "category" to stringProperty("카테고리 (필수)", enum = listOf("food","transport","shopping","fixed","leisure","other","salary","side_income")),
                "amount" to numberProperty("금액 (필수, 0보다 큰 숫자)"),
                "description" to stringProperty("설명 (필수)"),
                "date" to stringProperty("거래 날짜 (필수, 예: 2025-02-15)", format = "date"),
                "memo" to stringProperty("메모 (선택)")
            ),
            required = listOf("type", "category", "amount", "description", "date")
        )
        override fun execute(arguments: Map<String, Any?>): CallToolResult {
            logger.info { "MCP create_transaction: ${arguments["description"]}" }
            val request = CreateTransactionRequest(
                type = arguments.requireString("type"),
                category = arguments.requireString("category"),
                amount = arguments.requireBigDecimal("amount"),
                description = arguments.requireString("description"),
                date = arguments.requireLocalDate("date"),
                memo = arguments.getString("memo")
            )
            val result = transactionService.createTransaction(defaultUserId, request)
            val emoji = if (result.isIncome) "💰" else "💸"
            return CallToolResult.text(buildString {
                appendLine("$emoji 거래가 등록되었습니다.")
                appendLine("• ID: ${result.id}")
                appendLine("• 유형: ${if (result.isIncome) "수입" else "지출"} | 카테고리: ${result.category}")
                appendLine("• 금액: ${result.amount.formatKrw()}")
                appendLine("• 설명: ${result.description} | 날짜: ${result.date}")
                result.memo?.let { appendLine("• 메모: $it") }
            })
        }
    }

    // --- 2. 거래 단건 조회 ---
    private inner class GetTransactionTool : McpTool {
        override val name = "get_transaction"
        override val description = "ID로 특정 거래 상세 정보를 조회합니다."
        override val inputSchema = objectSchema(
            properties = mapOf("transactionId" to numberProperty("거래 ID (필수)", "integer")),
            required = listOf("transactionId")
        )
        override fun execute(arguments: Map<String, Any?>): CallToolResult {
            val txId = arguments.requireLong("transactionId")
            logger.info { "MCP get_transaction: $txId" }
            val tx = transactionService.getTransaction(txId)
            val emoji = if (tx.isIncome) "💰" else "💸"
            return CallToolResult.text(buildString {
                appendLine("$emoji 거래 상세")
                appendLine("• ID: ${tx.id} | ${if (tx.isIncome) "수입" else "지출"}")
                appendLine("• 카테고리: ${tx.category} | 금액: ${tx.amount.formatKrw()}")
                appendLine("• 설명: ${tx.description} | 날짜: ${tx.date}")
                tx.memo?.let { appendLine("• 메모: $it") }
            })
        }
    }

    // --- 3. 전체 거래 조회 ---
    private inner class ListTransactionsTool : McpTool {
        override val name = "list_transactions"
        override val description = "사용자의 전체 거래 내역을 조회합니다."
        override val inputSchema = objectSchema(properties = emptyMap())
        override fun execute(arguments: Map<String, Any?>): CallToolResult {
            logger.info { "MCP list_transactions" }
            val txs = transactionService.getAllTransactions(defaultUserId)
            if (txs.isEmpty()) return CallToolResult.text("💳 거래 내역이 없습니다.")
            return CallToolResult.text(buildString {
                appendLine("💳 전체 거래 (${txs.size}건)")
                txs.forEach { tx ->
                    val emoji = if (tx.isIncome) "💰" else "💸"
                    appendLine("$emoji [${tx.id}] ${tx.description} — ${tx.amount.formatKrw()} (${tx.date})")
                }
            })
        }
    }

    // --- 4. 월별 거래 조회 ---
    private inner class GetMonthlyTransactionsTool : McpTool {
        override val name = "get_monthly_transactions"
        override val description = "특정 연/월의 거래 내역을 조회합니다."
        override val inputSchema = objectSchema(
            properties = mapOf(
                "year" to numberProperty("연도 (필수)", "integer"),
                "month" to numberProperty("월 (필수, 1~12)", "integer")
            ),
            required = listOf("year", "month")
        )
        override fun execute(arguments: Map<String, Any?>): CallToolResult {
            val year = arguments.requireInt("year")
            val month = arguments.requireInt("month")
            require(month in 1..12) { "월은 1~12 사이여야 합니다." }
            logger.info { "MCP get_monthly_transactions: $year-$month" }
            val txs = transactionService.getMonthlyTransactions(defaultUserId, year, month)
            if (txs.isEmpty()) return CallToolResult.text("💳 ${year}년 ${month}월 거래가 없습니다.")
            return CallToolResult.text(buildString {
                appendLine("💳 ${year}년 ${month}월 거래 (${txs.size}건)")
                txs.forEach { tx ->
                    val emoji = if (tx.isIncome) "💰" else "💸"
                    appendLine("$emoji [${tx.id}] ${tx.description} — ${tx.amount.formatKrw()} (${tx.date})")
                }
            })
        }
    }

    // --- 5. 기간별 거래 조회 ---
    private inner class GetTransactionsByDateRangeTool : McpTool {
        override val name = "get_transactions_by_date_range"
        override val description = "시작일~종료일 사이의 거래 내역을 조회합니다."
        override val inputSchema = objectSchema(
            properties = mapOf(
                "startDate" to stringProperty("시작일 (필수, 예: 2025-01-01)", format = "date"),
                "endDate" to stringProperty("종료일 (필수, 예: 2025-01-31)", format = "date")
            ),
            required = listOf("startDate", "endDate")
        )
        override fun execute(arguments: Map<String, Any?>): CallToolResult {
            val startDate = arguments.requireLocalDate("startDate")
            val endDate = arguments.requireLocalDate("endDate")
            logger.info { "MCP get_transactions_by_date_range: $startDate ~ $endDate" }
            val txs = transactionService.getTransactionsByDateRange(defaultUserId, startDate, endDate)
            if (txs.isEmpty()) return CallToolResult.text("💳 $startDate ~ $endDate 거래가 없습니다.")
            return CallToolResult.text(buildString {
                appendLine("💳 $startDate ~ $endDate 거래 (${txs.size}건)")
                txs.forEach { tx ->
                    val emoji = if (tx.isIncome) "💰" else "💸"
                    appendLine("$emoji [${tx.id}] ${tx.description} — ${tx.amount.formatKrw()} (${tx.date})")
                }
            })
        }
    }

    // --- 6. 월별 요약 ---
    private inner class GetMonthlySummaryTool : McpTool {
        override val name = "get_monthly_summary"
        override val description = "특정 연/월의 수입/지출 요약을 조회합니다."
        override val inputSchema = objectSchema(
            properties = mapOf(
                "year" to numberProperty("연도 (필수)", "integer"),
                "month" to numberProperty("월 (필수, 1~12)", "integer")
            ),
            required = listOf("year", "month")
        )
        override fun execute(arguments: Map<String, Any?>): CallToolResult {
            val year = arguments.requireInt("year")
            val month = arguments.requireInt("month")
            require(month in 1..12) { "월은 1~12 사이여야 합니다." }
            logger.info { "MCP get_monthly_summary: $year-$month" }
            val s = transactionService.getMonthlySummary(defaultUserId, year, month)
            return CallToolResult.text(buildString {
                appendLine("📊 ${year}년 ${month}월 거래 요약")
                appendLine("💰 수입: ${s.totalIncome.formatKrw()}")
                appendLine("💸 지출: ${s.totalExpense.formatKrw()}")
                appendLine("💵 잔액: ${s.balance.formatKrw()}")
                appendLine("📝 거래: ${s.transactionCount}건")
            })
        }
    }

    // --- 7. 카테고리별 지출 통계 ---
    private inner class GetCategoryExpenseStatsTool : McpTool {
        override val name = "get_category_expense_stats"
        override val description = "특정 연/월의 카테고리별 지출 통계를 조회합니다."
        override val inputSchema = objectSchema(
            properties = mapOf(
                "year" to numberProperty("연도 (필수)", "integer"),
                "month" to numberProperty("월 (필수, 1~12)", "integer")
            ),
            required = listOf("year", "month")
        )
        override fun execute(arguments: Map<String, Any?>): CallToolResult {
            val year = arguments.requireInt("year")
            val month = arguments.requireInt("month")
            require(month in 1..12) { "월은 1~12 사이여야 합니다." }
            logger.info { "MCP get_category_expense_stats: $year-$month" }
            val stats = transactionService.getCategoryExpenseStats(defaultUserId, year, month)
            if (stats.isEmpty()) return CallToolResult.text("📊 ${year}년 ${month}월 지출이 없습니다.")
            val total = stats.values.fold(BigDecimal.ZERO) { acc, v -> acc.add(v) }
            return CallToolResult.text(buildString {
                appendLine("📊 ${year}년 ${month}월 카테고리별 지출")
                stats.entries.sortedByDescending { it.value }.forEach { (cat, amt) ->
                    val pct = if (total > BigDecimal.ZERO)
                        amt.multiply(BigDecimal(100)).divide(total, 1, RoundingMode.HALF_UP)
                    else BigDecimal.ZERO
                    appendLine("• ${cat.toFrontendString()}: ${amt.formatKrw()} ($pct%)")
                }
                appendLine("합계: ${total.formatKrw()}")
            })
        }
    }

    // --- 8. 거래 수정 ---
    private inner class UpdateTransactionTool : McpTool {
        override val name = "update_transaction"
        override val description = "기존 거래를 수정합니다. transactionId 필수, 수정할 필드만 전달."
        override val inputSchema = objectSchema(
            properties = mapOf(
                "transactionId" to numberProperty("거래 ID (필수)", "integer"),
                "type" to stringProperty("새 유형", enum = listOf("income","expense")),
                "category" to stringProperty("새 카테고리", enum = listOf("food","transport","shopping","fixed","leisure","other","salary","side_income")),
                "amount" to numberProperty("새 금액"),
                "description" to stringProperty("새 설명"),
                "date" to stringProperty("새 날짜", format = "date"),
                "memo" to stringProperty("새 메모")
            ),
            required = listOf("transactionId")
        )
        override fun execute(arguments: Map<String, Any?>): CallToolResult {
            val txId = arguments.requireLong("transactionId")
            logger.info { "MCP update_transaction: $txId" }
            val request = UpdateTransactionRequest(
                type = arguments.getString("type"),
                category = arguments.getString("category"),
                amount = arguments.getBigDecimal("amount"),
                description = arguments.getString("description"),
                date = arguments.getLocalDate("date"),
                memo = arguments.getString("memo")
            )
            val result = transactionService.updateTransaction(txId, defaultUserId, request)
            return CallToolResult.text(buildString {
                appendLine("✏️ 거래가 수정되었습니다.")
                appendLine("• ID: ${result.id} | ${result.category} | ${result.amount.formatKrw()}")
                appendLine("• 설명: ${result.description} | 날짜: ${result.date}")
            })
        }
    }

    // --- 9. 거래 삭제 ---
    private inner class DeleteTransactionTool : McpTool {
        override val name = "delete_transaction"
        override val description = "ID로 특정 거래를 삭제합니다."
        override val inputSchema = objectSchema(
            properties = mapOf("transactionId" to numberProperty("거래 ID (필수)", "integer")),
            required = listOf("transactionId")
        )
        override fun execute(arguments: Map<String, Any?>): CallToolResult {
            val txId = arguments.requireLong("transactionId")
            logger.info { "MCP delete_transaction: $txId" }
            transactionService.deleteTransaction(txId, defaultUserId)
            return CallToolResult.text("🗑️ 거래(ID: $txId)가 삭제되었습니다.")
        }
    }
}