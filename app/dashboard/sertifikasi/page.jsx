"use client";

import { useAuth } from '../../components/AuthProvider';
import SertifikasiPage from '../../components/SertifikasiPage';

export default function SertifikasiRoute() {
    const { user } = useAuth();

    return <SertifikasiPage user={user} />;
}
