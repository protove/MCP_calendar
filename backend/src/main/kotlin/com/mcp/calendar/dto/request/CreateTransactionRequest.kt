package com.mcp.calendar.dto.request

import com.fasterxml.jackson.annotation.JsonFormat
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size
import java.math.BigDecimal
import java.time.LocalDate

data class CreateTransactionRequest(
    @field:NotBlank(message = "거래 유형은 필수입니다")
    val type: String,

    @field:NotBlank(message = "카테고리는 필수입니다")
    val category: String,

    @field:NotNull(message = "금액은 필수입니다")
    @field:Positive(message = "금액은 0보다 커야합니다")
    val amount: BigDecimal,

    @field:NotBlank(message = "설명은 필수입니다")
    @field:Size(min = 1, max = 255, message = "설명은 1~255자여야 합니다")
    val description: String,

    @field:NotNull(message = "거래 날짜는 필수입니다")
    @field:JsonFormat(pattern = "yyyy-MM-dd")
    val date: LocalDate,

    @field:Size(max = 500, message = "메모는 500자 이내여야 합니다")
    val memo: String? = null
){
    fun validate() {
        require(amount > BigDecimal.ZERO){
            "금액은 0보다 커야 합니다"
        }
    }
}