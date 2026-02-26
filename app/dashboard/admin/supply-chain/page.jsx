"use client";

import { useAuth } from '../../../components/AuthProvider';
import AdminSupplyChainPage from '../../../components/AdminSupplyChainPage';

export default function AdminSupplyChainRoute() {
    const { isAdmin } = useAuth();

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-500">
                Akses Ditolak
            </div>
        );
    }

    return <AdminSupplyChainPage />;
}
