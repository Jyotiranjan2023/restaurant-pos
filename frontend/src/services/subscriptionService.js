import api from './api';

/**
 * Subscription API service.
 * Communicates with /api/subscriptions/* endpoints.
 */
const subscriptionService = {
    
    /**
     * Get current subscription for logged-in tenant.
     * Returns subscription details with computed fields.
     */
    getMySubscription: async () => {
        const response = await api.get('/api/subscriptions/my');
        return response.data;
    },

    /**
     * Get all visible plans (for upgrade page).
     * Public endpoint — no auth needed.
     */
    getVisiblePlans: async () => {
        const response = await api.get('/api/subscription-plans/public');
        return response.data;
    },

    /**
     * Get a specific plan by code.
     */
    getPlanByCode: async (code) => {
        const response = await api.get(`/api/subscription-plans/code/${code}`);
        return response.data;
    },
    /**
     * Create checkout for upgrading to a plan.
     * Returns the Razorpay short URL to redirect customer to.
     */
    createCheckout: async (planCode) => {
        const response = await api.post('/api/subscriptions/checkout', { planCode });
        return response.data;
    },

    /**
     * Create a one-time Razorpay Order (manual payment).
     * Returns orderId, amount, currency, keyId — needed to open Razorpay widget.
     */
    createOrder: async (planCode) => {
        const response = await api.post('/api/payments/create-order', { planCode });
        return response.data;
    },

    /**
     * Verify Razorpay payment after widget success.
     * On success, backend activates the subscription for 30 days.
     */
    verifyPayment: async ({ planCode, razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
        const response = await api.post('/api/payments/verify', {
            planCode,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
        });
        return response.data;
    },
    cancelSubscription: async (reason) => {
        const response = await api.post('/api/subscriptions/cancel', { reason });
        return response.data;
    },
};

export default subscriptionService;