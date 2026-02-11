package com.mcp.calendar.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "gemini.api")
data class GeminiProperties(

    val key: String = "",
    
    val model: String = "gemini-2.5-pro",
    
    val baseUrl: String = "https://generativelanguage.googleapis.com/v1beta"
) {
    
    fun isConfigured(): Boolean = key.isNotBlank()
    
    fun getGenerateContentUrl(): String = 
        "$baseUrl/models/$model:generateContent?key=$key"
    
    fun getStreamGenerateContentUrl(): String = 
        "$baseUrl/models/$model:streamGenerateContent?key=$key&alt=sse"
}
