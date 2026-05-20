package com.restaurantpos.backend.dto.response;

public class CheckoutResponse {

    private String razorpaySubscriptionId;
    private String razorpayCustomerId;
    private String shortUrl;        // The payment URL to redirect customer to
    private String planCode;
    private String planName;

    public CheckoutResponse() {}

    public String getRazorpaySubscriptionId() { return razorpaySubscriptionId; }
    public void setRazorpaySubscriptionId(String razorpaySubscriptionId) { this.razorpaySubscriptionId = razorpaySubscriptionId; }

    public String getRazorpayCustomerId() { return razorpayCustomerId; }
    public void setRazorpayCustomerId(String razorpayCustomerId) { this.razorpayCustomerId = razorpayCustomerId; }

    public String getShortUrl() { return shortUrl; }
    public void setShortUrl(String shortUrl) { this.shortUrl = shortUrl; }

    public String getPlanCode() { return planCode; }
    public void setPlanCode(String planCode) { this.planCode = planCode; }

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }
}