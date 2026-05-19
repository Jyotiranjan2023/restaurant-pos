package com.restaurantpos.backend.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) { this.jwtUtil = jwtUtil; }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                if (jwtUtil.isValid(token)) {
                    Claims claims = jwtUtil.parseToken(token);
                    Long userId   = claims.get("userId", Long.class);
                    String username = claims.getSubject();
                    String role   = claims.get("role", String.class);
                    Long tenantId = claims.get("tenantId", Long.class);
                    Boolean superAdminFlag = claims.get("superAdmin", Boolean.class);

                    // CONSISTENCY CHECK: superAdmin flag and role must agree.
                    // Prevents accidental privilege escalation if a tenant user
                    // somehow got role="SUPER_ADMIN" or vice versa.
                    boolean isSuperAdmin = Boolean.TRUE.equals(superAdminFlag);
                    boolean roleIsSuperAdmin = "SUPER_ADMIN".equals(role);

                    if (isSuperAdmin != roleIsSuperAdmin) {
                        // Mismatch — reject by leaving security context empty.
                        chain.doFilter(request, response);
                        return;
                    }

                    // Super admin must NOT have a tenantId.
                    if (isSuperAdmin && tenantId != null) {
                        chain.doFilter(request, response);
                        return;
                    }

                    // Tenant user MUST have a tenantId.
                    if (!isSuperAdmin && tenantId == null) {
                        chain.doFilter(request, response);
                        return;
                    }

                    UserPrincipal principal = new UserPrincipal(userId, username, role, tenantId);
                    UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                            principal, null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + role))
                        );
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception e) {
                // invalid token -> leave context empty, endpoint will 401/403
            }
        }
        chain.doFilter(request, response);
    }
    }