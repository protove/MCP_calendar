package com.mcp.calendar.config

import com.mcp.calendar.security.JwtAuthenticationFilter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

// Spring Security 설정
// - JWT 기반 Stateless 인증
// - 인증 불필요: /api/auth/register, /api/auth/login, /api/auth/refresh, /mcp, /api/chat/health
// - 인증 필요: /api/events, /api/transactions, /api/chat, /api/auth/logout, /api/users
@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val jwtAuthenticationFilter: JwtAuthenticationFilter
) {

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .cors { it.configurationSource(corsConfigurationSource()) }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { auth ->
                auth
                    // 인증 불필요 엔드포인트
                    .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/refresh").permitAll()
                    .requestMatchers("/mcp/**").permitAll()
                    .requestMatchers("/api/weather/**").permitAll()
                    .requestMatchers("/api/health").permitAll()
                    .requestMatchers("/api/chat/health").permitAll()
                    // 나머지 /api/** 는 인증 필요
                    .requestMatchers("/api/**").authenticated()
                    // 그 외 모든 경로 차단 (불필요한 노출 방지)
                    .anyRequest().denyAll()
            }
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)

        return http.build()
    }

    // CORS 설정 - 환경변수로 허용 도메인 제어
    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        val origins = (System.getenv("CORS_ALLOWED_ORIGINS") ?: "*")
            .split(",")
            .map { it.trim() }
        configuration.allowedOriginPatterns = origins
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
        configuration.allowedHeaders = listOf("*")
        configuration.allowCredentials = true

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }
}