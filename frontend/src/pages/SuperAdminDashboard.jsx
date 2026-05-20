import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import superAdminService from '../services/superAdminService';
import { useSuperAdminAuth } from '../context/SuperAdminAuthContext';

export default function SuperAdminDashboard() {
    const { superAdmin } = useSuperAdminAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await superAdminService.getStats();
                setStats(res.data);
            } catch (err) {
                setError('Failed to load stats');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">

            {/* Welcome header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                    Welcome back, {superAdmin?.fullName?.split(' ')[0] || 'Admin'}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Here's what's happening with your tenants.
                </p>
            </div>

            {/* Error banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-6 text-sm text-red-800">
                    {error}
                </div>
            )}

            {/* Stats grid */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8 animate-pulse">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 h-24"></div>
                    ))}
                </div>
            ) : stats ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
                    <StatCard label="Total Tenants" value={stats.totalTenants} color="slate" />
                    <StatCard label="Active" value={stats.activeSubscriptions} color="green" />
                    <StatCard label="Trial" value={stats.trialSubscriptions} color="orange" />
                    <StatCard label="Grace Period" value={stats.gracePeriodSubscriptions} color="red" />
                    <StatCard label="Suspended" value={stats.suspendedSubscriptions} color="gray" />
                    <StatCard label="New (7d)" value={stats.newTenantsLast7Days} color="blue" />
                </div>
            ) : null}

            {/* Quick actions */}
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ActionCard
                    title="Manage Tenants"
                    description="View all restaurants, suspend, reactivate, or grant lifetime access."
                    icon="🏢"
                    onClick={() => navigate('/super-admin/tenants')}
                />
                <ActionCard
                    title="View Plans"
                    description="See all subscription plans and pricing tiers."
                    icon="💳"
                    onClick={() => navigate('/super-admin/plans')}
                />
            </div>
        </div>
    );
}

// ============ StatCard ============

function StatCard({ label, value, color }) {
    const colorClasses = {
        slate: 'bg-slate-50 border-slate-200 text-slate-900',
        green: 'bg-green-50 border-green-200 text-green-900',
        orange: 'bg-orange-50 border-orange-200 text-orange-900',
        red: 'bg-red-50 border-red-200 text-red-900',
        gray: 'bg-gray-50 border-gray-200 text-gray-900',
        blue: 'bg-blue-50 border-blue-200 text-blue-900',
    };

    return (
        <div className={`rounded-lg border p-4 ${colorClasses[color] || colorClasses.slate}`}>
            <p className="text-xs sm:text-sm font-medium opacity-80">{label}</p>
            <p className="text-2xl sm:text-3xl font-bold mt-1">{value ?? 0}</p>
        </div>
    );
}

// ============ ActionCard ============

function ActionCard({ title, description, icon, onClick }) {
    return (
        <button
            onClick={onClick}
            className="bg-white border border-slate-200 rounded-lg p-5 text-left hover:border-slate-400 hover:shadow-md transition"
        >
            <div className="flex items-start gap-3">
                <span className="text-2xl">{icon}</span>
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{description}</p>
                </div>
            </div>
        </button>
    );
}