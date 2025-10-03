"use client";

import { useState, useEffect } from 'react';

const CATEGORY_CONFIG = {
    electricity_co2e: { name: 'Listrik', color: '#FBBF24' }, // Kuning
    transport_co2e: { name: 'Transportasi', color: '#60A5FA' }, // Biru
    waste_co2e: { name: 'Sampah', color: '#F87171' }, // Merah
};

// Komponen untuk potongan Pie Chart
const PieSlice = ({ percentage, color, radius, offset }) => {
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
        <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="30"
            strokeDasharray={strokeDasharray}
            transform={`rotate(${offset} 100 100)`}
            style={{ transition: 'stroke-dasharray 0.5s ease-in-out' }}
        />
    );
};

export default function DashboardPieChart({ supabase, user, dataVersion }) {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchChartData = async () => {
            if (!user) return;
            setLoading(true);

            try {
                const { data, error: dbError } = await supabase
                    .from('carbon_entries')
                    .select('electricity_co2e, transport_co2e, waste_co2e')
                    .eq('user_id', user.id);

                if (dbError) throw dbError;

                const totals = data.reduce((acc, entry) => {
                    acc.electricity_co2e += entry.electricity_co2e || 0;
                    acc.transport_co2e += entry.transport_co2e || 0;
                    acc.waste_co2e += entry.waste_co2e || 0;
                    return acc;
                }, { electricity_co2e: 0, transport_co2e: 0, waste_co2e: 0 });

                const grandTotal = totals.electricity_co2e + totals.transport_co2e + totals.waste_co2e;

                if (grandTotal > 0) {
                    setChartData({
                        electricity_co2e: (totals.electricity_co2e / grandTotal) * 100,
                        transport_co2e: (totals.transport_co2e / grandTotal) * 100,
                        waste_co2e: (totals.waste_co2e / grandTotal) * 100,
                    });
                } else {
                    setChartData(null); // Tidak ada data untuk ditampilkan
                }

            } catch (err) {
                 setError(`Gagal memuat grafik: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [user, supabase, dataVersion]);

    if (loading) {
        return <div className="h-80 w-full bg-slate-200 rounded-xl animate-pulse"></div>;
    }
     if (error) {
        return <div className="text-center p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>;
    }

    if (!chartData) {
         return (
            <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
                <h3 className="text-xl font-bold mb-2">Distribusi Emisi</h3>
                <p className="text-slate-500">Belum ada data emisi untuk divisualisasikan.</p>
            </div>
        );
    }

    let accumulatedOffset = -90; // Mulai dari atas
    const slices = Object.keys(chartData).map(key => {
        const percentage = chartData[key];
        const slice = {
            percentage,
            color: CATEGORY_CONFIG[key].color,
            offset: accumulatedOffset,
        };
        accumulatedOffset += (percentage / 100) * 360;
        return slice;
    });

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-bold mb-4">Distribusi Emisi Keseluruhan</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="relative w-48 h-48">
                    <svg viewBox="0 0 200 200" className="transform -rotate-90">
                        {slices.map((slice, i) => (
                             <PieSlice key={i} {...slice} radius="85" />
                        ))}
                    </svg>
                </div>
                <div className="flex flex-col gap-4">
                    {Object.keys(CATEGORY_CONFIG).map(key => (
                         <div key={key} className="flex items-center gap-3">
                             <div className="w-4 h-4 rounded" style={{ backgroundColor: CATEGORY_CONFIG[key].color }}></div>
                             <div>
                                 <span className="font-semibold text-slate-700">{CATEGORY_CONFIG[key].name}</span>
                                 <span className="ml-2 text-slate-500">{chartData[key].toFixed(1)}%</span>
                             </div>
                         </div>
                    ))}
                </div>
            </div>
        </div>
    );
}