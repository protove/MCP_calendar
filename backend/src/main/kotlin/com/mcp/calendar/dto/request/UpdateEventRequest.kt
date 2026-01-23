package com.mcp.calendar.dto.request

import com.fasterxml.jackson.annotation.JsonFormat
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

    val category: String? = null,

    val allDay: Boolean? = null
){
    fun validate(existingStartTime: LocalDateTime, existingEndTime: LocalDateTime) {
        val newStartTime = startTime ?: existingStartTime
        val newEndTime = endTime ?: existingEndTime

        require(newEndTime.isAfter(newStartTime) || newEndTime.isEqual(newStartTime)){
            "종료 시간은 시작 시간과 같거나 늦어야 합니다"
        }
    }

    fun hasChanges(): Boolean {
        return title != null || description != null || location != null || startTime != null || endTime != null || category != null || allDay != null
    }
}