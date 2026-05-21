import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import subscriptionService from '../services/subscriptionService';

const Subscription = () => {
    const { subscription, loading, error, refetch } = useSubscription();
    const navigate = useNavigate();

    // Cancel modal state
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [cancelError, setCancelError] = useState(null);

    const handleCancelConfirm = async () => {
        setCancelError(null);
        setCancelling(true);
        try {
            await subscriptionService.cancelSubscription(cancelReason.trim() || null);
            setShowCancelModal(false);
            setCancelReason('');
            // Refresh subscription data
            if (refetch) {
                refetch();
            } else {
                window.location.reload();
            }
        } catch (err) {
            setCancelError(err.response?.data?.message || 'Failed to cancel subscription');
        } finally {
            setCancelling(false);
        }
    };

    // Loading state — skeleton matches final layout
    if (loading) {
        return (
            <div className="p-4 sm:p-6 max-w-4xl mx-auto animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
                <div className="h-24 bg-gray-100 rounded-lg mb-6"></div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="h-6 bg-gray-200 rounded w-40 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div className="h-12 bg-gray-100 rounded"></div>
                        <div className="h-12 bg-gray-100 rounded"></div>
                    </div>
                </div>
                <div className="h-12 bg-gray-200 rounded-lg"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 sm:p-6 max-w-4xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-red-800 font-semibold">Error Loading Subscription</h3>
                    <p className="text-red-600 mt-1 text-sm sm:text-base">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-3 text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="p-4 sm:p-6 max-w-4xl mx-auto">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">No subscription found.</p>
                </div>
            </div>
        );
    }

    // Is this subscription marked for cancellation but still has access?
    const isPendingCancellation = subscription.cancelledAt && subscription.status !== 'CANCELLED';

    // Status banner config
    const getStatusBanner = () => {
        const status = subscription.status;
        const daysRemaining = subscription.daysRemaining;

        // Pending cancellation takes priority over status-based banner
        if (isPendingCancellation) {
            return {
                color: 'bg-amber-50 border-amber-300 text-amber-900',
                icon: 'ℹ️',
                title: 'Cancellation scheduled',
                message: `You will retain access until ${formatDate(subscription.expiresAt)} (${daysRemaining} days). After that, your subscription will end.`,
            };
        }

        if (status === 'TRIAL') {
            return {
                color: 'bg-orange-50 border-orange-300 text-orange-900',
                icon: '⚠️',
                title: `Free trial — ${daysRemaining} days left`,
                message: 'Upgrade now to keep using all features after your trial ends.',
            };
        }
        if (status === 'ACTIVE') {
            return {
                color: 'bg-green-50 border-green-300 text-green-900',
                icon: '✓',
                title: 'Active Subscription',
                message: `Your subscription renews in ${daysRemaining} days.`,
            };
        }
        if (status === 'GRACE_PERIOD') {
            return {
                color: 'bg-red-50 border-red-300 text-red-900',
                icon: '⚠️',
                title: `Payment Failed — ${daysRemaining} days to renew`,
                message: 'Please update your payment method to avoid service interruption.',
            };
        }
        if (status === 'SUSPENDED') {
            return {
                color: 'bg-red-100 border-red-400 text-red-900',
                icon: '🔒',
                title: 'Subscription Suspended',
                message: 'Renew your subscription to restore full access to your restaurant POS.',
            };
        }
        if (status === 'CANCELLED') {
            return {
                color: 'bg-gray-50 border-gray-300 text-gray-700',
                icon: 'ℹ️',
                title: 'Subscription Cancelled',
                message: subscription.cancelReason || 'Subscribe again to continue using the system.',
            };
        }
        if (status === 'LIFETIME_FREE') {
            return {
                color: 'bg-blue-50 border-blue-300 text-blue-900',
                icon: '⭐',
                title: 'Lifetime Free Access',
                message: 'You have permanent access to all features. Thank you for being with us!',
            };
        }
        return null;
    };

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const banner = getStatusBanner();

    const showUpgradeButton = ['TRIAL', 'GRACE_PERIOD', 'SUSPENDED', 'CANCELLED'].includes(subscription.status)
        || subscription.planCode === 'BASIC'
        || subscription.planCode === 'PRO';

    // Can this subscription be cancelled?
    // - Not lifetime
    // - Not already cancelled or pending cancellation
    // - Not suspended or already-cancelled status
    const canCancel = subscription.status !== 'LIFETIME_FREE'
        && subscription.status !== 'CANCELLED'
        && subscription.status !== 'SUSPENDED'
        && !isPendingCancellation;

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                My Subscription
            </h1>

            {/* Status Banner */}
            {banner && (
                <div className={`border-2 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 ${banner.color}`}>
                    <div className="flex items-start gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl flex-shrink-0">{banner.icon}</span>
                        <div className="min-w-0">
                            <h3 className="font-bold text-base sm:text-lg break-words">
                                {banner.title}
                            </h3>
                            <p className="mt-1 text-sm sm:text-base break-words">
                                {banner.message}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Plan Details Card */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex flex-wrap items-center gap-2">
                            <span>{subscription.planName}</span>
                            {subscription.status === 'TRIAL' && (
                                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                    TRIAL
                                </span>
                            )}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 mt-1 break-words">
                            {subscription.displayStatus}
                        </p>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                        <p className="text-xs sm:text-sm text-gray-500">Plan Code</p>
                        <p className="font-mono font-bold text-gray-900 text-sm sm:text-base">
                            {subscription.planCode}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div>
                        <p className="text-xs sm:text-sm text-gray-500">Started</p>
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                            {formatDate(subscription.startedAt)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm text-gray-500">
                            {subscription.status === 'LIFETIME_FREE' ? 'Valid Until' : 'Next Billing / Expiry'}
                        </p>
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                            {subscription.status === 'LIFETIME_FREE' ? 'Forever' : formatDate(subscription.expiresAt)}
                        </p>
                    </div>
                </div>

                {/* Monthly usage */}
                {subscription.currentMonthOrders !== null && subscription.currentMonthOrders !== undefined && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs sm:text-sm text-gray-500">Orders this month</p>
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                            {subscription.currentMonthOrders}
                        </p>
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
                {showUpgradeButton && (
                    <button
                        onClick={() => navigate('/upgrade')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 sm:px-6 rounded-lg shadow text-sm sm:text-base"
                    >
                        Choose Different Plan
                    </button>
                )}

                {canCancel && (
                    <button
                        onClick={() => setShowCancelModal(true)}
                        className="w-full bg-white border border-red-300 text-red-700 hover:bg-red-50 font-medium py-2.5 px-4 sm:px-6 rounded-lg text-sm sm:text-base"
                    >
                        Cancel Subscription
                    </button>
                )}
            </div>

            {/* Information Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                    About Your Subscription
                </h3>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                    <li>• Subscriptions are billed monthly in INR (Indian Rupees)</li>
                    <li>• Failed payments enter a 7-day grace period before suspension</li>
                    <li>• Your data is preserved during grace period and suspension</li>
                    <li>• You can change plans anytime</li>
                    <li>• Cancellation takes effect at the end of your current billing period</li>
                </ul>
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={cancelling ? undefined : () => setShowCancelModal(false)}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Cancel Subscription?</h2>
                        </div>

                        <div className="px-6 py-4">
                            <p className="text-sm text-gray-700 mb-3">
                                You'll keep access to all features until{' '}
                                <strong>{formatDate(subscription.expiresAt)}</strong>.
                                After that, your subscription will end and you won't be able to use the system.
                            </p>
                            <p className="text-sm text-gray-700 mb-4">
                                You can subscribe again at any time.
                            </p>

                            <div className="mb-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    rows={3}
                                    placeholder="Help us improve — why are you cancelling?"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                                />
                            </div>

                            {cancelError && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-2 mt-3 text-sm text-red-800">
                                    {cancelError}
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex gap-2 justify-end">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                disabled={cancelling}
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-md disabled:opacity-50"
                            >
                                Keep My Subscription
                            </button>
                            <button
                                onClick={handleCancelConfirm}
                                disabled={cancelling}
                                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
                            >
                                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subscription;