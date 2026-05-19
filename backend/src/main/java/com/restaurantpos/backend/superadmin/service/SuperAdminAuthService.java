package com.restaurantpos.backend.superadmin.service;

import com.restaurantpos.backend.security.JwtUtil;
import com.restaurantpos.backend.superadmin.dto.SuperAdminAuthRequest;
import com.restaurantpos.backend.superadmin.dto.SuperAdminAuthResponse;
import com.restaurantpos.backend.superadmin.entity.SuperAdmin;
import com.restaurantpos.backend.superadmin.repository.SuperAdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class SuperAdminAuthService {

    @Autowired
    private SuperAdminRepository superAdminRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Authenticate super admin and return JWT.
     * Throws RuntimeException with generic message on any failure
     * (doesn't reveal whether username or password was wrong — security).
     */
    public SuperAdminAuthResponse login(SuperAdminAuthRequest request) {
        // Find by username
        SuperAdmin admin = superAdminRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        // Check active flag — disabled super admins can't login
        if (!Boolean.TRUE.equals(admin.getIsActive())) {
            throw new RuntimeException("Account is disabled. Contact system administrator.");
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            throw new RuntimeException("Invalid username or password");
        }

        // Update last login timestamp
        admin.setLastLoginAt(LocalDateTime.now());
        superAdminRepository.save(admin);

        // Generate token
        String token = jwtUtil.generateSuperAdminToken(admin.getId(), admin.getUsername());

        return new SuperAdminAuthResponse(
                token,
                admin.getId(),
                admin.getUsername(),
                admin.getFullName(),
                admin.getEmail(),
                admin.getLastLoginAt()
        );
    }
}