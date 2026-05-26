import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import superAdminService from '../services/superAdminService';
import { useSuperAdminAuth } from '../context/SuperAdminAuthContext';

// ── Helpers ──────────────────────────────────────────────────────────

function timeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ── Stat card ────────────────────────────────────────────────────────

function StatCard({ label, value, sub, borderColor, icon }) {
  return (
    <div className={`bg-white rounded-xl border-2 ${borderColor} p-4 flex flex-col gap-1`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-tight">{label}</p>
        <span className="text-base leading-none">{icon}</span>
      </div>
      <p className="text-2xl font-semibold text-gray-900 leading-none">{value ?? 0}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── Alert item ───────────────────────────────────────────────────────

function AlertItem({ name, email, daysLeft, onView }) {
  const urgent = daysLeft <= 1;
  return (
    <div className={`flex items-center gap-3 px-3 py-3 rounded-lg border ${
      urgent ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
    }`}>
      <span className="text-base flex-shrink-0">{urgent ? '🔴' : '⚠️'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
        <p className="text-xs text-gray-500 truncate">{email}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
          urgent ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {daysLeft <= 0 ? 'Expired' : `${daysLeft}d`}
        </span>
        <button onClick={onView}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition-colors whitespace-nowrap">
          View
        </button>
      </div>
    </div>
  );
}

// ── Quick action card ────────────────────────────────────────────────

function ActionCard({ title, desc, icon, onClick, badge }) {
  return (
    <button onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-indigo-300 hover:shadow-sm transition-all group w-full">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-indigo-50 group-hover:bg-indigo-100 rounded-lg flex items-center justify-center text-base flex-shrink-0 transition-colors">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-gray-800">{title}</p>
            {badge && (
              <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-medium">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">{desc}</p>
        </div>
      </div>
    </button>
  );
}

// ── Mini bar chart ───────────────────────────────────────────────────

function MiniBarChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-14">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-indigo-500 rounded-sm opacity-80 hover:opacity-100 transition-opacity"
            style={{ height: `${Math.max((d.value / max) * 44, 3)}px` }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="text-xs text-gray-400 truncate w-full text-center leading-none">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Status donut ─────────────────────────────────────────────────────

function StatusDonut({ active, trial, grace, suspended }) {
  const total = active + trial + grace + suspended || 1;
  const segments = [
    { label: 'Active',    value: active,    color: '#22c55e' },
    { label: 'Trial',     value: trial,     color: '#6366f1' },
    { label: 'Grace',     value: grace,     color: '#f59e0b' },
    { label: 'Suspended', value: suspended, color: '#ef4444' },
  ];
  let cumulative = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {segments.map((seg, i) => {
            const pct  = seg.value / total;
            const dash = pct * circumference;
            const gap  = circumference - dash;
            const offset = cumulative * circumference;
            cumulative += pct;
            return (
              <circle key={i} cx={50} cy={50} r={radius}
                fill="none" stroke={seg.color} strokeWidth="18"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset} />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-semibold text-gray-800">{active + trial + grace + suspended}</span>
        </div>
      </div>
      <div className="space-y-1.5 flex-1">
        {segments.map(seg => (
          <div key={seg.label} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: seg.color }} />
            <span className="text-gray-500 flex-1">{seg.label}</span>
            <span className="font-medium text-gray-800">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main dashboard ───────────────────────────────────────────────────

export default function SuperAdminDashboard() {
  const { superAdmin } = useSuperAdminAuth();
  const navigate = useNavigate();

  const [stats,   setStats]   = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [statsRes, tenantsRes] = await Promise.all([
        superAdminService.getStats(),
        superAdminService.listTenants(0, 50),
      ]);
      setStats(statsRes.data);
      const list = tenantsRes.data?.content ?? tenantsRes.data ?? [];
      setTenants(list);
    } catch (err) {
      setError('Failed to load dashboard data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const expiringTrials = tenants
    .filter(t => t.status === 'TRIAL' && t.daysLeft !== undefined && t.daysLeft <= 3)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const weeklyData = [
    { label: 'W1', value: 0 },
    { label: 'W2', value: 1 },
    { label: 'W3', value: 1 },
    { label: 'W4', value: 2 },
    { label: 'W5', value: 3 },
    { label: 'W6', value: Number(stats?.newTenantsLast7Days ?? 0) },
  ];

  const firstName = superAdmin?.fullName?.split(' ')[0]
    || superAdmin?.username || 'Admin';

  return (
    <div className="p-4 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-5 gap-2">
        <div>
          <h1 className="text-lg font-medium text-gray-900">
            {timeOfDay()}, {firstName} 👋
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate()}</p>
        </div>
        <button onClick={load}
          className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Refresh
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {/* ── Stat cards — 2 cols mobile, 3 cols tablet, 6 cols desktop ── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border-2 border-gray-100 h-24" />
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
          <StatCard label="Total"     value={stats.totalTenants}             icon="🏢" borderColor="border-gray-200"   sub="All restaurants" />
          <StatCard label="Active"    value={stats.activeSubscriptions}      icon="✅" borderColor="border-green-200"  sub="Paid subscribers" />
          <StatCard label="Trial"     value={stats.trialSubscriptions}       icon="⏳" borderColor="border-indigo-200" sub="Free trial" />
          <StatCard label="Grace"     value={stats.gracePeriodSubscriptions} icon="⚠️" borderColor="border-amber-200"  sub="Payment due" />
          <StatCard label="Suspended" value={stats.suspendedSubscriptions}   icon="🚫" borderColor="border-red-200"   sub="Blocked" />
          <StatCard label="New (7d)"  value={stats.newTenantsLast7Days}      icon="🆕" borderColor="border-blue-200"  sub="This week" />
        </div>
      )}

      {/* ── Charts row — stacked on mobile, side-by-side on sm+ ── */}
      {!loading && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Status breakdown</p>
            <StatusDonut
              active    = {Number(stats.activeSubscriptions      ?? 0)}
              trial     = {Number(stats.trialSubscriptions       ?? 0)}
              grace     = {Number(stats.gracePeriodSubscriptions ?? 0)}
              suspended = {Number(stats.suspendedSubscriptions   ?? 0)}
            />
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700 mb-0.5">Tenant growth</p>
            <p className="text-xs text-gray-400 mb-3">New signups per week</p>
            <MiniBarChart data={weeklyData} />
          </div>
        </div>
      )}

      {/* ── Expiring trials ── */}
      {!loading && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div>
              <p className="text-sm font-medium text-gray-800">Expiring soon</p>
              <p className="text-xs text-gray-400">Trials ending within 3 days</p>
            </div>
            {expiringTrials.length > 0 && (
              <span className="text-xs bg-red-100 text-red-600 font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                {expiringTrials.length} urgent
              </span>
            )}
          </div>
          {expiringTrials.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-lg">✅</span>
              <div>
                <p className="text-sm font-medium text-green-800">No expiring trials</p>
                <p className="text-xs text-green-600">All tenants have more than 3 days left.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {expiringTrials.map(t => (
                <AlertItem
                  key={t.id ?? t.tenantId}
                  name={t.restaurantName ?? t.name ?? 'Unknown'}
                  email={t.email ?? '—'}
                  daysLeft={t.daysLeft}
                  onView={() => navigate(`/super-admin/tenants/${t.id ?? t.tenantId}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Quick actions — 2 cols mobile, 4 cols desktop ── */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Quick actions</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <ActionCard title="Tenants"   desc="View, suspend or reactivate" icon="🏢" onClick={() => navigate('/super-admin/tenants')} />
          <ActionCard title="Plans"     desc="Subscription plans & pricing" icon="💳" onClick={() => navigate('/super-admin/plans')} />
          <ActionCard title="Audit Log" desc="Review all admin actions"     icon="📋" onClick={() => navigate('/super-admin/audit-log')} />
          <ActionCard title="Settings"  desc="Platform & billing config"   icon="⚙️" onClick={() => navigate('/super-admin/settings')} />
        </div>
      </div>

    </div>
  );
}