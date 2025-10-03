"use client";

import { useState, useEffect } from 'react';

// Konfigurasi untuk setiap kategori emisi
const CATEGORY_CONFIG = {
electricity: { name: 'Listrik', color: '#FBBF24' }, // yellow-400
transport: { name: 'Transportasi', color: '#60A5FA' }, // blue-400
waste: { name: 'Sampah', color: '#F87171' }, // red-400
};

// Komponen untuk menampilkan grafik di dasbor
export default function DashboardChart({ supabase, user, dataVersion }) {
const [chartData, setChartData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [maxValue, setMaxValue] = useState(0);

useEffect(() => {
    const fetchAndProcessData = async () => {
        if (!user) return;

        setLoading(true);
        setError('');

        const { data, error } = await supabase
            .from('carbon_entries')
            .select('report_month, category, total_co2e_kg')
            .eq('user_id', user.id)
            .order('report_month', { ascending: true });

        if (error) {
            console.error('Error fetching chart data:', error);
            setError(`Gagal memuat data grafik: ${error.message}`);
            setLoading(false);
            return;
        }

        // --- Proses data untuk grafik garis ---
        const processedData = {};

        data.forEach(entry => {
            const { report_month, category, total_co2e_kg } = entry;
            
            if (!processedData[report_month]) {
                processedData[report_month] = {
                    monthLabel: new Date(report_month + '-02').toLocaleString('id-ID', { month: 'short', year: '2-digit' }),
                    electricity: 0,
                    transport: 0,
                    waste: 0,
                };
            }
            
            if (category && processedData[report_month][category] !== undefined) {
                processedData[report_month][category] += total_co2e_kg;
            }
        });

        const chartDataArray = Object.values(processedData);
        setChartData(chartDataArray);

        // Cari nilai emisi maksimum untuk skala Y-axis
        const maxEmission = chartDataArray.reduce((max, monthData) => {
            const monthMax = Math.max(monthData.electricity, monthData.transport, monthData.waste);
            return Math.max(max, monthMax);
        }, 0);
        
        // Atur nilai maksimum dengan sedikit padding, minimal 100
        setMaxValue(Math.max(100, Math.ceil(maxEmission / 100) * 100));

        setLoading(false);
    };

    fetchAndProcessData();
}, [user, supabase, dataVersion]); // Tambahkan dataVersion ke dependency array

if (loading) {
    return <div className="text-center p-4">Memuat data grafik...</div>;
}

if (error) {
    return <div className="text-center p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>;
}

if (chartData.length < 2) {
    return (
        <div className="text-center p-8 bg-white rounded-lg shadow-sm border">
            <h3 className="text-xl font-bold mb-2">Grafik Emisi Bulanan</h3>
            <p className="text-slate-500">Data tidak cukup untuk menampilkan grafik garis. Dibutuhkan minimal 2 bulan laporan.</p>
        </div>
    );
}

// --- Render Grafik Garis ---
return (
    <div className="bg-white p-6 rounded-lg shadow-sm border w-full">
        <h3 className="text-xl font-bold mb-1">Grafik Emisi Bulanan</h3>
        <p className="text-sm text-slate-500 mb-6">Perbandingan total emisi (kg CO2e) per kategori dari waktu ke waktu.</p>
        
        <div className="flex h-80">
            {/* Sumbu Y (Nilai) */}
            <div className="flex flex-col justify-between text-xs text-slate-500 pr-4 border-r">
                <span>{maxValue}</span>
                <span>{Math.round(maxValue * 0.75)}</span>
                <span>{Math.round(maxValue * 0.5)}</span>
                <span>{Math.round(maxValue * 0.25)}</span>
                <span>0</span>
            </div>

            {/* Area Grafik */}
            <div className="relative flex-1 pl-4">
                {/* Garis Latar Belakang */}
                <div className="absolute top-0 left-4 right-0 h-full">
                    {[0.25, 0.5, 0.75].map(val => (
                        <div key={val} className="absolute w-full border-t border-dashed border-slate-200" style={{ bottom: `${val * 100}%` }}></div>
                    ))}
                </div>

                {/* Path SVG untuk setiap kategori */}
                <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {Object.keys(CATEGORY_CONFIG).map(categoryKey => {
                        const points = chartData.map((d, i) => {
                            const x = (i / (chartData.length - 1)) * 100;
                            const y = 100 - (d[categoryKey] / maxValue) * 100;
                            return `${x},${y}`;
                        }).join(' ');

                        return (
                            <polyline
                                key={categoryKey}
                                fill="none"
                                stroke={CATEGORY_CONFIG[categoryKey].color}
                                strokeWidth="2"
                                points={points}
                                style={{ vectorEffect: 'non-scaling-stroke' }}
                            />
                        );
                    })}
                </svg>
            </div>
        </div>

        {/* Sumbu X (Bulan) */}
        <div className="flex justify-around text-xs text-slate-600 mt-2 ml-10">
            {chartData.map((data, index) => (
                <span key={index}>{data.monthLabel}</span>
            ))}
        </div>

         {/* Legenda */}
         <div className="flex justify-center items-center gap-6 mt-6">
            {Object.keys(CATEGORY_CONFIG).map(key => (
                <div key={key} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_CONFIG[key].color }}></span>
                    <span className="text-sm text-slate-600">{CATEGORY_CONFIG[key].name}</span>
                </div>
            ))}
        </div>
    </div>
);

}