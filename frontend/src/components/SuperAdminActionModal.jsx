import { useState, useEffect } from 'react';

/**
 * Confirmation modal for super admin actions (suspend / reactivate / convert lifetime).
 *
 * Props:
 *  - isOpen: boolean
 *  - actionType: 'suspend' | 'reactivate' | 'lifetime'
 *  - tenantName: string (for display)
 *  - onConfirm: async function(payload) — payload has reason, optionally extendDays
 *  - onClose: function
 */
export default function SuperAdminActionModal({ isOpen, actionType, tenantName, onConfirm, onClose }) {
    const [reason, setReason] = useState('');
    const [extendDays, setExtendDays] = useState(30);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setReason('');
            setExtendDays(30);
            setError(null);
            setSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const config = {
        suspend: {
            title: 'Suspend Tenant',
            description: `This will immediately block all access for "${tenantName}". They won't be able to login until reactivated.`,
            confirmText: 'Suspend',
            confirmClass: 'bg-red-600 hover:bg-red-700',
            icon: '🔒',
        },
        reactivate: {
            title: 'Reactivate Tenant',
            description: `Restore access for "${tenantName}" with a fresh subscription period.`,
            confirmText: 'Reactivate',
            confirmClass: 'bg-green-600 hover:bg-green-700',
            icon: '✓',
        },
        lifetime: {
            title: 'Convert to Lifetime Free',
            description: `Grant "${tenantName}" permanent free access on the Enterprise plan. This is irreversible without a manual suspension.`,
            confirmText: 'Grant Lifetime',
            confirmClass: 'bg-blue-600 hover:bg-blue-700',
            icon: '⭐',
        },
    };

    const c = config[actionType] || config.suspend;

    const handleConfirm = async () => {
        setError(null);
        setSubmitting(true);
        try {
            const payload = { reason };
            if (actionType === 'reactivate') {
                payload.extendDays = extendDays;
            }
            await onConfirm(payload);
            onClose();
        } catch (err) {
            const message = err.response?.data?.message || 'Action failed. Try again.';
            setError(message);
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50" onClick={submitting ? undefined : onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{c.icon}</span>
                        <h2 className="text-lg font-bold text-slate-900">{c.title}</h2>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-4">
                    <p className="text-sm text-slate-700 mb-4">{c.description}</p>

                    {/* Extend days field (reactivate only) */}
                    {actionType === 'reactivate' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Subscription duration
                            </label>
                            <select
                                value={extendDays}
                                onChange={(e) => setExtendDays(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                            >
                                <option value={30}>30 days</option>
                                <option value={60}>60 days</option>
                                <option value={90}>90 days</option>
                                <option value={180}>180 days</option>
                                <option value={365}>365 days (1 year)</option>
                            </select>
                        </div>
                    )}

                    {/* Reason field */}
                    <div className="mb-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Reason <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            placeholder="e.g. Partner deal, payment received offline..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm resize-none"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                            This will be recorded in the audit log.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-2 mt-3 text-sm text-red-800">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex gap-2 justify-end">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 rounded-md disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={submitting}
                        className={`px-4 py-2 text-sm text-white rounded-md disabled:opacity-50 ${c.confirmClass}`}
                    >
                        {submitting ? 'Working...' : c.confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}