package com.mcp.calendar.dto.request

import com.fasterxml.jackson.annotation.JsonFormat
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size
import java.math.BigDecimal
import java.time.LocalDate

data class UpdateTransactionRequest(

    val type: String? = null,

    val category: String? = null,

    @field:Positive(message = "금액은 0보다 커야합니다")
    val amount: BigDecimal? = null,

    @field:Size(min = 1, max = 255, message = "설명은 1~255자여야 합니다")
    val description: String? = null,

    @field:JsonFormat(pattern = "yyyy-MM-dd")
    val date: LocalDate? = null,

    @field:Size(max = 500, message = "메모는 500자 이내여야 합니다")
    val memo: String? = null
){
    fun validate() {
        amount?.let {
            require(it > BigDecimal.ZERO){
                "금액은 0보다 커야 합니다"
            }
        }
    }

    fun hasChanges(): Boolean {
        return type != null || category != null || amount != null || description != null || date != null || memo != null
    }
}