package com.mcp.calendar.model

enum class TransactionType {
    INCOME,
    EXPENSE;

    companion object {

        fun fromString(value: String?): TransactionType {
            return value?.let {
                entries.find { type -> type.name.equals(it, ignoreCase = true) }
            } ?: EXPENSE
        }
    }

    fun toFrontendString(): String = name.lowercase()
}