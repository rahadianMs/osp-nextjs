"use client";

import { useAuth } from '../../components/AuthProvider';
import ProfilUsahaPage from '../../components/ProfilUsahaPage';

export default function ProfilUsahaRoute() {
    const { user } = useAuth();

    return <ProfilUsahaPage user={user} />;
}
