package com.restaurantpos.backend.superadmin.service;

import com.restaurantpos.backend.entity.Tenant;
import com.restaurantpos.backend.repository.TenantRepository;
import com.restaurantpos.backend.superadmin.dto.AuditLogResponse;
import com.restaurantpos.backend.superadmin.entity.SuperAdmin;
import com.restaurantpos.backend.superadmin.entity.SuperAdminAction;
import com.restaurantpos.backend.superadmin.repository.SuperAdminActionRepository;
import com.restaurantpos.backend.superadmin.repository.SuperAdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class SuperAdminAuditService {

    @Autowired
    private SuperAdminActionRepository actionRepository;

    @Autowired
    private SuperAdminRepository superAdminRepository;

    @Autowired
    private TenantRepository tenantRepository;

    /**
     * Get paginated audit log, newest first.
     * Enriches each row with super admin username and tenant name (joined in memory).
     */
    public Page<AuditLogResponse> getAuditLog(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SuperAdminAction> actionsPage = actionRepository.findAllOrdered(pageable);

        List<SuperAdminAction> actions = actionsPage.getContent();
        if (actions.isEmpty()) {
            return actionsPage.map(this::toResponse);
        }

        // Batch-load super admins and tenants to avoid N+1 queries
        List<Long> superAdminIds = actions.stream()
                .map(SuperAdminAction::getSuperAdminId)
                .distinct()
                .collect(Collectors.toList());

        List<Long> tenantIds = actions.stream()
                .map(SuperAdminAction::getTargetTenantId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, String> superAdminUsernames = new HashMap<>();
        superAdminRepository.findAllById(superAdminIds).forEach(sa ->
                superAdminUsernames.put(sa.getId(), sa.getUsername()));

        Map<Long, String> tenantNames = new HashMap<>();
        if (!tenantIds.isEmpty()) {
            tenantRepository.findAllById(tenantIds).forEach(t ->
                    tenantNames.put(t.getId(), t.getRestaurantName()));
        }

        return actionsPage.map(action -> toResponseWithLookup(
                action, superAdminUsernames, tenantNames));
    }

    private AuditLogResponse toResponse(SuperAdminAction action) {
        return toResponseWithLookup(action, new HashMap<>(), new HashMap<>());
    }

    private AuditLogResponse toResponseWithLookup(SuperAdminAction action,
                                                    Map<Long, String> superAdminUsernames,
                                                    Map<Long, String> tenantNames) {
        AuditLogResponse dto = new AuditLogResponse();
        dto.setId(action.getId());
        dto.setSuperAdminId(action.getSuperAdminId());
        dto.setSuperAdminUsername(superAdminUsernames.getOrDefault(
                action.getSuperAdminId(), "Unknown"));
        dto.setAction(action.getAction());
        dto.setTargetTenantId(action.getTargetTenantId());
        dto.setTargetTenantName(action.getTargetTenantId() != null
                ? tenantNames.getOrDefault(action.getTargetTenantId(), "Unknown")
                : null);
        dto.setTargetSubscriptionId(action.getTargetSubscriptionId());
        dto.setPreviousValue(action.getPreviousValue());
        dto.setNewValue(action.getNewValue());
        dto.setReason(action.getReason());
        dto.setCreatedAt(action.getCreatedAt());
        return dto;
    }
}