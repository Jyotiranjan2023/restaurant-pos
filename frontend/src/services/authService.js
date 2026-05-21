import api from './api'

export const loginUser = async (restaurantEmail, username, password) => {
    const response = await api.post('/api/auth/login', {
        restaurantEmail,
        username,
        password
    });
    return response.data;
};
export const registerRestaurant = async (data) => {
    const response = await api.post('/api/auth/register-restaurant', data);
    return response.data;
};
export const forgotPassword = async (tenantId, username) => {
    const response = await api.post('/api/auth/forgot-password', {
        tenantId,
        username
    });
    return response.data;
};

export const resetPassword = async (tenantId, username, resetCode, newPassword) => {
    const response = await api.post('/api/auth/reset-password', {
        tenantId,
        username,
        resetCode,
        newPassword
    });
    return response.data;
};