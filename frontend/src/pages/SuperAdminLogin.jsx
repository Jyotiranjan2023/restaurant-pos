import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdminAuth } from '../context/SuperAdminAuthContext';

export default function SuperAdminLogin() {
    const navigate = useNavigate();
    const { login, isAuthenticated, loading: authLoading } = useSuperAdminAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // If already logged in, redirect to dashboard
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate('/super-admin/dashboard', { replace: true });
        }
    }, [authLoading, isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!username.trim() || !password) {
            setError('Username and password are required');
            return;
        }

        setSubmitting(true);
        try {
            const result = await login(username.trim(), password);
            if (result.success) {
                navigate('/super-admin/dashboard', { replace: true });
            } else {
                setError(result.message || 'Login failed');
            }
        } catch (err) {
            // Backend returned an error response
            const message = err.response?.data?.message || 'Login failed. Please try again.';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 sm:p-8">

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-full mb-3">
                        <span className="text-2xl">🔐</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Super Admin</h1>
                    <p className="text-sm text-gray-500 mt-1">Restricted area — authorized personnel only</p>
                </div>

                {/* Error banner */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 text-sm text-red-800">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={submitting}
                            autoComplete="username"
                            autoFocus
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-gray-100"
                        />
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={submitting}
                                autoComplete="current-password"
                                className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-gray-100"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Footer note */}
                <p className="text-xs text-center text-gray-400 mt-6">
                    All actions on this dashboard are logged for audit purposes.
                </p>
            </div>
        </div>
    );
}