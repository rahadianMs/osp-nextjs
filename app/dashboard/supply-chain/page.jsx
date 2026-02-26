"use client";

import { useAuth } from '../../components/AuthProvider';
import SupplyChainPage from '../../components/SupplyChainPage';

export default function SupplyChainRoute() {
    const { user } = useAuth();

    return <SupplyChainPage user={user} />;
}
