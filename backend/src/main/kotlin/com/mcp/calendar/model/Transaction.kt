package com.mcp.calendar.model

import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

data class Transaction(
    val id: Long = 0,
    val userId: Long,
    val type: TransactionType,
    val category: TransactionCategory,
    val amount: BigDecimal,
    val description: String?,
    val date: LocalDate,
    val memo: String? = null,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)