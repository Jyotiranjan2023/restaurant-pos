package com.restaurantpos.backend.service;

import com.restaurantpos.backend.dto.request.BillSettingsRequest;
import com.restaurantpos.backend.dto.request.OrderSettingsRequest;
import com.restaurantpos.backend.dto.request.ProfileSettingsRequest;
import com.restaurantpos.backend.dto.request.TaxSettingsRequest;
import com.restaurantpos.backend.dto.response.SettingsResponse;
import com.restaurantpos.backend.entity.Tenant;
import com.restaurantpos.backend.exception.ResourceNotFoundException;
import com.restaurantpos.backend.repository.TenantRepository;
import com.restaurantpos.backend.security.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class SettingsService {

    private final TenantRepository tenantRepo;
    private final FileStorageService fileStorageService;

    public SettingsService(TenantRepository tenantRepo,
                           FileStorageService fileStorageService) {
        this.tenantRepo = tenantRepo;
        this.fileStorageService = fileStorageService;
    }

    public SettingsResponse getSettings() {
        Long tenantId = TenantContext.getCurrentTenantId();
        Tenant tenant = tenantRepo.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));
        return toResponse(tenant);
    }

    @Transactional
    public SettingsResponse updateProfile(ProfileSettingsRequest req) {
        Tenant tenant = getCurrentTenant();

        tenant.setRestaurantName(req.getRestaurantName());
        tenant.setDisplayName(req.getDisplayName());
        tenant.setAddress(req.getAddress());
        tenant.setCity(req.getCity());
        tenant.setState(req.getState());
        tenant.setPincode(req.getPincode());
        tenant.setPhone(req.getPhone());
        tenant.setEmail(req.getEmail());
        tenant.setWebsite(req.getWebsite());
        tenant.setGstNumber(req.getGstNumber());
        tenant.setFssaiNumber(req.getFssaiNumber());
        if (req.getCurrencySymbol() != null) tenant.setCurrencySymbol(req.getCurrencySymbol());
        if (req.getTimezone() != null) tenant.setTimezone(req.getTimezone());

        return toResponse(tenantRepo.save(tenant));
    }

    @Transactional
    public SettingsResponse updateTax(TaxSettingsRequest req) {
        Tenant tenant = getCurrentTenant();

        tenant.setDefaultGstPercent(req.getDefaultGstPercent());
        tenant.setCgstSplitPercent(req.getCgstSplitPercent());
        tenant.setServiceChargePercent(req.getServiceChargePercent());
        if (req.getServiceChargeAppliesDineIn() != null)
            tenant.setServiceChargeAppliesDineIn(req.getServiceChargeAppliesDineIn());
        if (req.getServiceChargeAppliesTakeaway() != null)
            tenant.setServiceChargeAppliesTakeaway(req.getServiceChargeAppliesTakeaway());
        if (req.getServiceChargeAppliesDelivery() != null)
            tenant.setServiceChargeAppliesDelivery(req.getServiceChargeAppliesDelivery());

        return toResponse(tenantRepo.save(tenant));
    }

    @Transactional
    public SettingsResponse updateBill(BillSettingsRequest req) {
        Tenant tenant = getCurrentTenant();

        if (req.getPrintTemplate() != null) tenant.setPrintTemplate(req.getPrintTemplate());
        tenant.setBillHeader(req.getBillHeader());
        tenant.setBillFooter(req.getBillFooter());
        if (req.getShowGstBreakdown() != null) tenant.setShowGstBreakdown(req.getShowGstBreakdown());
        if (req.getShowTableOnBill() != null) tenant.setShowTableOnBill(req.getShowTableOnBill());
        if (req.getBillNumberPrefix() != null) tenant.setBillNumberPrefix(req.getBillNumberPrefix());

        return toResponse(tenantRepo.save(tenant));
    }

    @Transactional
    public SettingsResponse updateOrder(OrderSettingsRequest req) {
        Tenant tenant = getCurrentTenant();

        if (req.getAutoConfirmOrders() != null) tenant.setAutoConfirmOrders(req.getAutoConfirmOrders());
        if (req.getAllowCustomItems() != null) tenant.setAllowCustomItems(req.getAllowCustomItems());
        if (req.getDefaultOrderType() != null) tenant.setDefaultOrderType(req.getDefaultOrderType());

        return toResponse(tenantRepo.save(tenant));
    }

    @Transactional
    public SettingsResponse uploadLogo(MultipartFile file) {
        Tenant tenant = getCurrentTenant();

        // Delete old logo if exists
        if (tenant.getLogoUrl() != null && !tenant.getLogoUrl().isBlank()) {
            fileStorageService.deleteLogo(tenant.getLogoUrl());
        }

        String url = fileStorageService.saveLogo(file);
        tenant.setLogoUrl(url);
        return toResponse(tenantRepo.save(tenant));
    }

    @Transactional
    public SettingsResponse removeLogo() {
        Tenant tenant = getCurrentTenant();

        if (tenant.getLogoUrl() != null && !tenant.getLogoUrl().isBlank()) {
            fileStorageService.deleteLogo(tenant.getLogoUrl());
        }
        tenant.setLogoUrl(null);
        return toResponse(tenantRepo.save(tenant));
    }

    // ========== Helpers ==========

    private Tenant getCurrentTenant() {
        Long tenantId = TenantContext.getCurrentTenantId();
        return tenantRepo.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));
    }

    private SettingsResponse toResponse(Tenant t) {
        SettingsResponse r = new SettingsResponse();

        // Profile
        r.setRestaurantName(t.getRestaurantName());
        r.setDisplayName(t.getDisplayName());
        r.setLogoUrl(t.getLogoUrl());
        r.setAddress(t.getAddress());
        r.setCity(t.getCity());
        r.setState(t.getState());
        r.setPincode(t.getPincode());
        r.setPhone(t.getPhone());
        r.setEmail(t.getEmail());
        r.setWebsite(t.getWebsite());
        r.setGstNumber(t.getGstNumber());
        r.setFssaiNumber(t.getFssaiNumber());
        r.setCurrencySymbol(t.getCurrencySymbol());
        r.setTimezone(t.getTimezone());

        // Tax
        r.setDefaultGstPercent(t.getDefaultGstPercent());
        r.setCgstSplitPercent(t.getCgstSplitPercent());
        r.setServiceChargePercent(t.getServiceChargePercent());
        r.setServiceChargeAppliesDineIn(t.getServiceChargeAppliesDineIn());
        r.setServiceChargeAppliesTakeaway(t.getServiceChargeAppliesTakeaway());
        r.setServiceChargeAppliesDelivery(t.getServiceChargeAppliesDelivery());

        // Bill
        r.setPrintTemplate(t.getPrintTemplate());
        r.setBillHeader(t.getBillHeader());
        r.setBillFooter(t.getBillFooter());
        r.setShowGstBreakdown(t.getShowGstBreakdown());
        r.setShowTableOnBill(t.getShowTableOnBill());
        r.setBillNumberPrefix(t.getBillNumberPrefix());

        // Order
        r.setAutoConfirmOrders(t.getAutoConfirmOrders());
        r.setAllowCustomItems(t.getAllowCustomItems());
        r.setDefaultOrderType(t.getDefaultOrderType());

        return r;
    }
}