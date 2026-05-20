import { useEffect, useState } from 'react';
import superAdminService from '../services/superAdminService';

export default function SuperAdminPlans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadPlans = async () => {
            try {
                const res = await superAdminService.getAllPlans();
                const sorted = (res.data || []).sort(
                    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
                );
                setPlans(sorted);
            } catch (err) {
                setError('Failed to load plans');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadPlans();
    }, []);

    if (loading) {
        return (
            <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                <div className="text-slate-500">Loading plans...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Subscription Plans</h1>
                <p className="text-sm text-slate-500 mt-1">
                    {plans.length} plan{plans.length !== 1 ? 's' : ''} configured. Editing plans is not yet available — contact engineering.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} />
                ))}
            </div>
        </div>
    );
}

// ============ PlanCard ============

function PlanCard({ plan }) {
    return (
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{plan.code}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                    {plan.isActive ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Active</span>
                    ) : (
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Inactive</span>
                    )}
                    {!plan.isVisible && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Hidden</span>
                    )}
                </div>
            </div>

            {plan.description && (
                <p className="text-sm text-slate-600 mb-3">{plan.description}</p>
            )}

            <div className="mb-3">
                <span className="text-3xl font-bold text-slate-900">
                    ₹{Math.floor(plan.priceInr).toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-slate-500 ml-1">/ {plan.billingCycleDays}d</span>
            </div>

            <div className="border-t border-slate-200 pt-3 mb-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Limits</h4>
                <dl className="space-y-1 text-sm">
                    <LimitRow label="Staff" value={plan.maxStaff} />
                    <LimitRow label="Menu items" value={plan.maxMenuItems} />
                    <LimitRow label="Tables" value={plan.maxTables} />
                    <LimitRow label="Orders/month" value={plan.maxOrdersPerMonth} />
                    <LimitRow label="Categories" value={plan.maxCategories} />
                </dl>
            </div>

            <div className="border-t border-slate-200 pt-3 flex-1">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Features</h4>
                <ul className="space-y-1 text-sm">
                    <FeatureRow label="Inventory" enabled={plan.hasInventory} />
                    <FeatureRow label="Recipes" enabled={plan.hasRecipes} />
                    <FeatureRow label="Coupons" enabled={plan.hasCoupons} />
                    <FeatureRow label="Kitchen display" enabled={plan.hasKitchenDisplay} />
                    <FeatureRow label="Feedback" enabled={plan.hasFeedback} />
                    <FeatureRow label="CSV exports" enabled={plan.hasCsvExport} />
                    <FeatureRow label="Advanced reports" enabled={plan.hasAllReports} />
                    <FeatureRow label="Email notifications" enabled={plan.hasEmailNotifications} />
                    <FeatureRow label="WhatsApp notifications" enabled={plan.hasWhatsappNotifications} />
                    <FeatureRow label="Custom branding" enabled={plan.hasCustomBranding} />
                    <FeatureRow label="Logo upload" enabled={plan.hasLogoUpload} />
                    <FeatureRow label="API access" enabled={plan.hasApiAccess} />
                    <FeatureRow label="Priority support" enabled={plan.hasPrioritySupport} />
                </ul>
            </div>
        </div>
    );
}

function LimitRow({ label, value }) {
    const display = (value === null || value === undefined) ? 'Unlimited' : value.toLocaleString('en-IN');
    return (
        <div className="flex justify-between">
            <dt className="text-slate-600">{label}</dt>
            <dd className="font-medium text-slate-900">{display}</dd>
        </div>
    );
}

function FeatureRow({ label, enabled }) {
    return (
        <li className="flex items-center gap-2">
            <span className={enabled ? 'text-green-600' : 'text-slate-300'}>
                {enabled ? '✓' : '✗'}
            </span>
            <span className={enabled ? 'text-slate-800' : 'text-slate-400'}>
                {label}
            </span>
        </li>
    );
}