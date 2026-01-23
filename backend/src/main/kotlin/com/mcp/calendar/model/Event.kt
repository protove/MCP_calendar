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
    val category: EventCategory = EventCategory.OTHER,
    val allDay: Boolean = false,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)