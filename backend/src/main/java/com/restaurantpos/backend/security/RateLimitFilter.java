package com.restaurantpos.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.service.RateLimitService;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RateLimitFilter(RateLimitService rateLimitService) {
        this.rateLimitService = rateLimitService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String ip = getClientIp(request);

        Bucket bucket = null;
        String message = null;

        // Check which endpoint and apply appropriate rate limit
        if (path.equals("/api/auth/login") && "POST".equalsIgnoreCase(request.getMethod())) {
            bucket = rateLimitService.resolveLoginBucket(ip);
            message = "Too many login attempts. Please try again in a minute.";
        } else if (path.equals("/api/auth/forgot-password")
                && "POST".equalsIgnoreCase(request.getMethod())) {
            bucket = rateLimitService.resolveForgotPasswordBucket(ip);
            message = "Too many password reset requests. Please try again in a minute.";
        }

        // If this endpoint has rate limiting → check it
        if (bucket != null) {
            if (!rateLimitService.tryConsume(bucket)) {
                long retryAfter = rateLimitService.getSecondsUntilRefill(bucket);
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setHeader("Retry-After", String.valueOf(retryAfter));

                ApiResponse<Object> body = ApiResponse.error(message);
                response.getWriter().write(objectMapper.writeValueAsString(body));
                return;
            }
        }

        // Not rate limited → continue normal flow
        filterChain.doFilter(request, response);
    }

    /**
     * Get the real client IP (handles proxies/load balancers).
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            // Take the first IP in the chain
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }
}