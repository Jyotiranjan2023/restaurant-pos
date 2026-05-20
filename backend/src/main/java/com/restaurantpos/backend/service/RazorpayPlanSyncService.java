package com.restaurantpos.backend.service;

import com.razorpay.Plan;
import com.razorpay.RazorpayClient;
import com.restaurantpos.backend.entity.SubscriptionPlan;
import com.restaurantpos.backend.repository.SubscriptionPlanRepository;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class RazorpayPlanSyncService {

    private static final Logger log = LoggerFactory.getLogger(RazorpayPlanSyncService.class);

    @Autowired
    private RazorpayClient razorpayClient;

    @Autowired
    private SubscriptionPlanRepository planRepository;

    /**
     * Sync all local plans to Razorpay.
     * For each plan without a razorpayPlanId, create it in Razorpay and save the ID.
     * Plans with existing IDs are skipped.
     *
     * Returns a list of status messages for the caller.
     */
    @Transactional
    public List<String> syncAllPlans() {
        List<String> results = new ArrayList<>();
        List<SubscriptionPlan> plans = planRepository.findAll();

        for (SubscriptionPlan plan : plans) {
            try {
                if (plan.getRazorpayPlanId() != null && !plan.getRazorpayPlanId().isEmpty()) {
                    results.add("SKIP: " + plan.getCode() + " already has Razorpay ID: " + plan.getRazorpayPlanId());
                    continue;
                }

                Plan razorpayPlan = createInRazorpay(plan);
                String razorpayId = razorpayPlan.get("id");

                plan.setRazorpayPlanId(razorpayId);
                planRepository.save(plan);

                results.add("CREATED: " + plan.getCode() + " → " + razorpayId);
                log.info("Synced plan {} to Razorpay as {}", plan.getCode(), razorpayId);

            } catch (Exception e) {
                log.error("Failed to sync plan {}", plan.getCode(), e);
                
                String detailedError = e.getMessage();
                Throwable cause = e.getCause();
                while (cause != null) {
                    detailedError += " | Caused by: " + cause.getMessage();
                    cause = cause.getCause();
                }
                
                results.add("FAILED: " + plan.getCode() + " — " + detailedError);
            }
        }

        return results;
    }

    /**
     * Create a single plan in Razorpay.
     * Razorpay API: https://razorpay.com/docs/api/payments/subscriptions/plans/
     *
     * Price must be in paise (₹ × 100). Period is "monthly" with interval 1.
     */
    private Plan createInRazorpay(SubscriptionPlan plan) throws Exception {
        // Convert INR rupees to paise (smallest unit)
        BigDecimal priceInr = plan.getPriceInr();
        int amountInPaise = priceInr.multiply(BigDecimal.valueOf(100)).intValueExact();

        JSONObject itemDetails = new JSONObject();
        itemDetails.put("name", "Restaurant POS - " + plan.getName() + " Plan");
        itemDetails.put("amount", amountInPaise);
        itemDetails.put("currency", "INR");
        itemDetails.put("description", plan.getDescription());

        JSONObject request = new JSONObject();
        request.put("period", "monthly");
        request.put("interval", 1);
        request.put("item", itemDetails);

        // Custom notes — useful for support/audit
        JSONObject notes = new JSONObject();
        notes.put("plan_code", plan.getCode());
        notes.put("plan_id_local", plan.getId().toString());
        request.put("notes", notes);

        return razorpayClient.plans.create(request);
    }
}