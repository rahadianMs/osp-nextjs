"use client";

import { useAuth } from '../../components/AuthProvider';
import SustainabilityPage from '../../components/SustainabilityPage';
import AdminSustainabilityPage from '../../components/AdminSustainabilityPage';

export default function LaporanKeberlanjutanRoute() {
    const { user, isAdmin } = useAuth();

    if (isAdmin) {
        return <AdminSustainabilityPage user={user} />;
    }

    return <SustainabilityPage user={user} />;
}
