"use client";

import { useAuth } from '../../components/AuthProvider';
import PembelajaranPage from '../../components/PembelajaranPage';

export default function PembelajaranRoute() {
    const { user, isAdmin } = useAuth();

    return <PembelajaranPage userRole={isAdmin ? 'admin' : 'user'} />;
}
