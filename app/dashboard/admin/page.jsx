"use client";

import { useAuth } from '../../components/AuthProvider';
import AdminDashboardPage from '../../components/AdminDashboardPage';

export default function AdminDashboardRoute() {
    const { isAdmin } = useAuth();

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-500">
                Akses Ditolak
            </div>
        );
    }

    return <AdminDashboardPage />;
}
