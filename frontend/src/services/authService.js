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