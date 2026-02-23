package com.mcp.calendar.service

import com.mcp.calendar.dto.request.LoginRequest
import com.mcp.calendar.dto.request.RefreshTokenRequest
import com.mcp.calendar.dto.request.RegisterRequest
import com.mcp.calendar.dto.response.AuthResponse
import com.mcp.calendar.model.User
import com.mcp.calendar.repository.UserRepository
import com.mcp.calendar.security.JwtTokenProvider
import mu.KotlinLogging
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.concurrent.TimeUnit

private val logger = KotlinLogging.logger {}

@Service
@Transactional
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider,
    private val redisTemplate: RedisTemplate<String, String>
) {

    companion object {
        private const val REFRESH_TOKEN_PREFIX = "refresh:"
    }

    /**
     * 회원가입
     *
     * 1. 이메일 중복 검사
     * 2. 비밀번호 BCrypt 해싱
     * 3. User 저장
     * 4. Access Token + Refresh Token 발급
     * 5. Refresh Token을 Redis에 저장
     */
    fun register(request: RegisterRequest): AuthResponse {
        if (userRepository.existsByEmail(request.email)) {
            throw IllegalArgumentException("이미 등록된 이메일입니다: ${request.email}")
        }

        val encodedPassword = passwordEncoder.encode(request.password)
        val user = User(
            email = request.email,
            password = encodedPassword,
            name = request.name
        )

        val savedUser = userRepository.save(user)
        logger.info { "회원가입 완료: ${savedUser.email} (ID: ${savedUser.id})" }

        return generateTokensAndRespond(savedUser)
    }

    /**
     * 로그인
     *
     * 1. 이메일로 사용자 조회
     * 2. 비밀번호 BCrypt 비교
     * 3. Access Token + Refresh Token 발급
     * 4. Refresh Token을 Redis에 저장 (기존 토큰 덮어쓰기)
     */
    fun login(request: LoginRequest): AuthResponse {
        val user = userRepository.findByEmail(request.email)
            ?: throw IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.")

        if (!passwordEncoder.matches(request.password, user.password)) {
            throw IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.")
        }

        logger.info { "로그인 성공: ${user.email} (ID: ${user.id})" }
        return generateTokensAndRespond(user)
    }

    /**
     * Access Token 재발급
     *
     * 1. Refresh Token 유효성 검증
     * 2. Redis에 저장된 Refresh Token과 일치 확인
     * 3. 새 Access Token 발급 (Refresh Token은 유지)
     */
    fun refresh(request: RefreshTokenRequest): AuthResponse {
        val refreshToken = request.refreshToken

        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw IllegalArgumentException("유효하지 않거나 만료된 Refresh Token입니다.")
        }

        val tokenType = jwtTokenProvider.getTokenType(refreshToken)
        if (tokenType != "refresh") {
            throw IllegalArgumentException("Refresh Token이 아닙니다.")
        }

        val userId = jwtTokenProvider.getUserId(refreshToken)

        // Redis에 저장된 Refresh Token과 비교
        val storedToken = redisTemplate.opsForValue().get("$REFRESH_TOKEN_PREFIX$userId")
        if (storedToken == null || storedToken != refreshToken) {
            throw IllegalArgumentException("이미 로그아웃되었거나 무효화된 토큰입니다.")
        }

        val user = userRepository.findById(userId)
            ?: throw IllegalArgumentException("사용자를 찾을 수 없습니다.")

        // 새 Access Token만 발급 (Refresh Token은 기존 것 유지)
        val newAccessToken = jwtTokenProvider.generateAccessToken(
            userId = user.id,
            email = user.email,
            role = user.role.name
        )

        logger.info { "토큰 재발급: ${user.email} (ID: ${user.id})" }

        return AuthResponse(
            accessToken = newAccessToken,
            refreshToken = refreshToken,
            user = AuthResponse.UserInfo(
                id = user.id,
                email = user.email,
                name = user.name,
                role = user.role.name
            )
        )
    }

    /**
     * 로그아웃
     * Redis에서 Refresh Token 삭제
     */
    fun logout(userId: Long) {
        redisTemplate.delete("$REFRESH_TOKEN_PREFIX$userId")
        logger.info { "로그아웃 완료: userId=$userId" }
    }

    /**
     * Access Token + Refresh Token 생성 및 Redis 저장
     */
    private fun generateTokensAndRespond(user: User): AuthResponse {
        val accessToken = jwtTokenProvider.generateAccessToken(
            userId = user.id,
            email = user.email,
            role = user.role.name
        )
        val refreshToken = jwtTokenProvider.generateRefreshToken(user.id)

        // Redis에 Refresh Token 저장 (TTL = refresh token 만료 시간)
        redisTemplate.opsForValue().set(
            "$REFRESH_TOKEN_PREFIX${user.id}",
            refreshToken,
            jwtTokenProvider.getRefreshTokenExpirationMs(),
            TimeUnit.MILLISECONDS
        )

        return AuthResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            user = AuthResponse.UserInfo(
                id = user.id,
                email = user.email,
                name = user.name,
                role = user.role.name
            )
        )
    }
}
