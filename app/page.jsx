"use client";

import { useAuth } from './components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LandingPage from './components/LandingPage';

export default function HomePage() {
    const { session, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If user is already logged in, redirect to dashboard
        if (!loading && session) {
            router.push('/dashboard');
        }
    }, [session, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-slate-500">Memuat Aplikasi...</div>
            </div>
        );
    }

    // If user is logged in, show loading while redirect happens
    if (session) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-slate-500">Mengalihkan ke dasbor...</div>
            </div>
        );
    }

    return (
        <div className="font-sans bg-slate-50 text-slate-800">
            <LandingPage />
        </div>
    );
}