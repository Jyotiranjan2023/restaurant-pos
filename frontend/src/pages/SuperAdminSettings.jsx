import { useState, useEffect } from "react";
import superAdminService from "../services/superAdminService";

// ── Reusable components ──────────────────────────────────────────────

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        enabled ? "bg-indigo-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
          enabled ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SettingsRow({ label, desc, children }) {
  return (
    <div className="flex items-start justify-between gap-6 py-4 border-b border-gray-100 last:border-0 last:pb-0 first:pt-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 mb-4">
      {title && (
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-800">{title}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}

function SaveBar({ onSave, onCancel, saving, saved }) {
  return (
    <div className="flex items-center justify-between pt-2">
      {saved ? (
        <span className="text-xs text-green-600 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Saved successfully
        </span>
      ) : <span />}
      <div className="flex gap-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button type="button" onClick={onSave} disabled={saving}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors flex items-center gap-2">
          {saving && (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374L10.053 3.378c.866-1.5 3.032-1.5 3.898 0L21.303 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      {message}
    </div>
  );
}

// ── Tab: General ─────────────────────────────────────────────────────

function GeneralTab({ initial }) {
  const [form, setForm] = useState({
    trialDays:           initial?.trialDays          ?? 7,
    graceDays:           initial?.graceDays          ?? 3,
    defaultPlan:         initial?.defaultPlan        ?? "ENTERPRISE",
    timezone:            initial?.timezone           ?? "Asia/Kolkata",
    autoSuspendOnExpiry:      initial?.autoSuspendOnExpiry      ?? true,
    razorpayWebhooksEnabled:  initial?.razorpayWebhooksEnabled  ?? true,
    allowNewRegistration:     initial?.allowNewRegistration     ?? true,
    maintenanceMode:          initial?.maintenanceMode          ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState("");

  const set = (key, val) => { setForm(f => ({ ...f, [key]: val })); setSaved(false); setError(""); };

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      await superAdminService.updateSettings({
        trialDays:               Number(form.trialDays),
        graceDays:               Number(form.graceDays),
        defaultPlan:             form.defaultPlan,
        timezone:                form.timezone,
        autoSuspendOnExpiry:     form.autoSuspendOnExpiry,
        razorpayWebhooksEnabled: form.razorpayWebhooksEnabled,
        allowNewRegistration:    form.allowNewRegistration,
        maintenanceMode:         form.maintenanceMode,
      });
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <ErrorBanner message={error} />
      <Card title="Platform defaults">
        <SettingsRow label="Trial duration" desc="Days new tenants get on free trial">
          <select value={form.trialDays} onChange={e => set("trialDays", e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
        </SettingsRow>
        <SettingsRow label="Grace period" desc="Days before suspension after payment fails">
          <select value={form.graceDays} onChange={e => set("graceDays", e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value={3}>3 days</option>
            <option value={5}>5 days</option>
            <option value={7}>7 days</option>
          </select>
        </SettingsRow>
        <SettingsRow label="Default plan" desc="Plan assigned on new registration">
          <select value={form.defaultPlan} onChange={e => set("defaultPlan", e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="BASIC">Basic</option>
            <option value="PRO">Pro</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
        </SettingsRow>
        <SettingsRow label="Timezone" desc="Used for scheduled jobs and reports">
          <select value={form.timezone} onChange={e => set("timezone", e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York (EST)</option>
          </select>
        </SettingsRow>
      </Card>

      <Card title="Feature flags">
        <SettingsRow label="Auto-suspend on expiry" desc="Automatically suspend tenants when trial ends">
          <Toggle enabled={form.autoSuspendOnExpiry} onChange={v => set("autoSuspendOnExpiry", v)} />
        </SettingsRow>
        <SettingsRow label="Razorpay webhooks" desc="Process payment events automatically">
          <Toggle enabled={form.razorpayWebhooksEnabled} onChange={v => set("razorpayWebhooksEnabled", v)} />
        </SettingsRow>
        <SettingsRow label="New tenant registration" desc="Allow new restaurants to register">
          <Toggle enabled={form.allowNewRegistration} onChange={v => set("allowNewRegistration", v)} />
        </SettingsRow>
        <SettingsRow label="Maintenance mode" desc="Show maintenance page to all tenants">
          <Toggle enabled={form.maintenanceMode} onChange={v => set("maintenanceMode", v)} />
        </SettingsRow>
      </Card>

      {form.maintenanceMode && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          Maintenance mode is ON — all tenants will see a maintenance page.
        </div>
      )}

      <SaveBar onSave={handleSave} onCancel={() => { setSaved(false); setError(""); }} saving={saving} saved={saved} />
    </div>
  );
}

// ── Tab: Notifications ───────────────────────────────────────────────

function NotificationsTab({ initial }) {
  const [form, setForm] = useState({
    trialExpiryAlertEnabled:     initial?.trialExpiryAlertEnabled     ?? true,
    newTenantSignupAlertEnabled: initial?.newTenantSignupAlertEnabled ?? true,
    paymentFailureAlertEnabled:  initial?.paymentFailureAlertEnabled  ?? true,
    dailyDigestEnabled:          initial?.dailyDigestEnabled          ?? false,
    alertEmail:                  initial?.alertEmail                  ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState("");

  const set = (key, val) => { setForm(f => ({ ...f, [key]: val })); setSaved(false); setError(""); };

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      await superAdminService.updateSettings({
        trialExpiryAlertEnabled:     form.trialExpiryAlertEnabled,
        newTenantSignupAlertEnabled: form.newTenantSignupAlertEnabled,
        paymentFailureAlertEnabled:  form.paymentFailureAlertEnabled,
        dailyDigestEnabled:          form.dailyDigestEnabled,
        alertEmail:                  form.alertEmail,
      });
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <ErrorBanner message={error} />
      <Card title="Email alerts" subtitle="Choose which events trigger an email to you">
        <SettingsRow label="Trial expiry alerts" desc="Get notified 2 days before a trial ends">
          <Toggle enabled={form.trialExpiryAlertEnabled} onChange={v => set("trialExpiryAlertEnabled", v)} />
        </SettingsRow>
        <SettingsRow label="New tenant signup" desc="Email when a new restaurant registers">
          <Toggle enabled={form.newTenantSignupAlertEnabled} onChange={v => set("newTenantSignupAlertEnabled", v)} />
        </SettingsRow>
        <SettingsRow label="Payment failures" desc="Alert when a Razorpay webhook signals failure">
          <Toggle enabled={form.paymentFailureAlertEnabled} onChange={v => set("paymentFailureAlertEnabled", v)} />
        </SettingsRow>
        <SettingsRow label="Daily digest" desc="Summary email of tenant activity each morning">
          <Toggle enabled={form.dailyDigestEnabled} onChange={v => set("dailyDigestEnabled", v)} />
        </SettingsRow>
      </Card>

      <Card title="Notification email" subtitle="All platform alerts are sent to this address">
        <SettingsRow label="Alert email address" desc="Must be a valid email you have access to">
          <input type="email" value={form.alertEmail}
            onChange={e => set("alertEmail", e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-56 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </SettingsRow>
      </Card>

      <SaveBar onSave={handleSave} onCancel={() => { setSaved(false); setError(""); }} saving={saving} saved={saved} />
    </div>
  );
}

// ── Tab: Security ────────────────────────────────────────────────────

function SecurityTab({ initial }) {
  const [form, setForm] = useState({
    sessionTimeoutMinutes: initial?.sessionTimeoutMinutes ?? 30,
    strongPasswordsRequired: initial?.strongPasswordsRequired ?? true,
    ipLoggingEnabled:        initial?.ipLoggingEnabled        ?? true,
  });
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError,  setPwError]  = useState("");
  const [pwOk,     setPwOk]     = useState(false);

  const set = (key, val) => { setForm(f => ({ ...f, [key]: val })); setSaved(false); setError(""); };

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      await superAdminService.updateSettings({
        sessionTimeoutMinutes:   Number(form.sessionTimeoutMinutes),
        strongPasswordsRequired: form.strongPasswordsRequired,
        ipLoggingEnabled:        form.ipLoggingEnabled,
      });
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPwError(""); setPwOk(false);
    if (!passwords.current || !passwords.next || !passwords.confirm) { setPwError("All fields are required."); return; }
    if (passwords.next !== passwords.confirm) { setPwError("New passwords do not match."); return; }
    if (passwords.next.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    setPwSaving(true);
    try {
      await superAdminService.changePassword(passwords.current, passwords.next);
      setPwOk(true);
      setPasswords({ current: "", next: "", confirm: "" });
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setPwSaving(false);
    }
  };

  const handleRevokeSessions = async () => {
    if (!window.confirm("Revoke ALL super admin sessions? Everyone will be logged out.")) return;
    try {
      await superAdminService.revokeAllSessions();
      alert("All sessions revoked.");
    } catch (err) {
      alert("Failed to revoke sessions.");
    }
  };

  return (
    <div>
      <ErrorBanner message={error} />
      <Card title="Session & access">
        <SettingsRow label="Session timeout" desc="Auto-logout after inactivity">
          <select value={form.sessionTimeoutMinutes} onChange={e => set("sessionTimeoutMinutes", e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={240}>4 hours</option>
            <option value={0}>Never</option>
          </select>
        </SettingsRow>
        <SettingsRow label="Require strong passwords" desc="Enforce 8+ chars, mixed case, numbers">
          <Toggle enabled={form.strongPasswordsRequired} onChange={v => set("strongPasswordsRequired", v)} />
        </SettingsRow>
        <SettingsRow label="Login IP logging" desc="Record IP address on every admin login">
          <Toggle enabled={form.ipLoggingEnabled} onChange={v => set("ipLoggingEnabled", v)} />
        </SettingsRow>
      </Card>

      <SaveBar onSave={handleSave} onCancel={() => { setSaved(false); setError(""); }} saving={saving} saved={saved} />

      {/* Change password */}
      <div className="bg-white rounded-xl border border-gray-200 mt-6 mb-4">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-800">Change password</p>
          <p className="text-xs text-gray-500 mt-0.5">Update your superadmin account password</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          {pwError && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{pwError}</div>}
          {pwOk    && <div className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Password updated successfully.
          </div>}
          <input type="password" placeholder="Current password" value={passwords.current}
            onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          <input type="password" placeholder="New password" value={passwords.next}
            onChange={e => setPasswords(p => ({ ...p, next: e.target.value }))}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          <input type="password" placeholder="Confirm new password" value={passwords.confirm}
            onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          <button type="button" onClick={handlePasswordChange} disabled={pwSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors flex items-center gap-2">
            {pwSaving && <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>}
            {pwSaving ? "Updating…" : "Update password"}
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-200 mb-4">
        <div className="px-5 py-4 border-b border-red-100">
          <p className="text-sm font-medium text-red-600">Danger zone</p>
          <p className="text-xs text-gray-500 mt-0.5">These actions are irreversible — proceed with caution</p>
        </div>
        <div className="px-5 py-1">
          <SettingsRow label="Revoke all sessions" desc="Force logout all super admins immediately">
            <button type="button" onClick={handleRevokeSessions}
              className="text-sm px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
              Revoke all
            </button>
          </SettingsRow>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Billing ─────────────────────────────────────────────────────

function BillingTab({ initial }) {
  const [form, setForm] = useState({
    razorpayKeyId:      initial?.razorpayKeyId   ?? "",
    webhookSecret:      "",
    razorpayTestMode:   initial?.razorpayTestMode ?? false,
    currency:           initial?.currency         ?? "INR",
    gstEnabled:         initial?.gstEnabled        ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState("");

  const set = (key, val) => { setForm(f => ({ ...f, [key]: val })); setSaved(false); setError(""); };

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      await superAdminService.updateSettings({
        razorpayKeyId:        form.razorpayKeyId      || undefined,
        razorpayWebhookSecret: form.webhookSecret     || undefined,
        razorpayTestMode:     form.razorpayTestMode,
        currency:             form.currency,
        gstEnabled:           form.gstEnabled,
      });
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <ErrorBanner message={error} />
      <Card title="Razorpay configuration" subtitle="Credentials from your Razorpay dashboard">
        <SettingsRow label="Key ID" desc="Your Razorpay public key (starts with rzp_)">
          <input type="text" value={form.razorpayKeyId}
            onChange={e => set("razorpayKeyId", e.target.value)}
            placeholder="rzp_live_••••••••"
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-52 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </SettingsRow>
        <SettingsRow label="Webhook secret" desc="Used to verify Razorpay webhook signatures">
          <input type="password" value={form.webhookSecret}
            onChange={e => set("webhookSecret", e.target.value)}
            placeholder="Enter new secret to update"
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-52 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </SettingsRow>
        <SettingsRow label="Test mode" desc="Use Razorpay sandbox — no real charges">
          <Toggle enabled={form.razorpayTestMode} onChange={v => set("razorpayTestMode", v)} />
        </SettingsRow>
      </Card>

      {form.razorpayTestMode && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          Test mode is ON — Razorpay sandbox is active. No real payments will be processed.
        </div>
      )}

      <Card title="Currency & tax">
        <SettingsRow label="Currency" desc="Used on invoices and plan pricing display">
          <select value={form.currency} onChange={e => set("currency", e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
          </select>
        </SettingsRow>
        <SettingsRow label="Include GST on invoices" desc="Add 18% GST to all subscription invoices">
          <Toggle enabled={form.gstEnabled} onChange={v => set("gstEnabled", v)} />
        </SettingsRow>
      </Card>

      <SaveBar onSave={handleSave} onCancel={() => { setSaved(false); setError(""); }} saving={saving} saved={saved} />
    </div>
  );
}

// ── Main Settings page ───────────────────────────────────────────────

const TABS = [
  { id: "general",       label: "General" },
  { id: "notifications", label: "Notifications" },
  { id: "security",      label: "Security" },
  { id: "billing",       label: "Billing" },
];

export default function SuperAdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings,  setSettings]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Load settings from backend on mount
  useEffect(() => {
    superAdminService.getSettings()
      .then(res => setSettings(res.data))
      .catch(() => setFetchError("Failed to load settings. Using defaults."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-3 text-sm text-gray-500">
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading settings…
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-medium text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage platform behaviour, notifications, and security.
        </p>
      </div>

      {fetchError && <ErrorBanner message={fetchError} />}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map(tab => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pass loaded settings as initial values to each tab */}
      {activeTab === "general"       && <GeneralTab       initial={settings} />}
      {activeTab === "notifications"  && <NotificationsTab initial={settings} />}
      {activeTab === "security"       && <SecurityTab      initial={settings} />}
      {activeTab === "billing"        && <BillingTab       initial={settings} />}
    </div>
  );
}