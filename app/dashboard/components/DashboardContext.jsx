"use client";

import { createContext, useContext, useState, useCallback } from 'react';

const DashboardContext = createContext(null);

/**
 * Provides dashboard-specific state (dataVersion for cache invalidation)
 * to all dashboard sub-pages.
 */
export function DashboardProvider({ children }) {
    const [dataVersion, setDataVersion] = useState(Date.now());

    const handleDataUpdate = useCallback(() => {
        setDataVersion(Date.now());
    }, []);

    return (
        <DashboardContext.Provider value={{ dataVersion, onDataUpdate: handleDataUpdate }}>
            {children}
        </DashboardContext.Provider>
    );
}

/**
 * Hook to access dashboard context.
 */
export function useDashboard() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}
