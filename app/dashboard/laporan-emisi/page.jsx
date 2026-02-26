"use client";

import { useAuth } from '../../components/AuthProvider';
import { useDashboard } from '../components/DashboardContext';
import EmissionReportPage from '../../components/EmissionReportPage';

export default function LaporanEmisiRoute() {
    const { user } = useAuth();
    const { onDataUpdate } = useDashboard();

    return <EmissionReportPage user={user} onDataUpdate={onDataUpdate} />;
}
