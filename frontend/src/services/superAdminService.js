import superAdminApi from './superAdminApi';

const superAdminService = {

    /**
     * Login as super admin.
     * Returns full response so caller can store token + user data.
     */
    login: async (username, password) => {
        const response = await superAdminApi.post('/api/super-admin/login', {
            username,
            password,
        });
        return response.data;
    },

    /**
     * List all tenants (paginated).
     */
    listTenants: async (page = 0, size = 20) => {
        const response = await superAdminApi.get('/api/super-admin/tenants', {
            params: { page, size },
        });
        return response.data;
    },

    /**
     * Get detail of one tenant.
     */
    getTenantDetail: async (tenantId) => {
        const response = await superAdminApi.get(`/api/super-admin/tenants/${tenantId}`);
        return response.data;
    },
/**
     * Get dashboard stats.
     */
    getStats: async () => {
        const response = await superAdminApi.get('/api/super-admin/stats');
        return response.data;
    },
    /**
     * Suspend a tenant.
     */
    suspendTenant: async (tenantId, reason) => {
        const response = await superAdminApi.post(
            `/api/super-admin/tenants/${tenantId}/suspend`,
            { reason }
        );
        return response.data;
    },

    /**
     * Reactivate a tenant.
     */
    reactivateTenant: async (tenantId, reason, extendDays = 30) => {
        const response = await superAdminApi.post(
            `/api/super-admin/tenants/${tenantId}/reactivate`,
            { reason, extendDays }
        );
        return response.data;
    },
    

    /**
     * Convert tenant to LIFETIME_FREE.
     */
    convertToLifetimeFree: async (tenantId, reason) => {
        const response = await superAdminApi.post(
            `/api/super-admin/tenants/${tenantId}/convert-lifetime`,
            { reason }
        );
        return response.data;
    },

    /**
     * Get all subscription plans.
     */
    getAllPlans: async () => {
        const response = await superAdminApi.get('/api/super-admin/plans');
        return response.data;
    },

    /**
     * Logout (frontend-only — clears local storage).
     */
    logout: () => {
        localStorage.removeItem('superAdminToken');
        localStorage.removeItem('superAdminUser');
    },
};

export default superAdminService;