"use client";

import { useAuth } from '../../../components/AuthProvider';
import AdminVerificationPage from '../../../components/AdminVerificationPage';

export default function AdminVerifikasiRoute() {
    const { isAdmin } = useAuth();

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-500">
                Akses Ditolak
            </div>
        );
    }

    return <AdminVerificationPage />;
}
