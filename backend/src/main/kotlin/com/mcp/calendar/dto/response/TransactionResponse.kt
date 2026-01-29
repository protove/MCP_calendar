package com.mcp.calendar.dto.response

import com.fasterxml.jackson.annotation.JsonFormat
import com.mcp.calendar.model.Transaction
import com.mcp.calendar.model.TransactionType
import java.math.BigDecimal

data class TransactionResponse(
    val id: Long,
    val type: String,
    val category: String,
    val amount: BigDecimal,
    val description: String?,
    val date: String,
    val memo: String?,

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val createdAt: String,

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val updatedAt: String,

    val isIncome: Boolean
) {
    
    companion object {
        fun from(transaction: Transaction): TransactionResponse {
            return TransactionResponse(
                id = transaction.id,
                type = transaction.type.toFrontendString(),
                category = transaction.category.toFrontendString(),
                amount = transaction.amount,
                description = transaction.description,
                date = transaction.date.toString(),
                memo = transaction.memo,
                createdAt = transaction.createdAt.toString(),
                updatedAt = transaction.updatedAt.toString(),
                isIncome = transaction.type == TransactionType.INCOME
            )
        }
    }
}