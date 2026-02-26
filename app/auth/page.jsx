"use client";

import { Suspense } from 'react';
import AuthPage from '../components/AuthPage';

// AuthPage uses useSearchParams, which requires a Suspense boundary
function AuthContent() {
    return <AuthPage />;
}

export default function AuthRoute() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-slate-500">Memuat...</div>
            </div>
        }>
            <AuthContent />
        </Suspense>
    );
}
