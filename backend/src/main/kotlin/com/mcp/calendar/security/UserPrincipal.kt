package com.mcp.calendar.security

import com.mcp.calendar.model.User
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails

/**
 * Spring Security UserDetails 구현체
 * SecurityContext에 저장되어 인증된 사용자 정보를 제공합니다.
 */
data class UserPrincipal(
    val id: Long,
    val email: String,
    private val passwordHash: String,
    val name: String,
    val role: String
) : UserDetails {

    override fun getUsername(): String = email
    override fun getPassword(): String = passwordHash
    override fun getAuthorities(): Collection<GrantedAuthority> =
        listOf(SimpleGrantedAuthority("ROLE_$role"))

    override fun isAccountNonExpired(): Boolean = true
    override fun isAccountNonLocked(): Boolean = true
    override fun isCredentialsNonExpired(): Boolean = true
    override fun isEnabled(): Boolean = true

    companion object {
        fun from(user: User): UserPrincipal = UserPrincipal(
            id = user.id,
            email = user.email,
            passwordHash = user.password,
            name = user.name,
            role = user.role.name
        )
    }
}
