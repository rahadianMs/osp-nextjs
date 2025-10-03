"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmissionReportPage from './EmissionReportPage';
import DashboardChart from './DashboardChart';
import DashboardSummary from './DashboardSummary'; // <-- Impor komponen baru
import {
    HomeIcon, BellIcon, ChartPieIcon, BuildingOfficeIcon,
    DocumentChartBarIcon, PlusCircleIcon, AcademicCapIcon,
    QuestionMarkCircleIcon, UserCircleIcon
} from './Icons.jsx';

// Komponen PageContent dipisahkan
const PageContent = ({ activeDashboardPage, supabase, user, sidebarLinks, dataVersion, onDataUpdate }) => {
    switch (activeDashboardPage) {
        case 'beranda':
            return (
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold">Selamat datang kembali!</h1>
                    <p className="text-slate-600 mt-2">Anda masuk sebagai: <span className="font-mono text-sm bg-slate-200 p-1 rounded">{user?.email}</span></p>
                </div>
            );
        case 'dashboard-utama':
            // --- PERUBAHAN DI SINI ---
            return (
                <div className="space-y-8">
                    {/* Tambahkan komponen Summary di atas Chart */}
                    <DashboardSummary supabase={supabase} user={user} dataVersion={dataVersion} />
                    <DashboardChart supabase={supabase} user={user} dataVersion={dataVersion} />
                </div>
            );
        case 'laporan-emisi':
            return <EmissionReportPage supabase={supabase} user={user} onDataUpdate={onDataUpdate} />;

        default:
             return (
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md border text-center">
                    <h2 className="text-2xl font-bold mb-4">Halaman dalam Pengembangan</h2>
                    <p className="text-slate-500">Fitur untuk "{sidebarLinks.find(link => link.id === activeDashboardPage)?.text}" sedang kami siapkan.</p>
                </div>
            );
    }
};

// Komponen Dasbor Utama
export default function Dashboard({
    supabase,
    user,
    activeDashboardPage,
    setActiveDashboardPage,
    isUserMenuOpen,
    setIsUserMenuOpen,
    userMenuRef,
    handleLogout
}) {
    const [dataVersion, setDataVersion] = useState(Date.now());

    const handleDataUpdate = () => {
        setDataVersion(Date.now());
    };

    const sidebarLinks = [
        { id: 'beranda', text: 'Beranda', icon: <HomeIcon /> },
        { id: 'notifikasi', text: 'Notifikasi', icon: <BellIcon /> },
        { id: 'dashboard-utama', text: 'Dasbor Utama', icon: <ChartPieIcon /> },
        { id: 'profil-usaha', text: 'Profil Usaha', icon: <BuildingOfficeIcon /> },
        { id: 'laporan-emisi', text: 'Laporan Emisi', icon: <DocumentChartBarIcon /> },
        { id: 'sertifikasi', text: 'Sertifikasi', icon: <PlusCircleIcon /> },
        { id: 'pembelajaran', text: 'Pembelajaran', icon: <AcademicCapIcon /> },
        { id: 'panduan', text: 'Panduan', icon: <QuestionMarkCircleIcon /> },
    ];

    const pageTitle = sidebarLinks.find(link => link.id === activeDashboardPage)?.text || 'Dasbor';

    return (
        <div id="app-wrapper" className="flex min-h-screen">
            <aside className="fixed top-0 left-0 z-40 flex flex-col h-screen p-6 bg-white border-r w-64 border-slate-200">
                {/* ... (Isi sidebar tidak berubah) ... */}
            </aside>
            <div className="flex flex-col flex-1 w-full ml-64">
                <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-10 bg-white border-b border-slate-200">
                    {/* ... (Isi header tidak berubah) ... */}
                </header>
                <main className="flex-1 p-10 overflow-y-auto bg-slate-50">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeDashboardPage}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <PageContent
                                activeDashboardPage={activeDashboardPage}
                                supabase={supabase}
                                user={user}
                                sidebarLinks={sidebarLinks}
                                dataVersion={dataVersion}
                                onDataUpdate={handleDataUpdate}
                            />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}