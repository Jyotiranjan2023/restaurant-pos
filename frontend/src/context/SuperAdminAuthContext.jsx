import { createContext, useContext, useState, useEffect } from 'react';
import superAdminService from '../services/superAdminService';

const SuperAdminAuthContext = createContext(null);

export function SuperAdminAuthProvider({ children }) {
    const [superAdmin, setSuperAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    // On app load, check if super admin token exists in localStorage
    useEffect(() => {
        const token = localStorage.getItem('superAdminToken');
        const userJson = localStorage.getItem('superAdminUser');

        if (token && userJson) {
            try {
                setSuperAdmin(JSON.parse(userJson));
            } catch (e) {
                // Corrupted data — clear it
                localStorage.removeItem('superAdminToken');
                localStorage.removeItem('superAdminUser');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const response = await superAdminService.login(username, password);
        if (response.success) {
            const { token, ...userData } = response.data;
            localStorage.setItem('superAdminToken', token);
            localStorage.setItem('superAdminUser', JSON.stringify(userData));
            setSuperAdmin(userData);
            return { success: true };
        }
        return { success: false, message: response.message || 'Login failed' };
    };

    const logout = () => {
        superAdminService.logout();
        setSuperAdmin(null);
    };

    const isAuthenticated = !!superAdmin;

    return (
        <SuperAdminAuthContext.Provider value={{
            superAdmin,
            isAuthenticated,
            loading,
            login,
            logout,
        }}>
            {children}
        </SuperAdminAuthContext.Provider>
    );
}

export function useSuperAdminAuth() {
    const context = useContext(SuperAdminAuthContext);
    if (!context) {
        throw new Error('useSuperAdminAuth must be used within SuperAdminAuthProvider');
    }
    return context;
}