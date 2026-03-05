package com.mcp.calendar.config

import mu.KotlinLogging
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.reactive.function.client.WebClient

private val logger = KotlinLogging.logger {}

@Configuration
@EnableConfigurationProperties(WeatherProperties::class)
class WeatherConfig(
    private val weatherProperties: WeatherProperties
) {

    @Bean
    fun weatherWebClient(): WebClient {
        logger.info { "Initializing Weather WebClient..." }
        logger.info { "Weather API Base URL: ${weatherProperties.baseUrl}" }
        logger.info { "Weather API Configured: ${weatherProperties.isConfigured()}" }
        logger.info { "Weather Default City: ${weatherProperties.defaultCity}" }

        if (!weatherProperties.isConfigured()) {
            logger.warn { "Weather API Key is not configured! Set WEATHER_API_KEY environment variable." }
        }

        return WebClient.builder()
            .baseUrl(weatherProperties.baseUrl)
            .defaultHeader("Content-Type", "application/json")
            .codecs { configurer ->
                configurer.defaultCodecs().maxInMemorySize(4 * 1024 * 1024)
            }
            .build()
    }
}
