package com.mcp.calendar.dto.request

import com.fasterxml.jackson.annotation.JsonFormat
import jakarta.validation.constraints.NotBlank
import java.time.LocalDateTime

data class UpdateEventRequest(
    
    @field:Size(min = 1, max = 255, message = "제목은 1~255자여야 합니다")
    val title: String? = null,

    @field:Size(max = 2000, message = "설명은 2000자 이하여야 합니다")
    val description: String? = null,

    @field:Size(max = 255, message = "장소는 255자 이하여야 합니다")
    val location: String? = null,

    @field:JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val startTime: LocalDateTime? = null,

    @field:JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val endTime: LocalDateTime? = null
){
    fun validate() {
        if(startTime != null && endTime != null) {
            require(endTime.isAfter(startTime)){
                "종료 시간은 시작 시간보다 늦어야 합니다"
            }
        }
    }

    fun hasChanges(): Boolean {
        return title != null || description != null || location != null || startTime != null || endTime != null
    }
}