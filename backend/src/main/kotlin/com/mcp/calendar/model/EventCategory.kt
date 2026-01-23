package com.mcp.calendar.model

enum class EventCategory {
    WORK,
    PERSONAL,
    MEETING,
    IMPORTANT,
    OTHER;

    companion object {

        fun fromString(value: String?): EventCategory {
            return value?.let {
                entries.find { category -> category.name.equals(it, ignoreCase = true) }
            } ?: OTHER
        }
    }

    fun toFrontendString(): String = name.lowercase()
}