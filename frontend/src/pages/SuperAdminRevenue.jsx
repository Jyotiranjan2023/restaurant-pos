import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import superAdminService from '../services/superAdminService';

export default function SuperAdminRevenue() {
    const navigate = useNavigate();
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const [sortField, setSortField] = useState('monthlyRevenue');
    const [sortDir, setSortDir]     = useState('desc');

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await superAdminService.getRevenue();
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load revenue data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleSort = (field) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('desc'); }
    };

    const sortedTenants = data?.tenantRevenues ? [...data.tenantRevenues].sort((a, b) => {
        const av = a[sortField] ?? 0;
        const bv = b[sortField] ?? 0;
        const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
        return sortDir === 'asc' ? cmp : -cmp;
    }) : [];

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Loading revenue data...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm max-w-md">
                <p className="font-semibold mb-1">Error</p>
                <p>{error}</p>
                <button onClick={load} className="mt-3 text-red-600 underline text-xs">Retry</button>
            </div>
        </div>
    );

    if (!data) return null;

    const chartColors = ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Revenue</h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Subscription revenue overview
                        </p>
                    </div>
                    <button
                        onClick={load}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        ↻ Refresh
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <KpiCard
                        label="Total Revenue"
                        value={`₹${fmt(data.totalRevenueAllTime)}`}
                        sub="All time"
                        color="slate"
                        icon="💰"
                    />
                    <KpiCard
                        label="This Month"
                        value={`₹${fmt(data.revenueThisMonth)}`}
                        sub="New subscriptions"
                        color="emerald"
                        icon="📅"
                    />
                    <KpiCard
                        label="Current MRR"
                        value={`₹${fmt(data.currentMrr)}`}
                        sub="Monthly recurring"
                        color="indigo"
                        icon="📈"
                    />
                    <KpiCard
                        label="Avg per Tenant"
                        value={`₹${fmt(data.avgRevenuePerTenant)}`}
                        sub={`${data.activePayingTenants} paying tenants`}
                        color="amber"
                        icon="👥"
                    />
                </div>

                {/* Chart + Plan Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

                    {/* Monthly Revenue Chart */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-800 mb-4">
                            Monthly Revenue — Last 6 Months
                        </h3>
                        {data.monthlyRevenue?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={data.monthlyRevenue} barSize={32}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={v => `₹${v}`}
                                    />
                                    <Tooltip
                                        formatter={(v) => [`₹${fmt(v)}`, 'Revenue']}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            fontSize: '12px'
                                        }}
                                    />
                                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                                        {data.monthlyRevenue.map((_, i) => (
                                            <Cell key={i} fill={chartColors[i % chartColors.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState message="No monthly revenue data yet" />
                        )}
                    </div>

                    {/* Plan Breakdown */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-800 mb-4">
                            Plan Breakdown
                        </h3>
                        {data.planBreakdown?.length > 0 ? (
                            <div className="space-y-3">
                                {data.planBreakdown.map((plan, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-1">
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">
                                                    {plan.planName}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {plan.tenantCount} tenant{plan.tenantCount !== 1 ? 's' : ''} · ₹{fmt(plan.priceInr)}/mo
                                                </p>
                                            </div>
                                            <p className="text-sm font-bold text-slate-900">
                                                ₹{fmt(plan.totalRevenue)}
                                            </p>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                                            <div
                                                className="bg-slate-700 h-1.5 rounded-full"
                                                style={{
                                                    width: `${data.currentMrr > 0
                                                        ? Math.round((plan.totalRevenue / data.currentMrr) * 100)
                                                        : 0}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState message="No active plans" />
                        )}

                        {/* Churn indicators */}
                        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                            <div className="text-center">
                                <p className="text-lg font-bold text-red-600">
                                    {data.cancelledThisMonth ?? 0}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">Cancelled</p>
                                <p className="text-xs text-slate-300">this month</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-orange-500">
                                    {data.suspendedThisMonth ?? 0}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">Suspended</p>
                                <p className="text-xs text-slate-300">this month</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upcoming Renewals */}
                {data.upcomingRenewals?.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-5">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-base">🔔</span>
                            <h3 className="text-sm font-semibold text-slate-800">
                                Upcoming Renewals
                                <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                                    Next 30 days
                                </span>
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <Th>Restaurant</Th>
                                        <Th>Email</Th>
                                        <Th>Plan</Th>
                                        <Th align="right">Amount</Th>
                                        <Th align="right">Expires</Th>
                                        <Th align="right">Days Left</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.upcomingRenewals.map((r, i) => (
                                        <tr
                                            key={i}
                                            className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                                            onClick={() => navigate(`/super-admin/tenants/${r.tenantId}`)}
                                        >
                                            <Td>
                                                <span className="font-medium text-slate-800">
                                                    {r.restaurantName}
                                                </span>
                                            </Td>
                                            <Td>{r.email}</Td>
                                            <Td>
                                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                                                    {r.planName}
                                                </span>
                                            </Td>
                                            <Td align="right">
                                                <span className="font-semibold text-slate-900">
                                                    ₹{fmt(r.amount)}
                                                </span>
                                            </Td>
                                            <Td align="right">{r.expiresAt}</Td>
                                            <Td align="right">
                                                <DaysChip days={r.daysUntilRenewal} />
                                            </Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Per-Tenant Revenue Table */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-800">
                            Per-Tenant Revenue
                            <span className="ml-2 text-xs text-slate-400 font-normal">
                                {sortedTenants.length} active tenants
                            </span>
                        </h3>
                    </div>

                    {sortedTenants.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <Th>Restaurant</Th>
                                        <Th className="hidden sm:table-cell">Email</Th>
                                        <SortableTh
                                            field="planName"
                                            current={sortField}
                                            dir={sortDir}
                                            onClick={handleSort}
                                        >
                                            Plan
                                        </SortableTh>
                                        <SortableTh
                                            field="monthlyRevenue"
                                            current={sortField}
                                            dir={sortDir}
                                            onClick={handleSort}
                                            align="right"
                                        >
                                            Monthly
                                        </SortableTh>
                                        <SortableTh
                                            field="daysRemaining"
                                            current={sortField}
                                            dir={sortDir}
                                            onClick={handleSort}
                                            align="right"
                                        >
                                            Days Left
                                        </SortableTh>
                                        <Th align="right">Expires</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedTenants.map((t, i) => (
                                        <tr
                                            key={i}
                                            className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                                            onClick={() => navigate(`/super-admin/tenants/${t.tenantId}`)}
                                        >
                                            <Td>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                        {t.restaurantName?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-slate-800 truncate max-w-[120px] sm:max-w-none">
                                                        {t.restaurantName}
                                                    </span>
                                                </div>
                                            </Td>
                                            <Td className="hidden sm:table-cell text-slate-500">
                                                {t.email}
                                            </Td>
                                            <Td>
                                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                                                    {t.planName}
                                                </span>
                                            </Td>
                                            <Td align="right">
                                                <span className="font-semibold text-slate-900">
                                                    ₹{fmt(t.monthlyRevenue)}
                                                </span>
                                            </Td>
                                            <Td align="right">
                                                <DaysChip days={t.daysRemaining} />
                                            </Td>
                                            <Td align="right" className="text-slate-500">
                                                {t.expiresAt}
                                            </Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState message="No active paying tenants yet" />
                    )}
                </div>

            </div>
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────

function fmt(n) {
    if (n == null) return '0';
    return Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

// ─── Sub-components ───────────────────────────────────────────────

function KpiCard({ label, value, sub, color, icon }) {
    const bg = {
        slate:   'bg-slate-50   border-slate-200',
        emerald: 'bg-emerald-50 border-emerald-100',
        indigo:  'bg-indigo-50  border-indigo-100',
        amber:   'bg-amber-50   border-amber-100',
    };
    return (
        <div className={`border rounded-2xl p-4 shadow-sm ${bg[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                <span className="text-lg">{icon}</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
        </div>
    );
}

function DaysChip({ days }) {
    if (days == null) return <span className="text-xs text-slate-400">—</span>;
    const color = days <= 5
        ? 'bg-red-100 text-red-700'
        : days <= 15
        ? 'bg-orange-100 text-orange-700'
        : 'bg-green-100 text-green-700';
    return (
        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${color}`}>
            {days}d
        </span>
    );
}

function Th({ children, align = 'left', className = '' }) {
    return (
        <th className={`pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide text-${align} ${className}`}>
            {children}
        </th>
    );
}

function SortableTh({ children, field, current, dir, onClick, align = 'left' }) {
    const active = current === field;
    return (
        <th
            className={`pb-2 text-xs font-semibold uppercase tracking-wide text-${align} cursor-pointer select-none transition-colors ${
                active ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => onClick(field)}
        >
            {children} {active ? (dir === 'asc' ? '↑' : '↓') : '↕'}
        </th>
    );
}

function Td({ children, align = 'left', className = '' }) {
    return (
        <td className={`py-2.5 text-sm text-slate-700 text-${align} ${className}`}>
            {children}
        </td>
    );
}

function EmptyState({ message }) {
    return (
        <div className="py-10 text-center">
            <p className="text-sm text-slate-400">{message}</p>
        </div>
    );
}