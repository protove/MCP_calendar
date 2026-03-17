package com.mcp.calendar.dto.request

import com.fasterxml.jackson.annotation.JsonFormat
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

data class CreateEventRequest(

    @field:NotBlank(message = "제목은 필수입니다")
    @field:Size(min = 1, max = 255, message = "제목은 1~255자여야 합니다")
    val title: String,

    @field:Size(max = 2000, message = "설명은 2000자 이내여야 합니다")
    val description: String? = null,

    @field:Size(max = 255, message = "장소는 255자 이내여야 합니다")
    val location: String? = null,

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm[:ss]")
    val startTime: LocalDateTime,

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm[:ss]")
    val endTime: LocalDateTime,

    val category: String? = "other",

    val allDay: Boolean? = false
){
    fun validate() {
        require(endTime.isAfter(startTime) || endTime.isEqual(startTime)){
            "종료 시간은 시작 시간과 같거나 늦어야 합니다"
        }
    }
}