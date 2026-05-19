import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';

const Subscription = () => {
    const { subscription, loading, error } = useSubscription();
    const navigate = useNavigate();

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

    // Error state
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

    // No subscription found
    if (!subscription) {
        return (
            <div className="p-4 sm:p-6 max-w-4xl mx-auto">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">No subscription found.</p>
                </div>
            </div>
        );
    }

    // Status banner config
    const getStatusBanner = () => {
        const status = subscription.status;
        const daysRemaining = subscription.daysRemaining;

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

            {/* Upgrade Button — now actually goes to /upgrade */}
            {showUpgradeButton && (
                <div className="mb-4 sm:mb-6">
                    <button
                        onClick={() => navigate('/upgrade')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 sm:px-6 rounded-lg shadow text-sm sm:text-base"
                    >
                        Choose Different Plan
                    </button>
                </div>
            )}

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
                </ul>
            </div>
        </div>
    );
};

export default Subscription;