package com.mcp.calendar.controller

import com.mcp.calendar.dto.request.LoginRequest
import com.mcp.calendar.dto.request.RefreshTokenRequest
import com.mcp.calendar.dto.request.RegisterRequest
import com.mcp.calendar.dto.response.ApiResponse
import com.mcp.calendar.dto.response.AuthResponse
import com.mcp.calendar.security.UserPrincipal
import com.mcp.calendar.service.AuthService
import jakarta.validation.Valid
import mu.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {

    /**
     * POST /api/auth/register — 회원가입
     */
    @PostMapping("/register")
    fun register(
        @Valid @RequestBody request: RegisterRequest
    ): ResponseEntity<ApiResponse<AuthResponse>> {
        logger.info { "회원가입 요청: ${request.email}" }
        val response = authService.register(request)
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(response))
    }

    /**
     * POST /api/auth/login — 로그인
     */
    @PostMapping("/login")
    fun login(
        @Valid @RequestBody request: LoginRequest
    ): ResponseEntity<ApiResponse<AuthResponse>> {
        logger.info { "로그인 요청: ${request.email}" }
        val response = authService.login(request)
        return ResponseEntity.ok(ApiResponse.success(response))
    }

    /**
     * POST /api/auth/refresh — Access Token 재발급
     */
    @PostMapping("/refresh")
    fun refresh(
        @Valid @RequestBody request: RefreshTokenRequest
    ): ResponseEntity<ApiResponse<AuthResponse>> {
        logger.info { "토큰 재발급 요청" }
        val response = authService.refresh(request)
        return ResponseEntity.ok(ApiResponse.success(response))
    }

    /**
     * POST /api/auth/logout — 로그아웃
     * Authorization 헤더의 Access Token으로 인증된 사용자의 Refresh Token을 삭제합니다.
     */
    @PostMapping("/logout")
    fun logout(
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<Unit>> {
        logger.info { "로그아웃 요청: userId=${principal.id}" }
        authService.logout(principal.id)
        return ResponseEntity.ok(ApiResponse.successNoContent())
    }

    /**
     * GET /api/auth/me — 현재 인증된 사용자 정보 조회
     */
    @GetMapping("/me")
    fun me(
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<AuthResponse.UserInfo>> {
        logger.debug { "사용자 정보 조회: userId=${principal.id}" }
        return ResponseEntity.ok(
            ApiResponse.success(
                AuthResponse.UserInfo(
                    id = principal.id,
                    email = principal.email,
                    name = principal.name,
                    role = principal.role
                )
            )
        )
    }
}
