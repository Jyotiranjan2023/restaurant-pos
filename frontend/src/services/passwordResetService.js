import api from './api';

const passwordResetService = {
  // Admin: list all reset requests
  list: async (status) => {
    const url = status 
      ? `/api/admin/password-resets?status=${status}` 
      : '/api/admin/password-resets';
    const response = await api.get(url);
    return response.data;
  },

  // Admin: approve a request
  approve: async (requestId) => {
    const response = await api.post(`/api/admin/password-resets/${requestId}/approve`);
    return response.data;
  },

  // Admin: deny a request
  deny: async (requestId, reason) => {
    const response = await api.post(
      `/api/admin/password-resets/${requestId}/deny`, 
      { reason }
    );
    return response.data;
  },
};

export default passwordResetService;