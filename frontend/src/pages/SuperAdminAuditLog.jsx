import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import superAdminService from '../services/superAdminService';

export default function SuperAdminAuditLog() {
    const navigate = useNavigate();

    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 20;

    const loadAuditLog = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await superAdminService.getAuditLog(page, pageSize);
            setEntries(res.data.content || []);
            setTotalPages(res.data.totalPages || 0);
            setTotalElements(res.data.totalElements || 0);
        } catch (err) {
            setError('Failed to load audit log');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        loadAuditLog();
    }, [loadAuditLog]);

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
                <p className="text-sm text-slate-500 mt-1">
                    {totalElements} {totalElements === 1 ? 'action' : 'actions'} recorded
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 text-sm text-red-800">
                    {error}
                </div>
            )}

            {/* List */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading audit log...</div>
                ) : entries.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No audit log entries yet.
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-700">When</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-700">Who</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-700">Action</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-700">Target</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-700">Change</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-700">Reason</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map((e) => (
                                        <tr key={e.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                            <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                                                {formatDateTime(e.createdAt)}
                                            </td>
                                            <td className="px-4 py-3 text-slate-700 font-mono text-xs">
                                                {e.superAdminUsername}
                                            </td>
                                            <td className="px-4 py-3">
                                                <ActionBadge action={e.action} />
                                            </td>
                                            <td className="px-4 py-3">
                                                {e.targetTenantId ? (
                                                    <button
                                                        onClick={() => navigate(`/super-admin/tenants/${e.targetTenantId}`)}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {e.targetTenantName}
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600">
                                                <ChangeCell prev={e.previousValue} next={e.newValue} />
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600 max-w-xs">
                                                {e.reason || <span className="text-slate-300">—</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="md:hidden divide-y divide-slate-200">
                            {entries.map((e) => (
                                <div key={e.id} className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <ActionBadge action={e.action} />
                                        <span className="text-xs text-slate-500">{formatDateTime(e.createdAt)}</span>
                                    </div>
                                    {e.targetTenantId && (
                                        <p className="text-sm text-slate-900 mb-1">
                                            <span className="text-slate-500">Tenant:</span>{' '}
                                            <button
                                                onClick={() => navigate(`/super-admin/tenants/${e.targetTenantId}`)}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {e.targetTenantName}
                                            </button>
                                        </p>
                                    )}
                                    <p className="text-xs text-slate-500 mb-1">
                                        by <span className="font-mono">{e.superAdminUsername}</span>
                                    </p>
                                    {(e.previousValue || e.newValue) && (
                                        <p className="text-xs text-slate-600 mt-1">
                                            <ChangeCell prev={e.previousValue} next={e.newValue} />
                                        </p>
                                    )}
                                    {e.reason && (
                                        <p className="text-xs text-slate-600 mt-2 italic">"{e.reason}"</p>
                                    )}
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

// ============ Helpers ============

function ActionBadge({ action }) {
    const styles = {
        SUSPEND_TENANT: 'bg-red-100 text-red-800',
        REACTIVATE_TENANT: 'bg-green-100 text-green-800',
        CONVERT_LIFETIME_FREE: 'bg-blue-100 text-blue-800',
    };

    const labels = {
        SUSPEND_TENANT: '🔒 Suspend',
        REACTIVATE_TENANT: '✓ Reactivate',
        CONVERT_LIFETIME_FREE: '⭐ Lifetime',
    };

    return (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[action] || 'bg-gray-100 text-gray-700'}`}>
            {labels[action] || action}
        </span>
    );
}

function ChangeCell({ prev, next }) {
    if (!prev && !next) return <span className="text-slate-300">—</span>;
    return (
        <span className="font-mono">
            {prev && <span className="text-red-600 line-through">{prev}</span>}
            {prev && next && <span className="text-slate-400 mx-1">→</span>}
            {next && <span className="text-green-700">{next}</span>}
        </span>
    );
}

function formatDateTime(isoString) {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
} 