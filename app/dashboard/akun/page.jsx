"use client";

import { useAuth } from '../../components/AuthProvider';
import AccountPage from '../../components/AccountPage';

export default function AkunRoute() {
    const { user } = useAuth();

    return <AccountPage user={user} />;
}
