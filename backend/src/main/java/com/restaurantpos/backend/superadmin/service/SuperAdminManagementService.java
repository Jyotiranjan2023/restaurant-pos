package com.restaurantpos.backend.superadmin.service;

import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.superadmin.dto.CreateSuperAdminRequest;
import com.restaurantpos.backend.superadmin.dto.SuperAdminResponse;
import com.restaurantpos.backend.superadmin.entity.SuperAdmin;
import com.restaurantpos.backend.superadmin.entity.SuperAdminAction;
import com.restaurantpos.backend.superadmin.repository.SuperAdminActionRepository;
import com.restaurantpos.backend.superadmin.repository.SuperAdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SuperAdminManagementService {

    private static final Logger log = LoggerFactory.getLogger(SuperAdminManagementService.class);

    @Autowired
    private SuperAdminRepository superAdminRepository;

    @Autowired
    private SuperAdminActionRepository actionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Create a new super admin.
     * Called by an already-authenticated super admin.
     */
    @Transactional
    public SuperAdminResponse createSuperAdmin(CreateSuperAdminRequest request, Long createdByAdminId) {

        // Uniqueness checks
        if (superAdminRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already taken: " + request.getUsername());
        }
        if (superAdminRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already taken: " + request.getEmail());
        }

        // Create
        SuperAdmin newAdmin = new SuperAdmin();
        newAdmin.setUsername(request.getUsername());
        newAdmin.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        newAdmin.setFullName(request.getFullName());
        newAdmin.setEmail(request.getEmail());
        newAdmin.setIsActive(true);
        newAdmin.setCreatedAt(LocalDateTime.now());

        SuperAdmin saved = superAdminRepository.save(newAdmin);

        // Audit log
        SuperAdminAction action = new SuperAdminAction();
        action.setSuperAdminId(createdByAdminId);
        action.setAction("CREATE_SUPER_ADMIN");
        action.setNewValue("username=" + saved.getUsername() + ", id=" + saved.getId());
        action.setReason("New super admin account created");
        action.setCreatedAt(LocalDateTime.now());
        actionRepository.save(action);

        log.info("Super admin {} created new super admin {} (id={})",
                createdByAdminId, saved.getUsername(), saved.getId());

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SuperAdminResponse> listAllSuperAdmins() {
        return superAdminRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private SuperAdminResponse toResponse(SuperAdmin admin) {
        SuperAdminResponse dto = new SuperAdminResponse();
        dto.setId(admin.getId());
        dto.setUsername(admin.getUsername());
        dto.setFullName(admin.getFullName());
        dto.setEmail(admin.getEmail());
        dto.setIsActive(admin.getIsActive());
        dto.setLastLoginAt(admin.getLastLoginAt());
        dto.setCreatedAt(admin.getCreatedAt());
        return dto;
    }
}