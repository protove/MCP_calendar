package com.mcp.calendar.dto.response

import com.fasterxml.jackson.annotation.JsonFormat
import com.mcp.calendar.model.Event
import java.time.LocalDateTime
import java.time.temporal.ChronoUnit

data class EventResponse(
    val id: Long,
    val title: String,
    val description: String?,
    val location: String?,

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val startTime: String,

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val endTime: String,

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val createAt: String,

    val durationMinutes: Long,
    val isMultiDay: Boolean,
    val isPast: Boolean
){
    companion object {
        fun from(event: Event): EventResponse {
            val now = LocalDateTime.now()

            return EventResponse(
                id = event.id,
                title = event.title,
                description = event.description,
                location = event.location,
                startTime = event.startTime.toString(),
                endTime = event.endTime.toString(),
                createAt = event.createAt.toString(),

                durationMinutes = ChronoUnit.MINUTES.between(event.startTime, event.endTime),
                isMultiDay = event.startTime.toLocalDate() != event.endTime.toLocalDate(),
                isPast = event.endTime.isBefore(now)
            )
        }
    }
}