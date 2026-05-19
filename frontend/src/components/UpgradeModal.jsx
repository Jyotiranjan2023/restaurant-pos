import { useUpgradeModal } from '../context/UpgradeModalContext';
import { useNavigate } from 'react-router-dom';

/**
 * Modal shown when a tenant tries to access a feature not included in their plan.
 * Triggered automatically by Axios 402 interceptor.
 */
const UpgradeModal = () => {
    const { isOpen, gateInfo, hideUpgradeModal } = useUpgradeModal();
    const navigate = useNavigate();

    if (!isOpen || !gateInfo) return null;

    // Map feature codes to human-readable names
    const getFeatureName = (code) => {
        const names = {
            'has_inventory': 'Inventory Management',
            'has_recipes': 'Recipes',
            'has_coupons': 'Coupons & Discounts',
            'has_kitchen_display': 'Kitchen Display',
            'has_feedback': 'Customer Feedback',
            'has_csv_export': 'CSV Data Export',
            'has_all_reports': 'Advanced Reports',
            'has_email_notifications': 'Email Notifications',
            'has_whatsapp_notifications': 'WhatsApp Notifications',
            'has_custom_branding': 'Custom Branding',
            'has_logo_upload': 'Logo Upload',
            'has_api_access': 'API Access',
            'has_priority_support': 'Priority Support',
            'max_staff': 'More Staff Members',
            'max_menu_items': 'More Menu Items',
            'max_tables': 'More Tables',
            'max_orders_per_month': 'More Monthly Orders',
            'max_categories': 'More Categories',
            'subscription_suspended': 'Account Access',
            'subscription_cancelled': 'Account Access',
        };
        return names[code] || 'This Feature';
    };

    // Check if this is a suspension/cancellation (different UX)
    const isAccessIssue = ['subscription_suspended', 'subscription_cancelled'].includes(gateInfo.featureCode);

   const handleUpgrade = () => {
    hideUpgradeModal();
    navigate('/upgrade');   // ← changed
};

    const handleMaybeLater = () => {
        hideUpgradeModal();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50"
                onClick={handleMaybeLater}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
                
                {/* Header */}
                <div className={`px-6 py-4 ${isAccessIssue ? 'bg-red-500' : 'bg-gradient-to-r from-orange-500 to-orange-600'} text-white`}>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">
                            {isAccessIssue ? '🔒' : '⭐'}
                        </span>
                        <div>
                            <h2 className="text-xl font-bold">
                                {isAccessIssue ? 'Account Suspended' : 'Upgrade Required'}
                            </h2>
                            <p className="text-sm opacity-90">
                                {isAccessIssue ? 'Please renew to continue' : `${getFeatureName(gateInfo.featureCode)}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                    {/* Message */}
                    <p className="text-gray-700 mb-4">
                        {gateInfo.message}
                    </p>

                    {/* Plan info */}
                    {!isAccessIssue && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Current Plan:</span>
                                <span className="font-semibold text-gray-900">
                                    {gateInfo.currentPlan || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Recommended:</span>
                                <span className="font-semibold text-orange-600">
                                    {gateInfo.suggestedPlan || 'Pro'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Benefits hint */}
                    {!isAccessIssue && (
                        <div className="text-sm text-gray-600 mb-4">
                            <p className="font-medium mb-2">Upgrade to unlock:</p>
                            <ul className="space-y-1 text-gray-600">
                                <li>✓ {getFeatureName(gateInfo.featureCode)}</li>
                                <li>✓ Higher limits on staff, menu, and orders</li>
                                <li>✓ All Pro features included</li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-4 bg-gray-50 flex gap-3 border-t border-gray-200">
                    <button
                        onClick={handleMaybeLater}
                        className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100"
                    >
                        Maybe Later
                    </button>
                    <button
                        onClick={handleUpgrade}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-white font-medium ${
                            isAccessIssue 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-orange-500 hover:bg-orange-600'
                        }`}
                    >
                        {isAccessIssue ? 'Renew Now' : 'Upgrade Now'} 
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;