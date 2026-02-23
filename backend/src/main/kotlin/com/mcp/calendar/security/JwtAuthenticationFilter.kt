package com.mcp.calendar.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import mu.KotlinLogging
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

private val logger = KotlinLogging.logger {}

/**
 * JWT 인증 필터
 *
 * 모든 HTTP 요청에서 Authorization 헤더의 Bearer 토큰을 검증하고,
 * 유효하면 SecurityContext에 인증 정보를 설정합니다.
 *
 * Access Token만 허용하며, Refresh Token은 거부합니다.
 */
@Component
class JwtAuthenticationFilter(
    private val jwtTokenProvider: JwtTokenProvider
) : OncePerRequestFilter() {

    companion object {
        private const val AUTHORIZATION_HEADER = "Authorization"
        private const val BEARER_PREFIX = "Bearer "
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        try {
            val token = resolveToken(request)

            if (token != null && jwtTokenProvider.validateToken(token)) {
                val tokenType = jwtTokenProvider.getTokenType(token)

                if (tokenType == "access") {
                    val userId = jwtTokenProvider.getUserId(token)
                    val email = jwtTokenProvider.getEmail(token)
                    val role = jwtTokenProvider.getRole(token)

                    val principal = UserPrincipal(
                        id = userId,
                        email = email,
                        passwordHash = "",
                        name = "",
                        role = role
                    )

                    val authorities = listOf(SimpleGrantedAuthority("ROLE_$role"))
                    val authentication = UsernamePasswordAuthenticationToken(
                        principal, null, authorities
                    )
                    authentication.details = WebAuthenticationDetailsSource().buildDetails(request)

                    SecurityContextHolder.getContext().authentication = authentication
                    logger.debug { "인증 성공: userId=$userId, email=$email" }
                } else {
                    logger.warn { "Access Token이 아닌 토큰이 사용됨: type=$tokenType" }
                }
            }
        } catch (e: Exception) {
            logger.error(e) { "JWT 인증 처리 중 오류 발생" }
        }

        filterChain.doFilter(request, response)
    }

    /**
     * Authorization 헤더에서 Bearer 토큰 추출
     */
    private fun resolveToken(request: HttpServletRequest): String? {
        val bearerToken = request.getHeader(AUTHORIZATION_HEADER)
        return if (bearerToken != null && bearerToken.startsWith(BEARER_PREFIX)) {
            bearerToken.substring(BEARER_PREFIX.length)
        } else {
            null
        }
    }
}
