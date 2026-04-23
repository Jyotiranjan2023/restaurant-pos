package com.restaurantpos.backend.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class TenantContext {

    public static UserPrincipal getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal)) {
            throw new RuntimeException("No authenticated user found");
        }
        return (UserPrincipal) auth.getPrincipal();
    }

    public static Long getCurrentTenantId() {
        return getCurrentUser().getTenantId();
    }

    public static String getCurrentRole() {
        return getCurrentUser().getRole();
    }
}