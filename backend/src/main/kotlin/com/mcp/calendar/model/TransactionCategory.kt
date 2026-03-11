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

        /* camelCase → enum 매핑 (프론트엔드에서 받는 값) */
        private val FRONTEND_MAP = mapOf(
            "sideIncome" to SIDE_INCOME,
            "sideincome" to SIDE_INCOME,
        )

        fun fromString(value: String?): TransactionCategory {
            if (value == null) return OTHER
            // 1) camelCase 매핑 먼저 시도
            FRONTEND_MAP[value]?.let { return it }
            // 2) enum name 매칭 (FOOD, TRANSPORT 등)
            return entries.find { it.name.equals(value, ignoreCase = true) } ?: OTHER
        }

        fun getByType(type: TransactionType): List<TransactionCategory> {
            return entries.filter { it.type == type }
        }
    }

    /* enum → 프론트엔드 camelCase 변환 */
    private val frontendName: String by lazy {
        name.lowercase().replace(Regex("_([a-z])")) { it.groupValues[1].uppercase() }
    }
    fun toFrontendString(): String = frontendName

    fun getTransactionType(): TransactionType = type
}