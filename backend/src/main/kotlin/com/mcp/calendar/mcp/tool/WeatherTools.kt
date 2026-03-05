package com.mcp.calendar.mcp.tool

import com.mcp.calendar.mcp.protocol.CallToolResult
import com.mcp.calendar.service.WeatherService
import mu.KotlinLogging
import org.springframework.stereotype.Component

private val logger = KotlinLogging.logger {}

@Component
class WeatherTools(private val weatherService: WeatherService) {

    fun getTools(): List<McpTool> = listOf(
        GetCurrentWeatherTool(), GetWeatherForecastTool(), GetClothingRecommendationTool()
    )

    // --- 1. 현재 날씨 조회 ---
    private inner class GetCurrentWeatherTool : McpTool {
        override val name = "get_current_weather"
        override val description = "현재 날씨 정보를 조회합니다. 기온, 체감온도, 습도, 바람, 날씨 상태 및 옷차림 추천을 제공합니다."
        override val inputSchema = objectSchema(
            properties = mapOf(
                "city" to stringProperty("도시 이름 (기본값: Seoul)")
            )
        )

        override fun execute(arguments: Map<String, Any?>, userId: Long): CallToolResult {
            return try {
                val city = arguments.getString("city")
                logger.info { "MCP get_current_weather: ${city ?: "Seoul"}" }
                val weather = weatherService.getCurrentWeather(city)
                CallToolResult.text(buildString {
                    appendLine("🌤️ ${weather.city} 현재 날씨")
                    appendLine("━━━━━━━━━━━━━━━━━━━━")
                    appendLine("🌡️ 기온: ${weather.temp}°C (체감 ${weather.feelsLike}°C)")
                    appendLine("☁️ 날씨: ${weather.conditionText}")
                    appendLine("💧 습도: ${weather.humidity}%")
                    appendLine("💨 바람: ${weather.windSpeed}m/s")
                    appendLine("━━━━━━━━━━━━━━━━━━━━")
                    appendLine("👔 옷차림 추천: ${weather.recommendation}")
                })
            } catch (e: Exception) {
                logger.error(e) { "MCP get_current_weather failed" }
                CallToolResult.error("❌ 날씨 정보를 가져오는데 실패했습니다: ${e.message}")
            }
        }
    }

    // --- 2. 날씨 예보 조회 ---
    private inner class GetWeatherForecastTool : McpTool {
        override val name = "get_weather_forecast"
        override val description = "날씨 예보를 조회합니다. 최대 5일간의 일별 최저/최고 기온과 날씨 상태를 제공합니다."
        override val inputSchema = objectSchema(
            properties = mapOf(
                "city" to stringProperty("도시 이름 (기본값: Seoul)"),
                "days" to numberProperty("예보 일수 (기본값: 3, 최대: 5)", "integer")
            )
        )

        override fun execute(arguments: Map<String, Any?>, userId: Long): CallToolResult {
            return try {
                val city = arguments.getString("city")
                val days = arguments.getInt("days") ?: 3
                logger.info { "MCP get_weather_forecast: ${city ?: "Seoul"}, days=$days" }
                val forecast = weatherService.getForecast(city, days)
                CallToolResult.text(buildString {
                    appendLine("📅 ${forecast.city} ${forecast.forecasts.size}일간 날씨 예보")
                    appendLine("━━━━━━━━━━━━━━━━━━━━")
                    forecast.forecasts.forEach { daily ->
                        appendLine("📌 ${daily.date}")
                        appendLine("   🌡️ ${daily.tempMin}°C ~ ${daily.tempMax}°C | ${daily.conditionText}")
                    }
                })
            } catch (e: Exception) {
                logger.error(e) { "MCP get_weather_forecast failed" }
                CallToolResult.error("❌ 날씨 예보를 가져오는데 실패했습니다: ${e.message}")
            }
        }
    }

    // --- 3. 옷차림 추천 ---
    private inner class GetClothingRecommendationTool : McpTool {
        override val name = "get_clothing_recommendation"
        override val description = "현재 날씨를 기반으로 옷차림을 추천합니다. 기온, 날씨 상태, 바람 세기를 고려한 상세한 추천을 제공합니다."
        override val inputSchema = objectSchema(
            properties = mapOf(
                "city" to stringProperty("도시 이름 (기본값: Seoul)")
            )
        )

        override fun execute(arguments: Map<String, Any?>, userId: Long): CallToolResult {
            return try {
                val city = arguments.getString("city")
                logger.info { "MCP get_clothing_recommendation: ${city ?: "Seoul"}" }
                val recommendation = weatherService.getClothingRecommendation(city)
                CallToolResult.text(buildString {
                    appendLine("👔 오늘의 옷차림 추천")
                    appendLine("━━━━━━━━━━━━━━━━━━━━")
                    appendLine(recommendation)
                })
            } catch (e: Exception) {
                logger.error(e) { "MCP get_clothing_recommendation failed" }
                CallToolResult.error("❌ 옷차림 추천을 가져오는데 실패했습니다: ${e.message}")
            }
        }
    }
}
