package com.mcp.calendar.controller

import com.mcp.calendar.dto.response.ApiResponse
import com.mcp.calendar.dto.response.WeatherForecastResponse
import com.mcp.calendar.dto.response.WeatherResponse
import com.mcp.calendar.service.WeatherService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/weather")
class WeatherController(
    private val weatherService: WeatherService
) {

    // GET /api/weather/current?city=Seoul
    @GetMapping("/current")
    fun getCurrentWeather(
        @RequestParam(required = false, defaultValue = "Seoul") city: String
    ): ResponseEntity<ApiResponse<WeatherResponse>> {
        val weather = weatherService.getCurrentWeather(city)
        return ResponseEntity.ok(ApiResponse.success(weather))
    }

    // GET /api/weather/forecast?city=Seoul&days=3
    @GetMapping("/forecast")
    fun getForecast(
        @RequestParam(required = false, defaultValue = "Seoul") city: String,
        @RequestParam(required = false, defaultValue = "3") days: Int
    ): ResponseEntity<ApiResponse<WeatherForecastResponse>> {
        val forecast = weatherService.getForecast(city, days)
        return ResponseEntity.ok(ApiResponse.success(forecast))
    }

    // GET /api/weather/recommendation?city=Seoul
    @GetMapping("/recommendation")
    fun getClothingRecommendation(
        @RequestParam(required = false, defaultValue = "Seoul") city: String
    ): ResponseEntity<ApiResponse<Map<String, String>>> {
        val recommendation = weatherService.getClothingRecommendation(city)
        return ResponseEntity.ok(ApiResponse.success(mapOf("recommendation" to recommendation)))
    }
}
