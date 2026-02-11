package com.mcp.calendar.config

import mu.KotlinLogging
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.reactive.function.client.WebClient

private val logger = KotlinLogging.logger {}

//Gemini API 설정
@Configuration
@EnableConfigurationProperties(GeminiProperties::class)
class GeminiConfig(
    private val geminiProperties: GeminiProperties
) {
    
    //Gemini API 호출용 WebClient Bean
    @Bean
    fun geminiWebClient(): WebClient {
        logger.info { "Initializing Gemini WebClient..." }
        logger.info { "Gemini Model: ${geminiProperties.model}" }
        logger.info { "Gemini API Configured: ${geminiProperties.isConfigured()}" }
        
        if (!geminiProperties.isConfigured()) {
            logger.warn { "Gemini API Key is not configured! Set GEMINI_API_KEY environment variable." }
        }
        
        return WebClient.builder()
            .baseUrl(geminiProperties.baseUrl)
            .defaultHeader("Content-Type", "application/json")
            .codecs { configurer ->
                configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024)
            }
            .build()
    }
}
