"use client";
import { useState, useEffect } from 'react';

// --- MODIFIKASI: Menggunakan ikon yang ada dari Icons.jsx ---
import { 
    ChartPieIcon,      // Menggantikan ChartBarIcon
    BuildingOfficeIcon, // Menggantikan UsersIcon (untuk 'profil usaha')
    DocumentChartBarIcon // Menggantikan DocumentTextIcon (untuk 'laporan')
} from './Icons.jsx'; 
// --- AKHIR MODIFIKASI ---


const StatCard = ({ title, value, icon, unit }) => (
    <div className="p-6 bg-white rounded-xl shadow-md border flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-green-100 text-green-700 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-800">
                {value}
                {unit && <span className="text-base font-normal ml-1">{unit}</span>}
            </p>
        </div>
    </div>
);

export default function AdminDashboardSummary({ supabase }) {
    const [stats, setStats] = useState({ total_emissions: 0, total_users: 0, total_reports: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase.rpc('get_admin_summary_stats');
                
                if (error) throw error;
                if (data && data.length > 0) {
                    setStats(data[0]);
                }
            } catch (error) {
                console.error('Error fetching admin summary stats:', error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [supabase]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-6 bg-white rounded-xl shadow-md border animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
                        <div className="h-8 bg-slate-300 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
                title="Total Emisi Keseluruhan" 
                value={parseFloat(stats.total_emissions || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                unit="kg CO2e"
                // --- MODIFIKASI: Ikon diganti ---
                icon={<ChartPieIcon />}
            />
            <StatCard 
                title="Total Pengguna Terdaftar" 
                value={stats.total_users || 0}
                unit="Pengguna"
                // --- MODIFIKASI: Ikon diganti ---
                icon={<BuildingOfficeIcon />}
            />
            <StatCard 
                title="Total Laporan Dibuat" 
                value={stats.total_reports || 0}
                unit="Laporan"
                // --- MODIFIKASI: Ikon diganti ---
                icon={<DocumentChartBarIcon />}
            />
        </div>
    );
}