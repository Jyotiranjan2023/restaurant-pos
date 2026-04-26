package com.restaurantpos.backend.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class RateLimitService {

    /**
     * In-memory bucket storage per IP address.
     * For production with multiple servers, switch to Redis-backed buckets.
     */
    private final ConcurrentMap<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Bucket> forgotPasswordBuckets = new ConcurrentHashMap<>();

    /**
     * Login: 5 attempts per minute per IP.
     */
    public Bucket resolveLoginBucket(String ipAddress) {
        return loginBuckets.computeIfAbsent(ipAddress, ip -> {
            Bandwidth limit = Bandwidth.classic(
                    5,                                   // 5 tokens
                    Refill.greedy(5, Duration.ofMinutes(1))  // refill 5 tokens every minute
            );
            return Bucket.builder().addLimit(limit).build();
        });
    }

    /**
     * Forgot password: 3 attempts per minute per IP.
     */
    public Bucket resolveForgotPasswordBucket(String ipAddress) {
        return forgotPasswordBuckets.computeIfAbsent(ipAddress, ip -> {
            Bandwidth limit = Bandwidth.classic(
                    3,
                    Refill.greedy(3, Duration.ofMinutes(1))
            );
            return Bucket.builder().addLimit(limit).build();
        });
    }

    /**
     * Try to consume 1 token from the bucket.
     * Returns true if request is allowed, false if rate limit exceeded.
     */
    public boolean tryConsume(Bucket bucket) {
        return bucket.tryConsume(1);
    }

    /**
     * Get seconds until next token is available (for Retry-After header).
     */
    public long getSecondsUntilRefill(Bucket bucket) {
        return bucket.getAvailableTokens() == 0
                ? bucket.estimateAbilityToConsume(1).getNanosToWaitForRefill() / 1_000_000_000
                : 0;
    }
}