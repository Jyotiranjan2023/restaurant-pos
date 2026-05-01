package com.restaurantpos.backend.service;

import com.restaurantpos.backend.dto.request.CreateStaffRequest;
import com.restaurantpos.backend.dto.request.ResetPasswordRequest;
import com.restaurantpos.backend.dto.request.UpdateRoleRequest;
import com.restaurantpos.backend.dto.request.UpdateStatusRequest;
import com.restaurantpos.backend.dto.response.StaffResponse;
import com.restaurantpos.backend.entity.Tenant;
import com.restaurantpos.backend.entity.User;
import com.restaurantpos.backend.enums.Role;
import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.exception.ResourceNotFoundException;
import com.restaurantpos.backend.repository.TenantRepository;
import com.restaurantpos.backend.repository.UserRepository;
import com.restaurantpos.backend.security.TenantContext;
import com.restaurantpos.backend.security.UserPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StaffService {

    private final UserRepository userRepo;
    private final TenantRepository tenantRepo;
    private final PasswordEncoder passwordEncoder;

    public StaffService(UserRepository userRepo,
                        TenantRepository tenantRepo,
                        PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.tenantRepo = tenantRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public StaffResponse createStaff(CreateStaffRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        // ADMIN cannot create other ADMINs via this endpoint (security)
        if (req.getRole() == Role.ADMIN)
            throw new BadRequestException("Cannot create ADMIN user via staff endpoint. " +
                    "ADMIN is only the restaurant owner created at registration.");

        if (userRepo.existsByUsernameAndTenantId(req.getUsername(), tenantId))
            throw new BadRequestException("Username '" + req.getUsername() + "' already exists");

        Tenant tenant = tenantRepo.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        User staff = new User();
        staff.setUsername(req.getUsername());
        staff.setPassword(passwordEncoder.encode(req.getPassword()));
        staff.setFullName(req.getFullName());
        staff.setRole(req.getRole());
        staff.setTenant(tenant);

        return toResponse(userRepo.save(staff));
    }
    public List<StaffResponse> findAllStaff() {
        Long tenantId = TenantContext.getCurrentTenantId();
        return userRepo.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public StaffResponse findStaffById(Long id) {
        User user = findUserForCurrentTenant(id);
        return toResponse(user);
    }

    @Transactional
    public StaffResponse updateRole(Long id, UpdateRoleRequest req) {
        UserPrincipal currentUser = TenantContext.getCurrentUser();
        User target = findUserForCurrentTenant(id);

        // Cannot change your own role (prevents lockout)
        if (target.getId().equals(currentUser.getUserId()))
            throw new BadRequestException("You cannot change your own role");

        // Cannot change an ADMIN's role (owner must stay owner)
        if (target.getRole() == Role.ADMIN)
            throw new BadRequestException("Cannot change the role of an ADMIN user");

        // Cannot promote to ADMIN via this endpoint
        if (req.getRole() == Role.ADMIN)
            throw new BadRequestException("Cannot promote user to ADMIN via this endpoint");

        target.setRole(req.getRole());
        return toResponse(userRepo.save(target));
    }

    @Transactional
    public StaffResponse updateStatus(Long id, UpdateStatusRequest req) {
        UserPrincipal currentUser = TenantContext.getCurrentUser();
        User target = findUserForCurrentTenant(id);

        // Cannot deactivate yourself
        if (target.getId().equals(currentUser.getUserId()))
            throw new BadRequestException("You cannot deactivate your own account");

        // Cannot deactivate an ADMIN
        if (target.getRole() == Role.ADMIN && !req.getActive())
            throw new BadRequestException("Cannot deactivate an ADMIN user");

        target.setActive(req.getActive());
        return toResponse(userRepo.save(target));
    }

    @Transactional
    public void resetPassword(Long id, ResetPasswordRequest req) {
        User target = findUserForCurrentTenant(id);
        target.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepo.save(target);
    }

    @Transactional
    public void deleteStaff(Long id) {
        UserPrincipal currentUser = TenantContext.getCurrentUser();
        User target = findUserForCurrentTenant(id);

        if (target.getId().equals(currentUser.getUserId()))
            throw new BadRequestException("You cannot delete your own account");

        if (target.getRole() == Role.ADMIN)
            throw new BadRequestException("Cannot delete an ADMIN user");

        userRepo.delete(target);
    }

    // ========== Helpers ==========

    private User findUserForCurrentTenant(Long userId) {
        Long tenantId = TenantContext.getCurrentTenantId();
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getTenant().getId().equals(tenantId))
            throw new ResourceNotFoundException("User not found");

        return user;
    }

    private StaffResponse toResponse(User u) {
        return new StaffResponse(
            u.getId(),
            u.getUsername(),
            u.getFullName(),
            u.getRole(),
            u.getActive(),
            u.getCreatedAt()
        );
    }
}