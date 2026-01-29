package com.mcp.calendar.dto.response

import java.math.BigDecimal

data class TransactionSummaryResponse(
    val totalIncome: BigDecimal,
    val totalExpense: BigDecimal,
    val balance: BigDecimal,
    val transactionCount: Int
){

    companion object {

        fun empty(): TransactionSummaryResponse {
            return TransactionSummaryResponse(
                totalIncome = BigDecimal.ZERO,
                totalExpense = BigDecimal.ZERO,
                balance = BigDecimal.ZERO,
                transactionCount = 0
            )
        }

        fun of(
            totalIncome: BigDecimal,
            totalExpense: BigDecimal,
            transactionCount: Int
        ): TransactionSummaryResponse {
            return TransactionSummaryResponse(
                totalIncome = totalIncome,
                totalExpense = totalExpense,
                balance = totalIncome.subtract(totalExpense),
                transactionCount = transactionCount
            )
        }
    }
}