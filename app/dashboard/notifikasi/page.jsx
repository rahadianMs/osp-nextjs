"use client";

import { useAuth } from '../../components/AuthProvider';
import NotificationPage from '../../components/NotificationPage';
import AdminNotificationPage from '../../components/AdminNotificationPage';

export default function NotifikasiRoute() {
    const { user, isAdmin } = useAuth();

    if (isAdmin) {
        return <AdminNotificationPage />;
    }

    return <NotificationPage user={user} />;
}
