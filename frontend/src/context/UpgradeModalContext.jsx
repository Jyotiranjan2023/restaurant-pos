import { createContext, useContext, useState, useEffect } from 'react';
import { setUpgradeModalTrigger } from '../services/api';

/**
 * Global state for the upgrade modal.
 * Triggered by Axios 402 interceptor when feature is gated.
 */

const UpgradeModalContext = createContext(null);

export const UpgradeModalProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [gateInfo, setGateInfo] = useState(null);

    /**
     * Show the upgrade modal.
     * @param {object} info - { featureCode, currentPlan, suggestedPlan, message }
     */
    const showUpgradeModal = (info) => {
        setGateInfo(info);
        setIsOpen(true);
    };

    /**
     * Hide the upgrade modal.
     */
    const hideUpgradeModal = () => {
        setIsOpen(false);
        // Keep gateInfo briefly so closing animation doesn't show empty state
        setTimeout(() => setGateInfo(null), 300);
    };

    /**
     * Register the showUpgradeModal function with Axios on mount.
     * This is how Axios 402 interceptor triggers the modal.
     */
    useEffect(() => {
        setUpgradeModalTrigger(showUpgradeModal);
        
        // Cleanup on unmount
        return () => {
            setUpgradeModalTrigger(null);
        };
    }, []);

    return (
        <UpgradeModalContext.Provider
            value={{
                isOpen,
                gateInfo,
                showUpgradeModal,
                hideUpgradeModal,
            }}
        >
            {children}
        </UpgradeModalContext.Provider>
    );
};

/**
 * Hook to access upgrade modal state from any component.
 */
export const useUpgradeModal = () => {
    const context = useContext(UpgradeModalContext);
    if (!context) {
        throw new Error('useUpgradeModal must be used within UpgradeModalProvider');
    }
    return context;
};