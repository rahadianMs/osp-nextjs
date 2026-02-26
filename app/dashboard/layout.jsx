"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { DashboardProvider } from './components/DashboardContext';

export default function DashboardLayout({ children }) {
    const { session, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        // Auth guard: redirect to login if not authenticated
        if (!loading && !session) {
            router.push('/auth?mode=login');
        }
    }, [session, loading, router]);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen w-full bg-slate-50">
                <h2 className="text-xl font-medium text-slate-600">Memuat data pengguna...</h2>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="flex items-center justify-center min-h-screen w-full bg-slate-50">
                <h2 className="text-xl font-medium text-slate-600">Mengalihkan ke halaman login...</h2>
            </div>
        );
    }

    return (
        <DashboardProvider>
            <div id="app-wrapper" className="flex min-h-screen">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="flex flex-col flex-1 w-full lg:ml-64">
                    <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} />
                    <main className="flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto bg-slate-50">
                        {children}
                    </main>
                </div>
            </div>
        </DashboardProvider>
    );
}
