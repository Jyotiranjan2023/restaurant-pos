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

    // Modal state
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
            <div className="p-4 sm:p-6 max-w-5xl mx-auto">
                <div className="text-slate-500">Loading tenant...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 sm:p-6 max-w-5xl mx-auto">
                <button
                    onClick={() => navigate('/super-admin/tenants')}
                    className="text-sm text-slate-600 hover:text-slate-900 mb-3"
                >
                    ← Back to tenants
                </button>
                <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
                    {error}
                </div>
            </div>
        );
    }

    if (!tenant) return null;

    // Smart button logic — which actions make sense for current status
    const status = tenant.subscriptionStatus;
    const isLifetime = tenant.isLifetimeFree;

    const canSuspend = status !== 'SUSPENDED' && status !== 'CANCELLED';
    const canReactivate = status === 'GRACE_PERIOD' || status === 'SUSPENDED' || status === 'CANCELLED';
    const canConvertLifetime = !isLifetime && status !== 'CANCELLED';

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto">

            {/* Back */}
            <button
                onClick={() => navigate('/super-admin/tenants')}
                className="text-sm text-slate-600 hover:text-slate-900 mb-3 flex items-center gap-1"
            >
                ← Back to tenants
            </button>

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold text-slate-900">{tenant.restaurantName}</h1>
                    <StatusBadge status={status} />
                    {isLifetime && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                            ⭐ Lifetime
                        </span>
                    )}
                </div>
                <p className="text-sm text-slate-500 mt-1">Tenant ID: {tenant.tenantId}</p>
            </div>

            {/* Action buttons */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Actions</h3>
                <div className="flex flex-wrap gap-2">
                    {canSuspend && (
                        <button
                            onClick={() => setModalAction('suspend')}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md"
                        >
                            🔒 Suspend
                        </button>
                    )}
                    {canReactivate && (
                        <button
                            onClick={() => setModalAction('reactivate')}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md"
                        >
                            ✓ Reactivate
                        </button>
                    )}
                    {canConvertLifetime && (
                        <button
                            onClick={() => setModalAction('lifetime')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
                        >
                            ⭐ Grant Lifetime Free
                        </button>
                    )}
                    {!canSuspend && !canReactivate && !canConvertLifetime && (
                        <p className="text-sm text-slate-500">No actions available for current status.</p>
                    )}
                </div>
            </div>

            {/* Grid: Tenant info + Subscription + Counts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

                {/* Restaurant info */}
                <div className="bg-white border border-slate-200 rounded-lg p-5">
                    <h3 className="font-semibold text-slate-900 mb-3">Restaurant Info</h3>
                    <dl className="space-y-2 text-sm">
                        <InfoRow label="Email" value={tenant.email} />
                        <InfoRow label="Phone" value={tenant.phone} />
                        <InfoRow label="Address" value={tenant.address} />
                        <InfoRow label="City" value={tenant.city} />
                        <InfoRow label="State" value={tenant.state} />
                        <InfoRow label="Pincode" value={tenant.pincode} />
                        <InfoRow label="GST Number" value={tenant.gstNumber} />
                        <InfoRow label="FSSAI Number" value={tenant.fssaiNumber} />
                        <InfoRow label="Created" value={formatDate(tenant.createdAt)} />
                    </dl>
                </div>

                {/* Subscription */}
                <div className="bg-white border border-slate-200 rounded-lg p-5">
                    <h3 className="font-semibold text-slate-900 mb-3">Subscription</h3>
                    <dl className="space-y-2 text-sm">
                        <InfoRow label="Plan" value={tenant.planName} />
                        <InfoRow label="Price" value={tenant.planPriceInr ? `₹${tenant.planPriceInr}/month` : '—'} />
                        <InfoRow label="Status" value={status} />
                        <InfoRow label="Started" value={formatDate(tenant.startedAt)} />
                        <InfoRow label="Expires" value={formatDate(tenant.expiresAt)} />
                        <InfoRow label="Trial ends" value={formatDate(tenant.trialEndsAt)} />
                        <InfoRow label="Grace ends" value={formatDate(tenant.gracePeriodEndsAt)} />
                        <InfoRow
                            label="Days remaining"
                            value={tenant.daysRemaining === null ? 'Unlimited' : `${tenant.daysRemaining} days`}
                        />
                        <InfoRow label="Orders this month" value={tenant.currentMonthOrders} />
                    </dl>
                </div>
            </div>

            {/* Counts */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <CountCard label="Users" value={tenant.totalUsers} />
                <CountCard label="Products" value={tenant.totalProducts} />
                <CountCard label="Orders" value={tenant.totalOrders} />
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

// ============ helpers ============

function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between gap-3">
            <dt className="text-slate-500">{label}</dt>
            <dd className="text-slate-900 text-right">{value ?? '—'}</dd>
        </div>
    );
}

function CountCard({ label, value }) {
    return (
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            <p className="text-xs sm:text-sm text-slate-500">{label}</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{value ?? 0}</p>
        </div>
    );
}

function StatusBadge({ status }) {
    if (!status) return null;
    const styles = {
        TRIAL: 'bg-orange-100 text-orange-800',
        ACTIVE: 'bg-green-100 text-green-800',
        GRACE_PERIOD: 'bg-red-100 text-red-800',
        SUSPENDED: 'bg-gray-200 text-gray-700',
        CANCELLED: 'bg-gray-100 text-gray-500',
        LIFETIME_FREE: 'bg-blue-100 text-blue-800',
    };
    return (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
            {status}
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