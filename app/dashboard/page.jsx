"use client";

import { useAuth } from '../components/AuthProvider';
import { useDashboard } from './components/DashboardContext';
import BerandaPage from '../components/BerandaPage';
import AdminDashboardPage from '../components/AdminDashboardPage';

export default function DashboardHomePage() {
    const { user, isAdmin, userProfile } = useAuth();
    const { dataVersion } = useDashboard();

    if (isAdmin) {
        return <AdminDashboardPage />;
    }

    return (
        <BerandaPage
            user={user}
            dataVersion={dataVersion}
            initialBusinessName={userProfile?.businessName}
        />
    );
}
