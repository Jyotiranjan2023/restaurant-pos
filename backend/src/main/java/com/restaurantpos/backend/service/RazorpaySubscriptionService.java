package com.restaurantpos.backend.service;

import com.razorpay.Customer;
import com.razorpay.RazorpayClient;
import com.razorpay.Subscription;
import com.restaurantpos.backend.dto.response.CheckoutResponse;
import com.restaurantpos.backend.entity.SubscriptionPlan;
import com.restaurantpos.backend.entity.Tenant;
import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.exception.ResourceNotFoundException;
import com.restaurantpos.backend.repository.SubscriptionPlanRepository;
import com.restaurantpos.backend.repository.SubscriptionRepository;
import com.restaurantpos.backend.repository.TenantRepository;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class RazorpaySubscriptionService {

    private static final Logger log = LoggerFactory.getLogger(RazorpaySubscriptionService.class);

    @Autowired
    private RazorpayClient razorpayClient;

    @Autowired
    private SubscriptionPlanRepository planRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    /**
     * Create a Razorpay subscription for the given tenant and plan.
     * Returns the payment URL.
     *
     * If tenant doesn't have a Razorpay customer yet, creates one.
     */
    @Transactional
    public CheckoutResponse createCheckout(Long tenantId, String planCode) throws Exception {

        // 1. Find tenant
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found: " + tenantId));

        // 2. Lifetime free tenants don't need to pay
        if (Boolean.TRUE.equals(tenant.getIsLifetimeFree())) {
            throw new BadRequestException("Lifetime free tenants cannot create paid subscriptions");
        }

        // 3. Find plan
        SubscriptionPlan plan = planRepository.findByCode(planCode)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found: " + planCode));

        if (plan.getRazorpayPlanId() == null || plan.getRazorpayPlanId().isEmpty()) {
            throw new BadRequestException("Plan " + planCode + " is not yet synced with Razorpay");
        }

        // 4. Get or create Razorpay customer
        String razorpayCustomerId = getOrCreateRazorpayCustomer(tenant);

        // 5. Create Razorpay subscription
        JSONObject subRequest = new JSONObject();
        subRequest.put("plan_id", plan.getRazorpayPlanId());
        subRequest.put("customer_notify", 1);                  // send email to customer
        subRequest.put("total_count", 12);                     // 12 monthly billing cycles
        subRequest.put("customer_id", razorpayCustomerId);

        JSONObject notes = new JSONObject();
        notes.put("tenant_id", tenant.getId().toString());
        notes.put("tenant_name", tenant.getRestaurantName());
        notes.put("plan_code", plan.getCode());
        subRequest.put("notes", notes);

        Subscription razorpaySub = razorpayClient.subscriptions.create(subRequest);

        String razorpaySubId = razorpaySub.get("id");
        String shortUrl = razorpaySub.get("short_url");

        log.info("Created Razorpay subscription {} for tenant {} (plan {})",
                razorpaySubId, tenant.getId(), plan.getCode());

        // 6. Save IDs on tenant's local subscription
        // We don't change status yet — payment isn't confirmed
        Optional<com.restaurantpos.backend.entity.Subscription> localSubOpt =
                subscriptionRepository.findByTenantId(tenantId);

        if (localSubOpt.isPresent()) {
            com.restaurantpos.backend.entity.Subscription localSub = localSubOpt.get();
            localSub.setRazorpaySubscriptionId(razorpaySubId);
            localSub.setRazorpayCustomerId(razorpayCustomerId);
            subscriptionRepository.save(localSub);
        }

        // 7. Build response
        CheckoutResponse resp = new CheckoutResponse();
        resp.setRazorpaySubscriptionId(razorpaySubId);
        resp.setRazorpayCustomerId(razorpayCustomerId);
        resp.setShortUrl(shortUrl);
        resp.setPlanCode(plan.getCode());
        resp.setPlanName(plan.getName());

        return resp;
    }

    /**
     * Get or create a Razorpay customer for this tenant.
     * Reuses if already exists in local subscription record.
     */
    private String getOrCreateRazorpayCustomer(Tenant tenant) throws Exception {

        // Check if we already have one stored
        Optional<com.restaurantpos.backend.entity.Subscription> subOpt =
                subscriptionRepository.findByTenantId(tenant.getId());

        if (subOpt.isPresent()) {
            String existingId = subOpt.get().getRazorpayCustomerId();
            if (existingId != null && !existingId.isEmpty()) {
                log.info("Reusing existing Razorpay customer {} for tenant {}",
                        existingId, tenant.getId());
                return existingId;
            }
        }

        // Create new Razorpay customer
        JSONObject custRequest = new JSONObject();
        custRequest.put("name", tenant.getRestaurantName());
        custRequest.put("email", tenant.getEmail());
        if (tenant.getPhone() != null && !tenant.getPhone().isEmpty()) {
            custRequest.put("contact", tenant.getPhone());
        }
        custRequest.put("fail_existing", "0");   // if customer with this email exists, return it instead of failing

        JSONObject notes = new JSONObject();
        notes.put("tenant_id", tenant.getId().toString());
        custRequest.put("notes", notes);

        Customer customer = razorpayClient.customers.create(custRequest);
        String customerId = customer.get("id");

        log.info("Created Razorpay customer {} for tenant {}", customerId, tenant.getId());

        return customerId;
    }
}