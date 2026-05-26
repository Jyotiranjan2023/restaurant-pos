import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import superAdminService from '../services/superAdminService';

// ── Confirm modal ─────────────────────────────────────────────────────

function ConfirmModal({ action, tenant, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  const [extendDays, setExtendDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const config = {
    SUSPEND: {
      title: 'Suspend tenant',
      desc: `Suspending will block all access for ${tenant?.restaurantName}. You can reactivate at any time.`,
      color: 'text-red-600',
      btnClass: 'bg-red-600 hover:bg-red-700',
      btnLabel: 'Suspend',
      showReason: true,
      showExtend: false,
    },
    REACTIVATE: {
      title: 'Reactivate tenant',
      desc: `This will restore access for ${tenant?.restaurantName}.`,
      color: 'text-green-700',
      btnClass: 'bg-green-600 hover:bg-green-700',
      btnLabel: 'Reactivate',
      showReason: true,
      showExtend: true,
    },
    LIFETIME: {
      title: 'Grant lifetime access',
      desc: `This will give ${tenant?.restaurantName} permanent free access. This cannot be undone easily.`,
      color: 'text-indigo-700',
      btnClass: 'bg-indigo-600 hover:bg-indigo-700',
      btnLabel: 'Grant lifetime',
      showReason: true,
      showExtend: false,
    },
  };

  const c = config[action];
  if (!c) return null;

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    try {
      await onConfirm({ reason, extendDays: Number(extendDays) });
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-5 border-b border-gray-100">
          <h2 className={`text-base font-semibold ${c.color}`}>{c.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{c.desc}</p>
        </div>
        <div className="p-5 space-y-3">
          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          {c.showReason && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Reason <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Non-payment, early adopter reward..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
          {c.showExtend && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Extend by (days)</label>
              <select
                value={extendDays}
                onChange={e => setExtendDays(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>
          )}
        </div>
        <div className="px-5 pb-5 flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60 ${c.btnClass}`}
          >
            {loading && (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            )}
            {loading ? 'Processing…' : c.btnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Action buttons ────────────────────────────────────────────────────

function ActionButtons({ tenant, onAction, onView }) {
  const status = tenant.subscriptionStatus;
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <button
        onClick={e => { e.stopPropagation(); onView(); }}
        className="text-xs px-2.5 py-1 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Details
      </button>
      {status === 'SUSPENDED' ? (
        <button
          onClick={e => { e.stopPropagation(); onAction('REACTIVATE', tenant); }}
          className="text-xs px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
        >
          Reactivate
        </button>
      ) : status !== 'LIFETIME_FREE' && (
        <button
          onClick={e => { e.stopPropagation(); onAction('SUSPEND', tenant); }}
          className="text-xs px-2.5 py-1 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          Suspend
        </button>
      )}
      {status !== 'LIFETIME_FREE' && (
        <button
          onClick={e => { e.stopPropagation(); onAction('LIFETIME', tenant); }}
          className="text-xs px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          Lifetime
        </button>
      )}
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────

function StatusBadge({ status }) {
  if (!status) return <span className="text-xs text-gray-400">—</span>;
  const styles = {
    TRIAL:        'bg-orange-100 text-orange-800',
    ACTIVE:       'bg-green-100 text-green-800',
    GRACE_PERIOD: 'bg-red-100 text-red-800',
    SUSPENDED:    'bg-gray-200 text-gray-700',
    CANCELLED:    'bg-gray-100 text-gray-500',
    LIFETIME_FREE:'bg-blue-100 text-blue-800',
  };
  const labels = {
    TRIAL:        'Trial',
    ACTIVE:       'Active',
    GRACE_PERIOD: 'Grace',
    SUSPENDED:    'Suspended',
    CANCELLED:    'Cancelled',
    LIFETIME_FREE:'Lifetime',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {labels[status] || status}
    </span>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ── Main page ─────────────────────────────────────────────────────────

export default function SuperAdminTenants() {
  const navigate = useNavigate();

  const [tenants,       setTenants]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [successMsg,    setSuccessMsg]    = useState('');

  // Pagination
  const [page,          setPage]          = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  // Filters
  const [searchInput,  setSearchInput]  = useState('');
  const [searchActive, setSearchActive] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal
  const [modal, setModal] = useState(null); // { action, tenant }

  const loadTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await superAdminService.listTenants(
        page, pageSize,
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

  useEffect(() => { loadTenants(); }, [loadTenants]);

  // Auto-clear success message
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(''), 4000);
    return () => clearTimeout(t);
  }, [successMsg]);

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

  const openModal = (action, tenant) => setModal({ action, tenant });
  const closeModal = () => setModal(null);

  const handleConfirmAction = async ({ reason, extendDays }) => {
    const { action, tenant } = modal;
    const id = tenant.tenantId;
    if (action === 'SUSPEND') {
      await superAdminService.suspendTenant(id, reason);
      setSuccessMsg(`${tenant.restaurantName} suspended successfully.`);
    } else if (action === 'REACTIVATE') {
      await superAdminService.reactivateTenant(id, reason, extendDays);
      setSuccessMsg(`${tenant.restaurantName} reactivated for ${extendDays} days.`);
    } else if (action === 'LIFETIME') {
      await superAdminService.convertToLifetimeFree(id, reason);
      setSuccessMsg(`${tenant.restaurantName} granted lifetime access.`);
    }
    closeModal();
    loadTenants();
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-5 gap-3">
        <div>
          <h1 className="text-xl font-medium text-gray-900">All Tenants</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalElements} {totalElements === 1 ? 'restaurant' : 'restaurants'} total
          </p>
        </div>
        <button onClick={loadTenants}
          className="flex-shrink-0 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Refresh
        </button>
      </div>

      {/* ── Success banner ── */}
      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          {successMsg}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by name or email…"
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 transition-colors flex-shrink-0">
              Search
            </button>
            {searchActive && (
              <button type="button" onClick={handleClearSearch}
                className="px-3 py-2 text-gray-500 text-sm hover:text-gray-800 flex-shrink-0">
                Clear
              </button>
            )}
          </form>
          <select
            value={statusFilter}
            onChange={e => handleStatusChange(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
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

      {/* ── Table ── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-4 py-4 animate-pulse flex gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-100 rounded w-40" />
                  <div className="h-3 bg-gray-100 rounded w-56" />
                </div>
                <div className="h-5 bg-gray-100 rounded w-16" />
              </div>
            ))}
          </div>
        ) : tenants.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            No tenants found matching your filters.
          </div>
        ) : (
          <>
            {/* ── Desktop table ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Restaurant</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Plan</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Days left</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Created</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tenants.map(t => (
                    <tr key={t.tenantId}
                      className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 cursor-pointer"
                        onClick={() => navigate(`/super-admin/tenants/${t.tenantId}`)}>
                        <div className="font-medium text-gray-900">{t.restaurantName}</div>
                        <div className="text-xs text-gray-500">{t.email}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{t.planName || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={t.subscriptionStatus} /></td>
                      <td className="px-4 py-3 text-gray-600">
                        {t.daysRemaining === null || t.daysRemaining === undefined
                          ? '∞' : `${t.daysRemaining}d`}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(t.createdAt)}</td>
                      <td className="px-4 py-3">
                        <ActionButtons
                          tenant={t}
                          onAction={openModal}
                          onView={() => navigate(`/super-admin/tenants/${t.tenantId}`)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards ── */}
            <div className="md:hidden divide-y divide-gray-100">
              {tenants.map(t => (
                <div key={t.tenantId} className="p-4">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <div className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => navigate(`/super-admin/tenants/${t.tenantId}`)}>
                      <div className="font-medium text-gray-900 truncate">{t.restaurantName}</div>
                      <div className="text-xs text-gray-500 truncate">{t.email}</div>
                    </div>
                    <StatusBadge status={t.subscriptionStatus} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mb-3">
                    <span>{t.planName || '—'}</span>
                    <span>
                      {t.daysRemaining === null || t.daysRemaining === undefined
                        ? '∞' : `${t.daysRemaining}d left`}
                    </span>
                  </div>
                  <ActionButtons
                    tenant={t}
                    onAction={openModal}
                    onView={() => navigate(`/super-admin/tenants/${t.tenantId}`)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage(page - 1)} disabled={page === 0}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              ← Previous
            </button>
            <button onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── Confirm modal ── */}
      {modal && (
        <ConfirmModal
          action={modal.action}
          tenant={modal.tenant}
          onConfirm={handleConfirmAction}
          onCancel={closeModal}
        />
      )}
    </div>
  );
}