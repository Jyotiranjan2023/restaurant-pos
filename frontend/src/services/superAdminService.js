import superAdminApi from './superAdminApi';

const superAdminService = {
    /**
     * Login as super admin.
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
    listTenants: async (page = 0, size = 20, search = null, status = null) => {
        const params = { page, size };
        if (search && search.trim()) params.search = search.trim();
        if (status) params.status = status;
        const response = await superAdminApi.get('/api/super-admin/tenants', { params });
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

    getAuditLog: async (page = 0, size = 20) => {
        const response = await superAdminApi.get('/api/super-admin/audit-log', {
            params: { page, size },
        });
        return response.data;
    },

    listSuperAdmins: async () => {
        const response = await superAdminApi.get('/api/super-admin/super-admins');
        return response.data;
    },

    createSuperAdmin: async (data) => {
        const response = await superAdminApi.post('/api/super-admin/super-admins', data);
        return response.data;
    },

    // ── Settings ────────────────────────────────────────────────────

    /**
     * GET /api/super-admin/settings
     * Fetch all current platform settings.
     */
    getSettings: async () => {
        const response = await superAdminApi.get('/api/super-admin/settings');
        return response.data;
    },

    /**
     * PUT /api/super-admin/settings
     * Save updated settings to backend.
     */
    updateSettings: async (data) => {
        const response = await superAdminApi.put('/api/super-admin/settings', data);
        return response.data;
    },

    /**
     * POST /api/super-admin/settings/change-password
     */
    changePassword: async (currentPassword, newPassword) => {
        const response = await superAdminApi.post('/api/super-admin/settings/change-password', {
            currentPassword,
            newPassword,
        });
        return response.data;
    },

    /**
     * POST /api/super-admin/settings/revoke-sessions
     */
    revokeAllSessions: async () => {
        const response = await superAdminApi.post('/api/super-admin/settings/revoke-sessions');
        return response.data;
    },

    // ── Revenue ─────────────────────────────────────────────────────

    /**
     * GET /api/super-admin/revenue
     * Fetch full revenue dashboard data.
     */
    getRevenue: async () => {
        const response = await superAdminApi.get('/api/super-admin/revenue');
        return response.data;
    },
};

export default superAdminService;