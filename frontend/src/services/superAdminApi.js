import axios from 'axios';

const superAdminApi = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: attach super admin token if present
superAdminApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('superAdminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: handle 401 (expired token) by redirecting to super admin login
superAdminApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Token expired or invalid — clear it and redirect
            const isOnLoginPage = window.location.pathname === '/super-admin/login';
            if (!isOnLoginPage) {
                localStorage.removeItem('superAdminToken');
                localStorage.removeItem('superAdminUser');
                window.location.href = '/super-admin/login';
            }
        }
        return Promise.reject(error);
    }
);

export default superAdminApi;