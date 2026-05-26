import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import superAdminService from '../services/superAdminService';
import SuperAdminActionModal from '../components/SuperAdminActionModal';

export default function SuperAdminTenantDetail() {
    const { tenantId } = useParams();
    const navigate = useNavigate();

    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalAction, setModalAction] = useState(null);

    const loadTenant = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await superAdminService.getTenantDetail(tenantId);
            setTenant(res.data);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to load tenant';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        loadTenant();
    }, [loadTenant]);

    const handleSuspend = async (payload) => {
        const res = await superAdminService.suspendTenant(tenantId, payload.reason);
        setTenant(res.data);
    };

    const handleReactivate = async (payload) => {
        const res = await superAdminService.reactivateTenant(tenantId, payload.reason, payload.extendDays);
        setTenant(res.data);
    };

    const handleLifetime = async (payload) => {
        const res = await superAdminService.convertToLifetimeFree(tenantId, payload.reason);
        setTenant(res.data);
    };

    const getActionHandler = () => {
        if (modalAction === 'suspend') return handleSuspend;
        if (modalAction === 'reactivate') return handleReactivate;
        if (modalAction === 'lifetime') return handleLifetime;
        return () => {};
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                    <p className="text-sm text-slate-500 font-medium">Loading tenant details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-start">
                <button
                    onClick={() => navigate('/super-admin/tenants')}
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6 group"
                >
                    <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                    Back to tenants
                </button>
                <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm">
                    <p className="font-semibold mb-1">Error loading tenant</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!tenant) return null;

    const status = tenant.subscriptionStatus;
    const isLifetime = tenant.isLifetimeFree;

    const canSuspend = status !== 'SUSPENDED' && status !== 'CANCELLED';
    const canReactivate = status === 'GRACE_PERIOD' || status === 'SUSPENDED' || status === 'CANCELLED';
    const canConvertLifetime = !isLifetime && status !== 'CANCELLED';

    const hasActions = canSuspend || canReactivate || canConvertLifetime;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

                {/* Back button */}
                <button
                    onClick={() => navigate('/super-admin/tenants')}
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-5 group"
                >
                    <span className="group-hover:-translate-x-0.5 transition-transform inline-block">←</span>
                    Back to tenants
                </button>

                {/* Hero Header Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mb-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        {/* Left: identity */}
                        <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                                {tenant.restaurantName?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl font-bold text-slate-900 leading-tight">
                                        {tenant.restaurantName}
                                    </h1>
                                    <StatusBadge status={status} />
                                    {isLifetime && (
                                        <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                                            ⭐ Lifetime Free
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mt-1 font-mono">ID: {tenant.tenantId}</p>
                                <p className="text-sm text-slate-500 mt-0.5">{tenant.email}</p>
                            </div>
                        </div>

                        {/* Right: quick stats */}
                        <div className="flex gap-4 sm:gap-6 flex-shrink-0">
                            <QuickStat label="Users" value={tenant.totalUsers ?? 0} />
                            <QuickStat label="Products" value={tenant.totalProducts ?? 0} />
                            <QuickStat label="Orders" value={tenant.totalOrders ?? 0} />
                        </div>
                    </div>

                    {/* Action buttons */}
                    {hasActions ? (
                        <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap gap-2">
                            {canSuspend && (
                                <ActionButton
                                    onClick={() => setModalAction('suspend')}
                                    variant="danger"
                                    icon="🔒"
                                    label="Suspend Tenant"
                                />
                            )}
                            {canReactivate && (
                                <ActionButton
                                    onClick={() => setModalAction('reactivate')}
                                    variant="success"
                                    icon="✓"
                                    label="Reactivate"
                                />
                            )}
                            {canConvertLifetime && (
                                <ActionButton
                                    onClick={() => setModalAction('lifetime')}
                                    variant="primary"
                                    icon="⭐"
                                    label="Grant Lifetime Free"
                                />
                            )}
                        </div>
                    ) : (
                        <div className="mt-5 pt-5 border-t border-slate-100">
                            <p className="text-sm text-slate-400 italic">No actions available for current status.</p>
                        </div>
                    )}
                </div>

                {/* Two-column info grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

                    {/* Restaurant Info */}
                    <InfoCard title="Restaurant Info" icon="🏪">
                        <InfoRow label="Phone" value={tenant.phone} />
                        <InfoRow label="Address" value={tenant.address} />
                        <InfoRow label="City" value={tenant.city} />
                        <InfoRow label="State" value={tenant.state} />
                        <InfoRow label="Pincode" value={tenant.pincode} />
                        <InfoRow label="GST Number" value={tenant.gstNumber} mono />
                        <InfoRow label="FSSAI Number" value={tenant.fssaiNumber} mono />
                        <InfoRow label="Registered" value={formatDate(tenant.createdAt)} />
                    </InfoCard>

                    {/* Subscription Info */}
                    <InfoCard title="Subscription" icon="💳">
                        <InfoRow label="Plan" value={tenant.planName} highlight />
                        <InfoRow
                            label="Price"
                            value={tenant.planPriceInr ? `₹${tenant.planPriceInr}/month` : 'Free'}
                        />
                        <InfoRow label="Status" value={<StatusBadge status={status} />} />
                        <InfoRow label="Started" value={formatDate(tenant.startedAt)} />
                        <InfoRow label="Expires" value={formatDate(tenant.expiresAt)} />
                        <InfoRow label="Trial Ends" value={formatDate(tenant.trialEndsAt)} />
                        <InfoRow label="Grace Period Ends" value={formatDate(tenant.gracePeriodEndsAt)} />
                        <InfoRow
                            label="Days Remaining"
                            value={
                                tenant.daysRemaining === null
                                    ? 'Unlimited'
                                    : `${tenant.daysRemaining} days`
                            }
                            highlight={tenant.daysRemaining !== null && tenant.daysRemaining <= 5}
                        />
                        <InfoRow label="Orders This Month" value={tenant.currentMonthOrders ?? 0} />
                    </InfoCard>
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-3 gap-4">
                    <MetricCard
                        label="Total Users"
                        value={tenant.totalUsers ?? 0}
                        icon="👤"
                        color="slate"
                    />
                    <MetricCard
                        label="Total Products"
                        value={tenant.totalProducts ?? 0}
                        icon="🍽️"
                        color="indigo"
                    />
                    <MetricCard
                        label="Total Orders"
                        value={tenant.totalOrders ?? 0}
                        icon="📋"
                        color="emerald"
                    />
                </div>
            </div>

            {/* Action Modal */}
            <SuperAdminActionModal
                isOpen={!!modalAction}
                actionType={modalAction}
                tenantName={tenant.restaurantName}
                onConfirm={getActionHandler()}
                onClose={() => setModalAction(null)}
            />
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────

function QuickStat({ label, value }) {
    return (
        <div className="text-center">
            <p className="text-xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
        </div>
    );
}

function ActionButton({ onClick, variant, icon, label }) {
    const variants = {
        danger: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300',
        success: 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 hover:border-green-300',
        primary: 'bg-slate-900 text-white hover:bg-slate-700',
    };
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${variants[variant]}`}
        >
            <span>{icon}</span>
            {label}
        </button>
    );
}

function InfoCard({ title, icon, children }) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-base">{icon}</span>
                <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            </div>
            <dl className="space-y-3">
                {children}
            </dl>
        </div>
    );
}

function InfoRow({ label, value, mono = false, highlight = false }) {
    return (
        <div className="flex justify-between items-start gap-4">
            <dt className="text-xs text-slate-400 font-medium uppercase tracking-wide flex-shrink-0 pt-0.5">
                {label}
            </dt>
            <dd className={`text-sm text-right break-all ${
                mono ? 'font-mono text-slate-600 text-xs' :
                highlight ? 'text-slate-900 font-semibold' :
                'text-slate-700'
            }`}>
                {value ?? <span className="text-slate-300">—</span>}
            </dd>
        </div>
    );
}

function MetricCard({ label, value, icon, color }) {
    const colors = {
        slate: 'bg-slate-50 border-slate-200',
        indigo: 'bg-indigo-50 border-indigo-100',
        emerald: 'bg-emerald-50 border-emerald-100',
    };
    return (
        <div className={`border rounded-2xl p-5 text-center shadow-sm ${colors[color]}`}>
            <p className="text-xl mb-1">{icon}</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
        </div>
    );
}

function StatusBadge({ status }) {
    if (!status) return null;
    const styles = {
        TRIAL: 'bg-orange-50 text-orange-700 border border-orange-200',
        ACTIVE: 'bg-green-50 text-green-700 border border-green-200',
        GRACE_PERIOD: 'bg-red-50 text-red-700 border border-red-200',
        SUSPENDED: 'bg-slate-100 text-slate-600 border border-slate-200',
        CANCELLED: 'bg-slate-50 text-slate-400 border border-slate-200',
        LIFETIME_FREE: 'bg-amber-50 text-amber-700 border border-amber-200',
    };
    const labels = {
        TRIAL: 'Trial',
        ACTIVE: 'Active',
        GRACE_PERIOD: 'Grace Period',
        SUSPENDED: 'Suspended',
        CANCELLED: 'Cancelled',
        LIFETIME_FREE: 'Lifetime Free',
    };
    return (
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-slate-100 text-slate-500'}`}>
            {labels[status] || status}
        </span>
    );
}

function formatDate(isoString) {
    if (!isoString) return null;
    return new Date(isoString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}