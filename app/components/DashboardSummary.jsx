"use client";

import { useState, useEffect, useRef } from 'react';
import { BoltIcon, TransportIcon, TrashCanIcon } from './Icons';

const SummaryCard = ({ title, value, unit, icon, colorClass }) => (
    <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass.bg}`}>
            <div className={colorClass.text}>{icon}</div>
        </div>
        <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800">
                {value} <span className="text-base font-medium">{unit}</span>
            </p>
        </div>
    </div>
);

export default function DashboardSummary({ supabase, user, dataVersion }) {
    const [summary, setSummary] = useState({
        total_electricity: 0,
        total_transport: 0,
        total_waste: 0,
        report_count: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let ignore = false;
    
        const fetchSummaryData = async () => {
            if (!user || ignore) return;
            setLoading(true);
            setError('');
    
            try {
                const { data, error: dbError } = await supabase
                    .from('carbon_entries')
                    .select('electricity_co2e, transport_co2e, waste_co2e')
                    .eq('user_id', user.id);
    
                if (dbError) throw dbError;
    
                if (data && !ignore) {
                    const totals = data.reduce((acc, entry) => {
                        acc.electricity += entry.electricity_co2e || 0;
                        acc.transport += entry.transport_co2e || 0;
                        acc.waste += entry.waste_co2e || 0;
                        return acc;
                    }, { electricity: 0, transport: 0, waste: 0 });
    
                    setSummary({
                        total_electricity: totals.electricity,
                        total_transport: totals.transport,
                        total_waste: totals.waste,
                        report_count: data.length,
                    });
                }
            } catch (err) {
                if (!ignore) {
                    console.error('Error fetching summary:', err);
                    setError(`Gagal memuat ringkasan: ${err.message}`);
                }
            } finally {
                if (!ignore) setLoading(false);
            }
        };
    
        fetchSummaryData();
    
        return () => { ignore = true; };
    }, [user, supabase, dataVersion]);    
    
    if (loading) {
        return <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            <div className="h-28 bg-slate-200 rounded-xl"></div>
            <div className="h-28 bg-slate-200 rounded-xl"></div>
            <div className="h-28 bg-slate-200 rounded-xl"></div>
        </div>
    }

    if (error) {
        return <div className="text-center p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>;
    }

    const totalAll = summary.total_electricity + summary.total_transport + summary.total_waste;

    return (
        <div>
            <div className="bg-white p-6 rounded-xl border shadow-sm mb-6">
                <p className="text-slate-500">Total Emisi Keseluruhan</p>
                <p className="text-4xl font-extrabold text-[#348567]">
                    {totalAll.toFixed(2)} <span className="text-2xl font-medium">ton CO₂e</span>
                </p>
                <p className="text-sm text-slate-500 mt-1">Dari {summary.report_count} laporan yang telah dibuat.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard
                    title="Total dari Listrik"
                    value={summary.total_electricity.toFixed(2)}
                    unit="ton CO₂e"
                    icon={<BoltIcon className="w-6 h-6" />}
                    colorClass={{ bg: 'bg-amber-100', text: 'text-amber-600' }}
                />
                <SummaryCard
                    title="Total dari Transportasi"
                    value={summary.total_transport.toFixed(2)}
                    unit="ton CO₂e"
                    icon={<TransportIcon className="w-8 h-8" />}
                    colorClass={{ bg: 'bg-blue-100', text: 'text-blue-800' }}
                />
                <SummaryCard
                    title="Total dari Limbah"
                    value={summary.total_waste.toFixed(2)}
                    unit="ton CO₂e"
                    icon={<TrashCanIcon className="w-6 h-6" />}
                    colorClass={{ bg: 'bg-red-100', text: 'text-red-600' }}
                />
            </div>
        </div>
    );
}