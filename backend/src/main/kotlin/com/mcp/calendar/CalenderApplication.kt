package com.mcp.calendar

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class CalendarApplication

fun main(args: Array<String>) {
    runApplication<CalendarApplication>(*args)
}