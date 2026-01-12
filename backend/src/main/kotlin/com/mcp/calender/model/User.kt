package com.mcp.calaendar.model

import java.time.LocalDataTime

data class User(
    val id: Long = 0,
    val email: String,
    val password: String,
    val name: String,
    val createdAt: LocalDataTime = LocalDataTime.now()
)