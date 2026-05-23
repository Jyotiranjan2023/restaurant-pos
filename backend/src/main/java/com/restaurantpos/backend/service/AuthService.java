package com.restaurantpos.backend.service;



import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import com.restaurantpos.backend.dto.request.LoginRequest;
import com.restaurantpos.backend.dto.request.RegisterRestaurantRequest;
import com.restaurantpos.backend.dto.response.AuthResponse;
import com.restaurantpos.backend.entity.Tenant;
import com.restaurantpos.backend.entity.User;
import com.restaurantpos.backend.enums.Role;
import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.repository.TenantRepository;
import com.restaurantpos.backend.repository.UserRepository;
import com.restaurantpos.backend.security.JwtUtil;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final TenantRepository tenantRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    
    @Autowired
    private SubscriptionService subscriptionService;

    public AuthService(TenantRepository tenantRepo, UserRepository userRepo,
                       PasswordEncoder encoder, JwtUtil jwtUtil) {
        this.tenantRepo = tenantRepo;
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse registerRestaurant(RegisterRestaurantRequest req) {
        log.info("Restaurant registration attempt: '{}' with admin '{}'",
                req.getRestaurantName(), req.getAdminUsername());

        if (tenantRepo.existsByEmail(req.getEmail())) {
            log.warn("Registration failed: email '{}' already exists", req.getEmail());
            throw new BadRequestException("A restaurant with this email already exists");
        }

        // 1. create tenant
        Tenant tenant = new Tenant();
        tenant.setRestaurantName(req.getRestaurantName());
        tenant.setEmail(req.getEmail());
        tenant.setPhone(req.getPhone());
        tenant.setAddress(req.getAddress());
        tenant = tenantRepo.save(tenant);

        // 2. create first ADMIN user
        User admin = new User();
        admin.setUsername(req.getAdminUsername());
        admin.setPassword(encoder.encode(req.getAdminPassword()));
        admin.setFullName(req.getAdminFullName());
        admin.setRole(Role.ADMIN);
        admin.setTenant(tenant);
        admin.setEmail(tenant.getEmail());  // ← moved BEFORE save
        admin = userRepo.save(admin);       // ← now saves WITH email
        
        log.info("Restaurant registered successfully: tenant={} ('{}'), admin user={} ('{}')",
                tenant.getId(), tenant.getRestaurantName(),
                admin.getId(), admin.getUsername());

        // 2.5. Create 7-day trial subscription for new tenant
        try {
            subscriptionService.createTrialSubscription(tenant.getId());
            log.info("Trial subscription created for tenant {}", tenant.getId());
        } catch (Exception e) {
            // Don't fail signup if trial creation fails
            // Tenant is still created — trial can be added manually later
            log.error("Failed to create trial subscription for tenant {}: {}", 
                tenant.getId(), e.getMessage());
        }

        // 3. return token
        String token = jwtUtil.generateToken(admin.getId(), admin.getUsername(),
                                             admin.getRole().name(), tenant.getId());
        return new AuthResponse(token, admin.getId(), admin.getUsername(), admin.getFullName(),
                                admin.getRole().name(), tenant.getId(), tenant.getRestaurantName());
    }

    public AuthResponse login(LoginRequest req) {
        log.info("Login attempt for user '{}' at restaurant '{}'",
                req.getUsername(), req.getRestaurantEmail());

        // Step 1: Find tenant by restaurant email
        Tenant tenant = tenantRepo.findByEmail(req.getRestaurantEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed: no restaurant with email '{}'", req.getRestaurantEmail());
                    return new BadCredentialsException("Invalid credentials");
                });

        // Step 2: Find user by username within that tenant
        User user = userRepo.findByUsernameAndTenantId(req.getUsername(), tenant.getId())
                .orElseThrow(() -> {
                    log.warn("Login failed: user '{}' not found in tenant {}",
                            req.getUsername(), tenant.getId());
                    return new BadCredentialsException("Invalid credentials");
                });

        // Step 3: Check user is active
        if (!Boolean.TRUE.equals(user.getActive())) {
            log.warn("Login failed: user '{}' (tenant {}) is deactivated",
                    user.getUsername(), tenant.getId());
            throw new BadRequestException("User account is deactivated");
        }

        // Step 4: Verify password
        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            log.warn("Login failed: wrong password for user '{}' (tenant {})",
                    user.getUsername(), tenant.getId());
            throw new BadCredentialsException("Invalid credentials");
        }

        // Step 5: Generate token
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(),
                                             user.getRole().name(), tenant.getId());

        log.info("Login successful: user '{}' (role={}, tenant={})",
                user.getUsername(), user.getRole(), tenant.getId());

        return new AuthResponse(token, user.getId(), user.getUsername(), user.getFullName(),
                                user.getRole().name(), tenant.getId(),
                                tenant.getRestaurantName());
    }
}