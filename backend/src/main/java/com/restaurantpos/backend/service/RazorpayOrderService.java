package com.restaurantpos.backend.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.restaurantpos.backend.dto.response.CreateOrderResponse;
import com.restaurantpos.backend.entity.SubscriptionPlan;
import com.restaurantpos.backend.entity.Tenant;
import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.exception.ResourceNotFoundException;
import com.restaurantpos.backend.repository.SubscriptionPlanRepository;
import com.restaurantpos.backend.repository.TenantRepository;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class RazorpayOrderService {

    private static final Logger log = LoggerFactory.getLogger(RazorpayOrderService.class);

    @Autowired
    private RazorpayClient razorpayClient;

    @Autowired
    private SubscriptionPlanRepository planRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SubscriptionService subscriptionService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    /**
     * Create a one-time Razorpay Order for a plan upgrade.
     * Returns orderId, amount, currency, and Razorpay key (needed by frontend widget).
     */
    public CreateOrderResponse createOrder(Long tenantId, String planCode) throws Exception {

        // 1. Find tenant
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found: " + tenantId));

        // 2. Lifetime free check
        if (Boolean.TRUE.equals(tenant.getIsLifetimeFree())) {
            throw new BadRequestException("Lifetime free tenants cannot purchase plans");
        }

        // 3. Find plan
        SubscriptionPlan plan = planRepository.findByCode(planCode)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found: " + planCode));

        // 4. Convert price to paise
        BigDecimal priceInr = plan.getPriceInr();
        int amountInPaise = priceInr.multiply(BigDecimal.valueOf(100)).intValueExact();

        // 5. Build Razorpay order request
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "rcpt_" + tenantId + "_" + System.currentTimeMillis());

        JSONObject notes = new JSONObject();
        notes.put("tenant_id", tenantId.toString());
        notes.put("plan_code", planCode);
        notes.put("tenant_name", tenant.getRestaurantName());
        orderRequest.put("notes", notes);

        // 6. Create order in Razorpay
        Order order = razorpayClient.orders.create(orderRequest);
        String orderId = order.get("id");

        log.info("Created Razorpay Order {} for tenant {} plan {} amount {}",
                orderId, tenantId, planCode, amountInPaise);

        // 7. Build response
        CreateOrderResponse resp = new CreateOrderResponse();
        resp.setOrderId(orderId);
        resp.setAmount(amountInPaise);
        resp.setCurrency("INR");
        resp.setKeyId(razorpayKeyId);
        resp.setPlanCode(planCode);
        resp.setPlanName(plan.getName());
        resp.setTenantName(tenant.getRestaurantName());
        resp.setTenantEmail(tenant.getEmail());

        return resp;
    }

    /**
     * Verify payment signature from Razorpay.
     * If valid, activate the subscription on the tenant for 30 days.
     */
    public void verifyAndActivate(Long tenantId, String planCode,
                                   String razorpayOrderId,
                                   String razorpayPaymentId,
                                   String razorpaySignature) throws Exception {

        // 1. Build signature payload as Razorpay specifies
        JSONObject payload = new JSONObject();
        payload.put("razorpay_order_id", razorpayOrderId);
        payload.put("razorpay_payment_id", razorpayPaymentId);
        payload.put("razorpay_signature", razorpaySignature);

        // 2. Verify signature using Razorpay's Utils
        boolean isValid = Utils.verifyPaymentSignature(payload, razorpayKeySecret);

        if (!isValid) {
            log.warn("Invalid signature for tenant {} order {}", tenantId, razorpayOrderId);
            throw new BadRequestException("Payment signature verification failed");
        }

        log.info("Payment verified for tenant {} plan {} order {}",
                tenantId, planCode, razorpayOrderId);

        // 3. Activate subscription for 30 days (calls existing service)
        subscriptionService.activateAfterManualPayment(tenantId, planCode, razorpayPaymentId);
    }
}