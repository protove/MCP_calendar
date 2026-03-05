package com.mcp.calendar.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.mcp.calendar.config.WeatherProperties
import com.mcp.calendar.dto.response.*
import mu.KotlinLogging
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.concurrent.TimeUnit

private val logger = KotlinLogging.logger {}

@Service
class WeatherService(
    private val weatherWebClient: WebClient,
    private val weatherProperties: WeatherProperties,
    private val redisTemplate: StringRedisTemplate,
    private val objectMapper: ObjectMapper
) {

    fun getCurrentWeather(city: String?): WeatherResponse {
        val targetCity = city?.takeIf { it.isNotBlank() } ?: weatherProperties.defaultCity
        val cacheKey = "weather:current:$targetCity"

        // Redis 캐시 확인
        try {
            redisTemplate.opsForValue().get(cacheKey)?.let { cached ->
                logger.debug { "Weather cache hit: $cacheKey" }
                return objectMapper.readValue(cached, WeatherResponse::class.java)
            }
        } catch (e: Exception) {
            logger.warn { "Redis cache read failed: ${e.message}" }
        }

        logger.info { "Fetching current weather for city: $targetCity" }

        val response = weatherWebClient.get()
            .uri { uriBuilder ->
                uriBuilder.path("/weather")
                    .queryParam("q", targetCity)
                    .queryParam("appid", weatherProperties.key)
                    .queryParam("units", "metric")
                    .queryParam("lang", "kr")
                    .build()
            }
            .retrieve()
            .bodyToMono(OpenWeatherMapResponse::class.java)
            .block() ?: throw RuntimeException("날씨 정보를 가져올 수 없습니다.")

        val weatherCode = response.weather.firstOrNull()?.id ?: 800
        val (condition, conditionText) = mapConditionCode(weatherCode)
        val temp = response.main?.temp ?: 0.0
        val windSpeed = response.wind?.speed ?: 0.0

        val weatherResponse = WeatherResponse(
            temp = temp,
            feelsLike = response.main?.feelsLike ?: 0.0,
            condition = condition,
            conditionText = conditionText,
            humidity = response.main?.humidity ?: 0,
            windSpeed = windSpeed,
            recommendation = generateRecommendation(temp, condition, windSpeed),
            city = response.name.ifBlank { targetCity },
            timestamp = Instant.ofEpochSecond(response.dt)
                .atZone(ZoneId.of("Asia/Seoul"))
                .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        )

        // Redis 캐시 저장
        try {
            val json = objectMapper.writeValueAsString(weatherResponse)
            redisTemplate.opsForValue().set(cacheKey, json, weatherProperties.cacheTtlMinutes, TimeUnit.MINUTES)
            logger.debug { "Weather cached: $cacheKey (TTL: ${weatherProperties.cacheTtlMinutes}min)" }
        } catch (e: Exception) {
            logger.warn { "Redis cache write failed: ${e.message}" }
        }

        return weatherResponse
    }

    fun getForecast(city: String?, days: Int = 3): WeatherForecastResponse {
        val targetCity = city?.takeIf { it.isNotBlank() } ?: weatherProperties.defaultCity
        val effectiveDays = days.coerceIn(1, 5)
        val cacheKey = "weather:forecast:$targetCity:$effectiveDays"

        // Redis 캐시 확인
        try {
            redisTemplate.opsForValue().get(cacheKey)?.let { cached ->
                logger.debug { "Forecast cache hit: $cacheKey" }
                return objectMapper.readValue(cached, WeatherForecastResponse::class.java)
            }
        } catch (e: Exception) {
            logger.warn { "Redis cache read failed: ${e.message}" }
        }

        logger.info { "Fetching forecast for city: $targetCity, days: $effectiveDays" }

        val cnt = effectiveDays * 8 // OpenWeatherMap returns 3-hour intervals
        val response = weatherWebClient.get()
            .uri { uriBuilder ->
                uriBuilder.path("/forecast")
                    .queryParam("q", targetCity)
                    .queryParam("appid", weatherProperties.key)
                    .queryParam("units", "metric")
                    .queryParam("lang", "kr")
                    .queryParam("cnt", cnt)
                    .build()
            }
            .retrieve()
            .bodyToMono(OpenWeatherMapForecastResponse::class.java)
            .block() ?: throw RuntimeException("날씨 예보를 가져올 수 없습니다.")

        // 날짜별 그룹화 및 집계
        val dailyForecasts = response.list
            .groupBy { item ->
                Instant.ofEpochSecond(item.dt)
                    .atZone(ZoneId.of("Asia/Seoul"))
                    .toLocalDate()
            }
            .entries
            .sortedBy { it.key }
            .take(effectiveDays)
            .map { (date, items) ->
                val tempMin = items.mapNotNull { it.main?.tempMin }.minOrNull() ?: 0.0
                val tempMax = items.mapNotNull { it.main?.tempMax }.maxOrNull() ?: 0.0
                // 가장 빈번한 날씨 코드 사용
                val mostFrequentCode = items
                    .flatMap { it.weather }
                    .groupBy { it.id }
                    .maxByOrNull { it.value.size }
                    ?.key ?: 800
                val (condition, conditionText) = mapConditionCode(mostFrequentCode)

                DailyForecast(
                    date = date.format(DateTimeFormatter.ISO_LOCAL_DATE),
                    tempMin = tempMin,
                    tempMax = tempMax,
                    condition = condition,
                    conditionText = conditionText
                )
            }

        val forecastResponse = WeatherForecastResponse(
            city = response.city?.name ?: targetCity,
            forecasts = dailyForecasts
        )

        // Redis 캐시 저장
        try {
            val json = objectMapper.writeValueAsString(forecastResponse)
            redisTemplate.opsForValue().set(cacheKey, json, weatherProperties.cacheTtlMinutes, TimeUnit.MINUTES)
            logger.debug { "Forecast cached: $cacheKey (TTL: ${weatherProperties.cacheTtlMinutes}min)" }
        } catch (e: Exception) {
            logger.warn { "Redis cache write failed: ${e.message}" }
        }

        return forecastResponse
    }

    fun getClothingRecommendation(city: String?): String {
        val weather = getCurrentWeather(city)
        return generateRecommendation(weather.temp, weather.condition, weather.windSpeed)
    }

    private fun mapConditionCode(code: Int): Pair<String, String> = when (code) {
        in 200..599 -> "rainy" to "비"
        in 600..699 -> "snowy" to "눈"
        in 700..799 -> "foggy" to "안개/흐림"
        800 -> "sunny" to "맑음"
        801 -> "partly-cloudy" to "구름 조금"
        in 802..899 -> "cloudy" to "흐림"
        else -> "sunny" to "맑음"
    }

    private fun generateRecommendation(temp: Double, condition: String, windSpeed: Double): String = buildString {
        // 기온 기반 옷차림 추천
        when {
            temp < 0 -> append("🧣 매우 추운 날씨입니다. 패딩, 두꺼운 코트, 목도리, 장갑 등 방한용품을 꼭 챙기세요.")
            temp < 10 -> append("🧥 쌀쌀한 날씨입니다. 따뜻한 코트나 두꺼운 외투를 입으세요.")
            temp < 20 -> append("🧤 선선한 날씨입니다. 가벼운 자켓이나 가디건을 추천합니다.")
            temp < 25 -> append("👕 쾌적한 날씨입니다. 편안한 옷차림이 좋겠습니다.")
            else -> append("🩳 더운 날씨입니다. 시원한 옷차림을 추천합니다. 수분 섭취를 충분히 하세요.")
        }

        // 날씨 상태 기반 추가 조언
        when (condition) {
            "rainy" -> append(" ☔ 비 소식이 있으니 우산을 챙기세요.")
            "snowy" -> append(" ❄️ 눈이 예상됩니다. 미끄럼에 주의하고 방수 신발을 신으세요.")
            "foggy" -> append(" 🌫️ 안개/연무가 예상됩니다. 운전 시 시야에 주의하세요.")
            "cloudy" -> append(" ☁️ 흐린 날씨입니다. 우산을 챙기면 좋겠습니다.")
            else -> {}
        }

        // 강풍 경고
        if (windSpeed > 10.0) {
            append(" 💨 바람이 강하게 불 예정이니 외출 시 주의하세요.")
        }
    }
}
