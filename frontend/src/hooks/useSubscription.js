import { useState, useEffect } from 'react';
import subscriptionService from '../services/subscriptionService';

/**
 * Custom hook to fetch current tenant's subscription.
 * 
 * Returns:
 *   - subscription: subscription data object (or null)
 *   - loading: true while fetching
 *   - error: error message string (or null)
 *   - refetch: function to manually re-fetch
 */
export const useSubscription = () => {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSubscription = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await subscriptionService.getMySubscription();
            
            if (response.success) {
                setSubscription(response.data);
            } else {
                setError(response.message || 'Failed to load subscription');
            }
        } catch (err) {
            console.error('Failed to fetch subscription:', err);
            setError(err.response?.data?.message || 'Failed to load subscription');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscription();
    }, []);

    return {
        subscription,
        loading,
        error,
        refetch: fetchSubscription,
    };
};