package com.mcp.calendar.model

enum class TransactionCategory(val type: TransactionType) {
    // 지출 카테고리
    FOOD(TransactionType.EXPENSE),
    TRANSPORT(TransactionType.EXPENSE),
    SHOPPING(TransactionType.EXPENSE),
    FIXED(TransactionType.EXPENSE),
    LEISURE(TransactionType.EXPENSE),
    OTHER(TransactionType.EXPENSE),

    // 수입 카테고리
    SALARY(TransactionType.INCOME),
    SIDE_INCOME(TransactionType.INCOME);

    companion object {

        fun fromString(value: String?): TransactionCategory {
            return value?.let {
                entries.find { category -> category.name.equals(it, ignoreCase = true) }
            } ?: OTHER
        }

        fun getByType(type: TransactionType): List<TransactionCategory> {
            return entries.filter { it.type == type }
        }
    }

    fun toFrontendString(): String = name.lowercase()

    fun getTransactionType(): TransactionType = type
}