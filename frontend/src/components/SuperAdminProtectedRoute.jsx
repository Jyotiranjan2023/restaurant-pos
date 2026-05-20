import { Navigate } from 'react-router-dom';
import { useSuperAdminAuth } from '../context/SuperAdminAuthContext';

export default function SuperAdminProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useSuperAdminAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/super-admin/login" replace />;
    }

    return children;
}