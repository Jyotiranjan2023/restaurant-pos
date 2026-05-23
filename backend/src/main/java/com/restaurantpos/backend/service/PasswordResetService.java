package com.restaurantpos.backend.service;

import com.restaurantpos.backend.entity.PasswordReset;
import com.restaurantpos.backend.entity.User;
import com.restaurantpos.backend.enums.Role;
import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.repository.PasswordResetRepository;
import com.restaurantpos.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final int EXPIRY_MINUTES = 15;

    private final PasswordResetRepository resetRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public PasswordResetService(
            PasswordResetRepository resetRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {
        this.resetRepository = resetRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    /**
     * Step 1: Admin requests password reset by email.
     * Generates 6-digit code, emails it to the admin.
     * Always returns success — never reveals if email exists (security).
     */
    @Transactional
    public void requestReset(String email) {
        // Find ADMIN user by email
    	Optional<User> userOpt = userRepository.findByEmailAndRole(email, Role.ADMIN);
        if (userOpt.isEmpty()) {
            // Security: don't reveal email doesn't exist
            log.info("Password reset requested for unknown email: {}", email);
            return;
        }

        User user = userOpt.get();

        // Delete all previous reset codes for this user
        resetRepository.deleteAllByUserId(user.getId());

        // Generate 6-digit code
        String plainCode = String.format("%06d", new Random().nextInt(999999));

        // Store hashed code
        PasswordReset reset = new PasswordReset();
        reset.setUserId(user.getId());
        reset.setCodeHash(passwordEncoder.encode(plainCode));
        reset.setExpiresAt(LocalDateTime.now().plusMinutes(EXPIRY_MINUTES));
        reset.setUsed(false);
        resetRepository.save(reset);

        // Send email
        emailService.sendPasswordResetEmail(
                user.getEmail(),
                user.getFullName() != null ? user.getFullName() : user.getUsername(),
                plainCode
        );

        log.info("Password reset code sent to admin user {} ({})", user.getUsername(), email);
    }

    /**
     * Step 2: Admin submits email + 6-digit code + new password.
     */
    @Transactional
    public void resetPassword(String email, String code, String newPassword) {

        // Find ADMIN user by email
    	User user = userRepository.findByEmailAndRole(email, Role.ADMIN)
    	        .orElseThrow(() -> new BadRequestException("Invalid request."));

        // Find latest unused reset
        PasswordReset reset = resetRepository
                .findFirstByUserIdAndUsedFalseOrderByCreatedAtDesc(user.getId())
                .orElseThrow(() -> new BadRequestException(
                        "No reset code found. Please request a new one."));

        // Check expiry
        if (LocalDateTime.now().isAfter(reset.getExpiresAt())) {
            reset.setUsed(true);
            resetRepository.save(reset);
            throw new BadRequestException("Reset code has expired. Please request a new one.");
        }

        // Verify code
        if (!passwordEncoder.matches(code, reset.getCodeHash())) {
            throw new BadRequestException("Invalid reset code. Please check your email.");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark code as used
        reset.setUsed(true);
        resetRepository.save(reset);

        log.info("Password reset successful for admin user {} ({})", user.getUsername(), email);
    }
}