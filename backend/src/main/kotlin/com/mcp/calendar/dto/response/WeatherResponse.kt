package com.mcp.calendar.dto.response

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty

// ===== OpenWeatherMap Raw Response DTOs =====

@JsonIgnoreProperties(ignoreUnknown = true)
data class OpenWeatherMapResponse(
    val coord: Coord? = null,
    val weather: List<WeatherInfo> = emptyList(),
    val main: MainInfo? = null,
    val wind: WindInfo? = null,
    val name: String = "",
    val dt: Long = 0
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Coord(
    val lon: Double = 0.0,
    val lat: Double = 0.0
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class WeatherInfo(
    val id: Int = 0,
    val main: String = "",
    val description: String = "",
    val icon: String = ""
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class MainInfo(
    val temp: Double = 0.0,
    @JsonProperty("feels_like")
    val feelsLike: Double = 0.0,
    val humidity: Int = 0,
    val pressure: Int = 0,
    @JsonProperty("temp_min")
    val tempMin: Double = 0.0,
    @JsonProperty("temp_max")
    val tempMax: Double = 0.0
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class WindInfo(
    val speed: Double = 0.0
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class OpenWeatherMapForecastResponse(
    val list: List<ForecastItem> = emptyList(),
    val city: ForecastCity? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class ForecastItem(
    val dt: Long = 0,
    val main: MainInfo? = null,
    val weather: List<WeatherInfo> = emptyList(),
    val wind: WindInfo? = null,
    @JsonProperty("dt_txt")
    val dtTxt: String = ""
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class ForecastCity(
    val name: String = ""
)

// ===== Clean Response DTOs =====

data class WeatherResponse(
    val temp: Double,
    val feelsLike: Double,
    val condition: String,
    val conditionText: String,
    val humidity: Int,
    val windSpeed: Double,
    val recommendation: String,
    val city: String,
    val timestamp: String
)

data class WeatherForecastResponse(
    val city: String,
    val forecasts: List<DailyForecast>
)

data class DailyForecast(
    val date: String,
    val tempMin: Double,
    val tempMax: Double,
    val condition: String,
    val conditionText: String
)
