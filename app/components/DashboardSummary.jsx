"use client";

import { useState, useEffect } from 'react';
import { BoltIcon, TransportIcon, TrashCanIcon, FireIcon } from './Icons';

// Kartu ringkasan individual
const SummaryCard = ({ title, value, unit, icon, colorClass }) => (
    <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${colorClass.bg}`}>
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

// Komponen baru untuk frame Scope
const ScopeSection = ({ title, description, totalValue, children }) => (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <div className="border-b pb-4 mb-4">
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500">{description}</p>
            <p className="text-3xl font-extrabold text-[#348567] mt-2">
                {totalValue.toFixed(2)} <span className="text-xl font-medium">ton CO₂e</span>
            </p>
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

export default function DashboardSummary({ supabase, user, dataVersion }) {
    const [summary, setSummary] = useState({
        total_electricity: 0,
        total_transport: 0,
        total_waste: 0,
        total_non_electricity: 0, // State baru
        report_count: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSummaryData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const { data, error: dbError } = await supabase
                    .from('carbon_entries')
                    .select('electricity_co2e, transport_co2e, waste_co2e, non_electricity_co2e')
                    .eq('user_id', user.id);

                if (dbError) throw dbError;

                if (data) {
                    const totals = data.reduce((acc, entry) => {
                        acc.electricity += entry.electricity_co2e || 0;
                        acc.transport += entry.transport_co2e || 0;
                        acc.waste += entry.waste_co2e || 0;
                        acc.non_electricity += entry.non_electricity_co2e || 0;
                        return acc;
                    }, { electricity: 0, transport: 0, waste: 0, non_electricity: 0 });
    
                    setSummary({
                        total_electricity: totals.electricity,
                        total_transport: totals.transport,
                        total_waste: totals.waste,
                        total_non_electricity: totals.non_electricity,
                        report_count: data.length,
                    });
                }
            } catch (err) {
                setError(`Gagal memuat ringkasan: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchSummaryData();
    }, [user, supabase, dataVersion]);
    
    if (loading) {
        return <div className="animate-pulse h-64 bg-slate-200 rounded-xl"></div>
    }
    if (error) {
        return <div className="text-center p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>;
    }

    const scope1Total = summary.total_transport + summary.total_non_electricity;
    const scope2Total = summary.total_electricity;
    const scope3Total = summary.total_waste;
    const totalAll = scope1Total + scope2Total + scope3Total;

    return (
        <div>
            <div className="bg-white p-6 rounded-xl border shadow-sm mb-6">
                <p className="text-slate-500">Total Emisi Keseluruhan (Scope 1, 2, & 3)</p>
                <p className="text-4xl font-extrabold text-[#348567]">
                    {totalAll.toFixed(2)} <span className="text-2xl font-medium">ton CO₂e</span>
                </p>
                <p className="text-sm text-slate-500 mt-1">Dari {summary.report_count} laporan yang telah dibuat.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SCOPE 1 */}
                <ScopeSection 
                    title="Scope 1"
                    description="Emisi langsung dari sumber yang dimiliki atau dikendalikan perusahaan."
                    totalValue={scope1Total}
                >
                    <SummaryCard title="Transportasi" value={summary.total_transport.toFixed(2)} unit="ton CO₂e" icon={<TransportIcon className="w-8 h-8" />} colorClass={{ bg: 'bg-blue-100', text: 'text-blue-800' }} />
                    <SummaryCard title="Energi Non-Listrik" value={summary.total_non_electricity.toFixed(2)} unit="ton CO₂e" icon={<FireIcon />} colorClass={{ bg: 'bg-orange-100', text: 'text-orange-600' }} />
                </ScopeSection>

                {/* SCOPE 2 */}
                <ScopeSection 
                    title="Scope 2"
                    description="Emisi tidak langsung dari pembangkitan listrik yang dibeli."
                    totalValue={scope2Total}
                >
                    <SummaryCard title="Listrik" value={summary.total_electricity.toFixed(2)} unit="ton CO₂e" icon={<BoltIcon className="w-6 h-6" />} colorClass={{ bg: 'bg-amber-100', text: 'text-amber-600' }} />
                </ScopeSection>

                {/* SCOPE 3 */}
                <ScopeSection 
                    title="Scope 3"
                    description="Emisi tidak langsung lainnya dalam rantai nilai perusahaan (misalnya, limbah)."
                    totalValue={scope3Total}
                >
                    <SummaryCard title="Limbah" value={summary.total_waste.toFixed(2)} unit="ton CO₂e" icon={<TrashCanIcon className="w-6 h-6" />} colorClass={{ bg: 'bg-red-100', text: 'text-red-600' }} />
                </ScopeSection>
            </div>
        </div>
    );
}