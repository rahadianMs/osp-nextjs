"use client";

import { useState, useEffect } from 'react';
import { BoltIcon, TruckIcon, TrashCanIcon } from './Icons';

// Komponen untuk satu kotak summary
const SummaryCard = ({ title, value, icon, color }) => {
    return (
        <div className={`p-6 rounded-2xl shadow-sm border flex gap-6 items-center bg-white`}>
            <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${color.bg} ${color.text}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-3xl font-extrabold text-slate-800">
                    {value.toFixed(2)}
                </p>
                <p className="text-sm text-slate-500">kg CO2e</p>
            </div>
        </div>
    );
};

export default function DashboardSummary({ supabase, user, dataVersion }) {
    const [summary, setSummary] = useState({
        electricity: 0,
        transport: 0,
        waste: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummaryData = async () => {
            if (!user) return;
            setLoading(true);

            const { data, error } = await supabase
                .from('carbon_entries')
                .select('electricity_co2e, transport_co2e, waste_co2e')
                .eq('user_id', user.id);

            if (error) {
                console.error("Error fetching summary data:", error);
                setLoading(false);
                return;
            }
            
            if (Array.isArray(data)) {
                const totals = data.reduce((acc, entry) => {
                    acc.electricity += entry.electricity_co2e || 0;
                    acc.transport += entry.transport_co2e || 0;
                    acc.waste += entry.waste_co2e || 0;
                    return acc;
                }, { electricity: 0, transport: 0, waste: 0 });
                setSummary(totals);
            }
            
            setLoading(false);
        };

        fetchSummaryData();
    }, [user, supabase, dataVersion]);

    if (loading) {
        return <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-pulse">
            <div className="h-28 bg-slate-200 rounded-2xl"></div>
            <div className="h-28 bg-slate-200 rounded-2xl"></div>
            <div className="h-28 bg-slate-200 rounded-2xl"></div>
        </div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <SummaryCard 
                title="Total Emisi Listrik"
                value={summary.electricity}
                icon={<BoltIcon />}
                color={{ bg: 'bg-amber-100', text: 'text-amber-600' }}
            />
            <SummaryCard 
                title="Total Emisi Transportasi"
                value={summary.transport}
                icon={<TruckIcon />}
                color={{ bg: 'bg-sky-100', text: 'text-sky-600' }}
                // --- KESALAHAN SEBELUMNYA ADA DI BARIS INI, TANDA '>' SUDAH DIHAPUS ---
            />
            <SummaryCard 
                title="Total Emisi Sampah"
                value={summary.waste}
                icon={<TrashCanIcon />}
                color={{ bg: 'bg-rose-100', text: 'text-rose-600' }}
            />
        </div>
    );
}