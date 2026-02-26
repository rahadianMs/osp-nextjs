"use client";

import { useAuth } from '../../components/AuthProvider';
import { useDashboard } from '../components/DashboardContext';
import DashboardSummary from '../../components/DashboardSummary';
import DashboardPieChart from '../../components/DashboardPieChart';
import DashboardTrends from '../../components/DashboardTrends';
import AdminDashboardPage from '../../components/AdminDashboardPage';

export default function RingkasanPage() {
    const { user, isAdmin } = useAuth();
    const { dataVersion } = useDashboard();

    if (isAdmin) {
        return <AdminDashboardPage />;
    }

    return (
        <div className="space-y-8">
            <DashboardSummary user={user} dataVersion={dataVersion} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <DashboardTrends user={user} dataVersion={dataVersion} />
                <DashboardPieChart user={user} dataVersion={dataVersion} />
            </div>
        </div>
    );
}
