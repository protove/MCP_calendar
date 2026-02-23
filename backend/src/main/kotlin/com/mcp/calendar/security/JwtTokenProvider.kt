package com.mcp.calendar.security

import io.jsonwebtoken.*
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.*
import javax.crypto.SecretKey

private val logger = KotlinLogging.logger {}

/**
 * JWT 토큰 생성, 파싱, 검증을 담당합니다.
 *
 * - Access Token: 30분 (기본) — 인증용
 * - Refresh Token: 7일 (기본) — Access Token 재발급용
 */
@Component
class JwtTokenProvider(
    @Value("\${jwt.secret}") secret: String,
    @Value("\${jwt.access-token-expiration}") private val accessTokenExpiration: Long,
    @Value("\${jwt.refresh-token-expiration}") private val refreshTokenExpiration: Long
) {

    private val key: SecretKey = run {
        val keyBytes = if (secret.length >= 64) {
            // Base64 인코딩 키를 그대로 사용
            try {
                Decoders.BASE64.decode(secret)
            } catch (e: Exception) {
                secret.toByteArray()
            }
        } else {
            secret.toByteArray()
        }
        Keys.hmacShaKeyFor(keyBytes)
    }

    /**
     * Access Token 생성
     */
    fun generateAccessToken(userId: Long, email: String, role: String): String {
        val now = Date()
        val expiry = Date(now.time + accessTokenExpiration)

        return Jwts.builder()
            .subject(userId.toString())
            .claim("email", email)
            .claim("role", role)
            .claim("type", "access")
            .issuedAt(now)
            .expiration(expiry)
            .signWith(key)
            .compact()
    }

    /**
     * Refresh Token 생성
     */
    fun generateRefreshToken(userId: Long): String {
        val now = Date()
        val expiry = Date(now.time + refreshTokenExpiration)

        return Jwts.builder()
            .subject(userId.toString())
            .claim("type", "refresh")
            .issuedAt(now)
            .expiration(expiry)
            .signWith(key)
            .compact()
    }

    /**
     * 토큰에서 Claims 추출
     */
    fun getClaims(token: String): Claims {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .payload
    }

    /**
     * 토큰에서 userId 추출
     */
    fun getUserId(token: String): Long {
        return getClaims(token).subject.toLong()
    }

    /**
     * 토큰에서 email 추출
     */
    fun getEmail(token: String): String {
        return getClaims(token)["email"] as String
    }

    /**
     * 토큰에서 role 추출
     */
    fun getRole(token: String): String {
        return getClaims(token)["role"] as String
    }

    /**
     * 토큰에서 type 추출 (access / refresh)
     */
    fun getTokenType(token: String): String {
        return getClaims(token)["type"] as String
    }

    /**
     * 토큰 유효성 검증
     */
    fun validateToken(token: String): Boolean {
        return try {
            getClaims(token)
            true
        } catch (e: ExpiredJwtException) {
            logger.warn { "JWT 만료됨: ${e.message}" }
            false
        } catch (e: MalformedJwtException) {
            logger.warn { "JWT 형식 오류: ${e.message}" }
            false
        } catch (e: UnsupportedJwtException) {
            logger.warn { "지원하지 않는 JWT: ${e.message}" }
            false
        } catch (e: IllegalArgumentException) {
            logger.warn { "JWT 비어있음: ${e.message}" }
            false
        } catch (e: SecurityException) {
            logger.warn { "JWT 서명 오류: ${e.message}" }
            false
        }
    }

    fun getRefreshTokenExpirationMs(): Long = refreshTokenExpiration
}
