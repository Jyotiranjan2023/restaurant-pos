package com.restaurantpos.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Long userId, String username, String role, Long tenantId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("role", role);
        claims.put("tenantId", tenantId);

        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getKey())
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getUsername(String token) { return parseToken(token).getSubject(); }
    public Long getUserId(String token) { return parseToken(token).get("userId", Long.class); }
    public String getRole(String token) { return parseToken(token).get("role", String.class); }
    public Long getTenantId(String token) { return parseToken(token).get("tenantId", Long.class); }

    public boolean isValid(String token) {
        try { parseToken(token); return true; }
        catch (Exception e) { return false; }
    }
    /**
     * Generate JWT token for a super admin.
     * No tenantId — super admin is cross-tenant.
     * Includes "superAdmin: true" claim for filter/middleware identification.
     */
    public String generateSuperAdminToken(Long superAdminId, String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", superAdminId);
        claims.put("role", "SUPER_ADMIN");
        claims.put("superAdmin", true);
        // No tenantId — super admin has no tenant

        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getKey())
                .compact();
    }

    /**
     * Check if a token belongs to a super admin.
     * Returns false if claim missing or token invalid.
     */
    public boolean isSuperAdminToken(String token) {
        try {
            Boolean flag = parseToken(token).get("superAdmin", Boolean.class);
            return Boolean.TRUE.equals(flag);
        } catch (Exception e) {
            return false;
        }
    }
    
}