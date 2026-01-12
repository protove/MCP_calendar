package com.mcp.calendar.model

import java.time.LocalDateTime

data class Event(
    val id: Long = 0,
    val userId: Long,
    val title: String,
    val description: String? = null,
    val location: String? = null,
    val startTime: LocalDateTime,
    val endTime: LocalDateTime,
    val createdAt: LocalDateTime = LocalDateTime.now()
    val updatedAt: LocalDateTime = LocalDateTime.now()
){
    init{
        require(endTime.isAfter(startTime)) {
            "종료 시간은 시작 시간보다 늦어야 합니다."
        }
    }
}