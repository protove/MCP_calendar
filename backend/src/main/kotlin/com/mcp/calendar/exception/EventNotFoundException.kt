package com.mcp.calendar.exception

// 일정이 존재하지 않을 때 발생시키는 예외
class EventNotFoundException(message: String) : RuntimeException(message)