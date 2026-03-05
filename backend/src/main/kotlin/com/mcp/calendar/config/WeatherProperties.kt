package com.mcp.calendar.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "weather.api")
data class WeatherProperties(

    val key: String = "",

    val baseUrl: String = "https://api.openweathermap.org/data/2.5",

    val defaultCity: String = "Seoul",

    val cacheTtlMinutes: Long = 30
) {

    fun isConfigured(): Boolean = key.isNotBlank()
}
