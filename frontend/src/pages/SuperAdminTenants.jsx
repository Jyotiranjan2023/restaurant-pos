import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import superAdminService from '../services/superAdminService';

export default function SuperAdminTenants() {
    const navigate = useNavigate();

    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 20;

    // Filters
    const [searchInput, setSearchInput] = useState('');
    const [searchActive, setSearchActive] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const loadTenants = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await superAdminService.listTenants(
                page,
                pageSize,
                searchActive || null,
                statusFilter || null
            );
            setTenants(res.data.content || []);
            setTotalPages(res.data.totalPages || 0);
            setTotalElements(res.data.totalElements || 0);
        } catch (err) {
            setError('Failed to load tenants');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, searchActive, statusFilter]);

    useEffect(() => {
        loadTenants();
    }, [loadTenants]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
        setSearchActive(searchInput);
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setSearchActive('');
        setPage(0);
    };

    const handleStatusChange = (newStatus) => {
        setStatusFilter(newStatus);
        setPage(0);
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">All Tenants</h1>
                <p className="text-sm text-slate-500 mt-1">
                    {totalElements} {totalElements === 1 ? 'restaurant' : 'restaurants'} total
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-3">

                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search by restaurant name or email..."
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm hover:bg-slate-800"
                        >
                            Search
                        </button>
                        {searchActive && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="px-3 py-2 text-slate-600 text-sm hover:text-slate-900"
                            >
                                Clear
                            </button>
                        )}
                    </form>

                    {/* Status filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                    >
                        <option value="">All statuses</option>
                        <option value="TRIAL">Trial</option>
                        <option value="ACTIVE">Active</option>
                        <option value="GRACE_PERIOD">Grace period</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="LIFETIME_FREE">Lifetime free</option>
                    </select>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 text-sm text-red-800">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading tenants...</div>
                ) : tenants.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No tenants found matching your filters.
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-700">Restaurant</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-700">Plan</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-700">Days Left</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-700">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tenants.map((t) => (
                                        <tr
                                            key={t.tenantId}
                                            onClick={() => navigate(`/super-admin/tenants/${t.tenantId}`)}
                                            className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900">{t.restaurantName}</div>
                                                <div className="text-xs text-slate-500">{t.email}</div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">{t.planName || '—'}</td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={t.subscriptionStatus} />
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">
                                                {t.daysRemaining === null ? '∞' : `${t.daysRemaining}d`}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 text-xs">
                                                {formatDate(t.createdAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="md:hidden divide-y divide-slate-200">
                            {tenants.map((t) => (
                                <div
                                    key={t.tenantId}
                                    onClick={() => navigate(`/super-admin/tenants/${t.tenantId}`)}
                                    className="p-4 hover:bg-slate-50 cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium text-slate-900 truncate">{t.restaurantName}</div>
                                            <div className="text-xs text-slate-500 truncate">{t.email}</div>
                                        </div>
                                        <StatusBadge status={t.subscriptionStatus} />
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                                        <span>{t.planName || '—'}</span>
                                        <span>{t.daysRemaining === null ? '∞ days' : `${t.daysRemaining}d left`}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-slate-600">
                        Page {page + 1} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 0}
                            className="px-3 py-1.5 border border-slate-300 rounded-md text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page >= totalPages - 1}
                            className="px-3 py-1.5 border border-slate-300 rounded-md text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ============ StatusBadge ============

function StatusBadge({ status }) {
    if (!status) {
        return <span className="text-xs text-slate-400">—</span>;
    }

    const styles = {
        TRIAL: 'bg-orange-100 text-orange-800',
        ACTIVE: 'bg-green-100 text-green-800',
        GRACE_PERIOD: 'bg-red-100 text-red-800',
        SUSPENDED: 'bg-gray-200 text-gray-700',
        CANCELLED: 'bg-gray-100 text-gray-500',
        LIFETIME_FREE: 'bg-blue-100 text-blue-800',
    };

    const labels = {
        TRIAL: 'Trial',
        ACTIVE: 'Active',
        GRACE_PERIOD: 'Grace',
        SUSPENDED: 'Suspended',
        CANCELLED: 'Cancelled',
        LIFETIME_FREE: 'Lifetime',
    };

    return (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
            {labels[status] || status}
        </span>
    );
}

// ============ Helpers ============

function formatDate(isoString) {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}