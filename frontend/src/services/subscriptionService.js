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
};

export default subscriptionService;