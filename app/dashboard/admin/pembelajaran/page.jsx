"use client";

import { useAuth } from '../../../components/AuthProvider';
import AdminLearningPage from '../../../components/AdminLearningPage';

export default function AdminPembelajaranRoute() {
    const { isAdmin } = useAuth();

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-500">
                Akses Ditolak
            </div>
        );
    }

    return <AdminLearningPage />;
}
