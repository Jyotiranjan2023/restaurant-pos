package com.restaurantpos.backend.service;

import com.restaurantpos.backend.dto.request.ChangePasswordRequest;
import com.restaurantpos.backend.dto.request.UpdateProfileRequest;
import com.restaurantpos.backend.dto.response.MyProfileResponse;
import com.restaurantpos.backend.entity.User;
import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.exception.ResourceNotFoundException;
import com.restaurantpos.backend.repository.UserRepository;
import com.restaurantpos.backend.security.TenantContext;
import com.restaurantpos.backend.security.UserPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MeService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public MeService(UserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public MyProfileResponse getMyProfile() {
        User user = getCurrentUser();
        return toResponse(user);
    }

    @Transactional
    public MyProfileResponse updateProfile(UpdateProfileRequest req) {
        User user = getCurrentUser();

        user.setFullName(req.getFullName());
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            user.setEmail(req.getEmail().trim());
        }

        return toResponse(userRepo.save(user));
    }

    @Transactional
    public void changePassword(ChangePasswordRequest req) {
        User user = getCurrentUser();

        // Verify current password
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword()))
            throw new BadRequestException("Current password is incorrect");

        // Prevent setting same password
        if (passwordEncoder.matches(req.getNewPassword(), user.getPassword()))
            throw new BadRequestException("New password must be different from current password");

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepo.save(user);
    }

    // ========== Helpers ==========

    private User getCurrentUser() {
        UserPrincipal principal = TenantContext.getCurrentUser();
        return userRepo.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private MyProfileResponse toResponse(User u) {
        MyProfileResponse r = new MyProfileResponse();
        r.setId(u.getId());
        r.setUsername(u.getUsername());
        r.setFullName(u.getFullName());
        r.setEmail(u.getEmail());
        r.setRole(u.getRole());
        r.setTenantId(u.getTenant().getId());
        r.setRestaurantName(u.getTenant().getRestaurantName());
        r.setActive(u.getActive());
        r.setCreatedAt(u.getCreatedAt());
        return r;
    }
}