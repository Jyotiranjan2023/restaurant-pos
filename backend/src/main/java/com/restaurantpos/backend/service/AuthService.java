package com.restaurantpos.backend.service;

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

    private final TenantRepository tenantRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public AuthService(TenantRepository tenantRepo, UserRepository userRepo,
                       PasswordEncoder encoder, JwtUtil jwtUtil) {
        this.tenantRepo = tenantRepo;
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse registerRestaurant(RegisterRestaurantRequest req) {
        if (tenantRepo.existsByEmail(req.getEmail()))
            throw new BadRequestException("A restaurant with this email already exists");

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
        admin = userRepo.save(admin);

        // 3. return token
        String token = jwtUtil.generateToken(admin.getId(), admin.getUsername(),
                                             admin.getRole().name(), tenant.getId());
        return new AuthResponse(token, admin.getId(), admin.getUsername(), admin.getFullName(),
                                admin.getRole().name(), tenant.getId(), tenant.getRestaurantName());
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepo.findByUsernameAndTenantId(req.getUsername(), req.getTenantId())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!Boolean.TRUE.equals(user.getActive()))
            throw new BadRequestException("User account is deactivated");

        if (!encoder.matches(req.getPassword(), user.getPassword()))
            throw new BadCredentialsException("Invalid credentials");

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(),
                                             user.getRole().name(), user.getTenant().getId());
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getFullName(),
                                user.getRole().name(), user.getTenant().getId(),
                                user.getTenant().getRestaurantName());
    }
}