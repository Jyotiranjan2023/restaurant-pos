package com.restaurantpos.backend.service;

import com.restaurantpos.backend.dto.request.DenyResetRequest;
import com.restaurantpos.backend.dto.request.ForgotPasswordRequest;
import com.restaurantpos.backend.dto.request.ResetPasswordWithCodeRequest;
import com.restaurantpos.backend.dto.response.PasswordResetResponse;
import com.restaurantpos.backend.entity.PasswordResetRequest;
import com.restaurantpos.backend.entity.Tenant;
import com.restaurantpos.backend.entity.User;
import com.restaurantpos.backend.enums.NotificationSeverity;
import com.restaurantpos.backend.enums.NotificationType;
import com.restaurantpos.backend.enums.ResetStatus;
import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.exception.ResourceNotFoundException;
import com.restaurantpos.backend.repository.PasswordResetRequestRepository;
import com.restaurantpos.backend.repository.TenantRepository;
import com.restaurantpos.backend.repository.UserRepository;
import com.restaurantpos.backend.security.TenantContext;
import com.restaurantpos.backend.security.UserPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PasswordResetService {

    private static final int CODE_LENGTH = 8;
    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    // Excluded: I, O, 0, 1 — confusing characters
    private static final int EXPIRY_MINUTES = 30;
    private static final int MAX_REQUESTS_PER_DAY = 3;
    private static final int MAX_FAILED_ATTEMPTS = 5;

    private final PasswordResetRequestRepository resetRepo;
    private final UserRepository userRepo;
    private final TenantRepository tenantRepo;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    private final SecureRandom random = new SecureRandom();

    public PasswordResetService(PasswordResetRequestRepository resetRepo,
                                UserRepository userRepo,
                                TenantRepository tenantRepo,
                                PasswordEncoder passwordEncoder,
                                NotificationService notificationService) {
        this.resetRepo = resetRepo;
        this.userRepo = userRepo;
        this.tenantRepo = tenantRepo;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    // ========== Public: User Requests Reset ==========

    @Transactional
    public void requestReset(ForgotPasswordRequest req, String requestIp) {
        // Find user
        User user = userRepo.findByUsernameAndTenantId(req.getUsername(), req.getTenantId())
                .orElseThrow(() -> new BadRequestException(
                        "If the username exists, a request has been created"));   // generic for security

        if (!Boolean.TRUE.equals(user.getActive()))
            throw new BadRequestException("Account is deactivated. Contact administrator.");

        // Rate limit: max 3 requests per day
        long recentCount = resetRepo.countByUserIdAndCreatedAtAfter(
                user.getId(), LocalDateTime.now().minusDays(1));
        if (recentCount >= MAX_REQUESTS_PER_DAY)
            throw new BadRequestException(
                    "Too many reset requests. Please contact your administrator directly.");

        Tenant tenant = user.getTenant();

        PasswordResetRequest reset = new PasswordResetRequest();
        reset.setUser(user);
        reset.setStatus(ResetStatus.PENDING);
        reset.setTenant(tenant);
        reset.setRequestIp(requestIp);
        resetRepo.save(reset);

        // Notify admin
        notificationService.notifyForTenant(
                tenant.getId(),
                NotificationType.GENERAL,
                NotificationSeverity.WARNING,
                "Password Reset Requested",
                user.getFullName() + " (" + user.getUsername() + ") requested a password reset. Review in admin panel.",
                "/admin/password-resets"
        );
    }

    // ========== Admin: Approve Request ==========

    @Transactional
    public PasswordResetResponse approve(Long requestId) {
        UserPrincipal principal = TenantContext.getCurrentUser();
        Long tenantId = principal.getTenantId();

        PasswordResetRequest reset = resetRepo.findByIdAndTenantId(requestId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Reset request not found"));

        if (reset.getStatus() != ResetStatus.PENDING)
            throw new BadRequestException(
                    "Cannot approve request in status: " + reset.getStatus());

        // Generate code
        String plainCode = generateResetCode();
        reset.setResetCodeHash(passwordEncoder.encode(plainCode));
        reset.setStatus(ResetStatus.APPROVED);
        reset.setExpiresAt(LocalDateTime.now().plusMinutes(EXPIRY_MINUTES));
        reset.setApprovedAt(LocalDateTime.now());

        User approver = userRepo.findById(principal.getUserId()).orElse(null);
        reset.setApprovedBy(approver);

        reset = resetRepo.save(reset);

        // Build response with the plain code (admin must communicate this to user)
        PasswordResetResponse response = toResponse(reset);
        response.setResetCode(plainCode);   // ONLY shown on approval response — never stored plain
        return response;
    }

    // ========== Admin: Deny Request ==========

    @Transactional
    public PasswordResetResponse deny(Long requestId, DenyResetRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        PasswordResetRequest reset = resetRepo.findByIdAndTenantId(requestId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Reset request not found"));

        if (reset.getStatus() != ResetStatus.PENDING)
            throw new BadRequestException(
                    "Cannot deny request in status: " + reset.getStatus());

        reset.setStatus(ResetStatus.DENIED);
        reset.setDeniedReason(req.getReason());

        return toResponse(resetRepo.save(reset));
    }

    // ========== Admin: List Requests ==========

    public List<PasswordResetResponse> findAll(ResetStatus filterStatus) {
        Long tenantId = TenantContext.getCurrentTenantId();

        List<PasswordResetRequest> requests = filterStatus != null
                ? resetRepo.findByTenantIdAndStatusOrderByCreatedAtDesc(tenantId, filterStatus)
                : resetRepo.findByTenantIdOrderByCreatedAtDesc(tenantId);

        return requests.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ========== Public: Submit Code & New Password ==========

    @Transactional
    public void resetPassword(ResetPasswordWithCodeRequest req) {
        User user = userRepo.findByUsernameAndTenantId(req.getUsername(), req.getTenantId())
                .orElseThrow(() -> new BadRequestException("Invalid request"));

        // Find latest APPROVED request for this user
        PasswordResetRequest reset = resetRepo
                .findFirstByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), ResetStatus.APPROVED)
                .orElseThrow(() -> new BadRequestException(
                        "No approved password reset found. Please request a new one."));

        // Check expiry
        if (reset.getExpiresAt() != null && LocalDateTime.now().isAfter(reset.getExpiresAt())) {
            reset.setStatus(ResetStatus.EXPIRED);
            resetRepo.save(reset);
            throw new BadRequestException("Reset code has expired. Please request a new one.");
        }

        // Check failed attempts
        if (reset.getFailedAttempts() >= MAX_FAILED_ATTEMPTS) {
            reset.setStatus(ResetStatus.EXPIRED);
            resetRepo.save(reset);
            throw new BadRequestException("Too many failed attempts. Please request a new reset.");
        }

        // Verify code
        if (!passwordEncoder.matches(req.getResetCode(), reset.getResetCodeHash())) {
            reset.setFailedAttempts(reset.getFailedAttempts() + 1);
            resetRepo.save(reset);
            throw new BadRequestException(
                    "Invalid reset code. Attempts remaining: " +
                    (MAX_FAILED_ATTEMPTS - reset.getFailedAttempts()));
        }

        // Code valid — update password
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepo.save(user);

        // Burn the request
        reset.setStatus(ResetStatus.USED);
        reset.setUsedAt(LocalDateTime.now());
        resetRepo.save(reset);

        // Notify admin of successful reset
        notificationService.notifyForTenant(
                user.getTenant().getId(),
                NotificationType.GENERAL,
                NotificationSeverity.INFO,
                "Password Reset Completed",
                user.getFullName() + " (" + user.getUsername() + ") successfully reset their password.",
                null
        );
    }

    // ========== Helpers ==========

    private String generateResetCode() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(CODE_CHARS.charAt(random.nextInt(CODE_CHARS.length())));
        }
        return sb.toString();
    }

    private PasswordResetResponse toResponse(PasswordResetRequest r) {
        PasswordResetResponse resp = new PasswordResetResponse();
        resp.setId(r.getId());
        resp.setUsername(r.getUser().getUsername());
        resp.setFullName(r.getUser().getFullName());
        resp.setStatus(r.getStatus());
        resp.setFailedAttempts(r.getFailedAttempts());
        resp.setExpiresAt(r.getExpiresAt());
        resp.setApprovedAt(r.getApprovedAt());
        resp.setApprovedByUsername(r.getApprovedBy() != null
                ? r.getApprovedBy().getUsername() : null);
        resp.setUsedAt(r.getUsedAt());
        resp.setDeniedReason(r.getDeniedReason());
        resp.setRequestIp(r.getRequestIp());
        resp.setCreatedAt(r.getCreatedAt());
        // Note: resetCode is NEVER set here — only on approval response
        return resp;
    }
}