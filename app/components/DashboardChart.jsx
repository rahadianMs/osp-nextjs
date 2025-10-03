"use client";

import { useState, useEffect } from 'react';

const CATEGORY_CONFIG = {
    electricity_co2e: { name: 'Listrik', color: '#FBBF24' },
    transport_co2e: { name: 'Transportasi', color: '#60A5FA' },
    waste_co2e: { name: 'Sampah', color: '#F87171' },
};

export default function DashboardChart({ supabase, user, dataVersion }) {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [maxValue, setMaxValue] = useState(100); // Default ke 100

    useEffect(() => {
        const fetchAndProcessData = async () => {
            if (!user) return;
            setLoading(true);
            setError('');

            try {
                const { data, error: dbError } = await supabase
                    .from('carbon_entries')
                    .select('report_month, electricity_co2e, transport_co2e, waste_co2e')
                    .eq('user_id', user.id)
                    .order('report_month', { ascending: true });

                if (dbError) throw dbError;

                if (!data || data.length === 0) {
                    setChartData([]);
                    setMaxValue(100);
                    setLoading(false);
                    return;
                }

                const formattedData = data.map(entry => ({
                    monthLabel: new Date(entry.report_month + '-02').toLocaleString('id-ID', { month: 'short', year: '2-digit' }),
                    electricity_co2e: entry.electricity_co2e || 0,
                    transport_co2e: entry.transport_co2e || 0,
                    waste_co2e: entry.waste_co2e || 0,
                }));

                const maxEmission = formattedData.reduce((max, monthData) => {
                    const monthMax = Math.max(monthData.electricity_co2e, monthData.transport_co2e, monthData.waste_co2e);
                    return Math.max(max, monthMax);
                }, 0);
                
                setMaxValue(Math.max(100, Math.ceil(maxEmission / 100) * 100));
                setChartData(formattedData);

            } catch (err) {
                console.error('Error in DashboardChart:', err);
                setError(`Terjadi kesalahan saat memuat grafik: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchAndProcessData();
    }, [user, supabase, dataVersion]);

    // Tampilan Loading dan Error
    if (loading) return <div className="h-96 bg-slate-200 rounded-lg animate-pulse"></div>;
    if (error) return <div className="text-center p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>;

    // Tampilan jika tidak ada data sama sekali
    if (chartData.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border w-full text-center">
                <h3 className="text-xl font-bold mb-2">Grafik Emisi Bulanan</h3>
                <p className="text-slate-500">Belum ada data laporan untuk ditampilkan di grafik.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border w-full">
            <h3 className="text-xl font-bold mb-1">Grafik Emisi Bulanan</h3>
            <p className="text-sm text-slate-500 mb-6">Perbandingan total emisi (kg CO2e) per kategori dari waktu ke waktu.</p>
            
            <div className="flex h-80">
                {/* Sumbu Y */}
                <div className="flex flex-col justify-between text-xs text-slate-500 pr-4 border-r">
                    <span>{maxValue}</span>
                    <span>{Math.round(maxValue * 0.75)}</span>
                    <span>{Math.round(maxValue * 0.5)}</span>
                    <span>{Math.round(maxValue * 0.25)}</span>
                    <span>0</span>
                </div>

                {/* Area Grafik */}
                <div className="relative flex-1 pl-4">
                    {/* Garis Latar */}
                    <div className="absolute top-0 left-4 right-0 h-full">
                        {[0.25, 0.5, 0.75].map(val => (
                            <div key={val} className="absolute w-full border-t border-dashed border-slate-200" style={{ bottom: `${val * 100}%` }}></div>
                        ))}
                    </div>

                    {/* Gambar SVG */}
                    <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {Object.keys(CATEGORY_CONFIG).map(categoryKey => {
                            // Jika data hanya 1, tampilkan sebagai titik-titik
                            if (chartData.length === 1) {
                                const d = chartData[0];
                                const y = maxValue > 0 ? 100 - (d[categoryKey] / maxValue) * 100 : 100;
                                return (
                                    <circle
                                        key={categoryKey}
                                        cx="50"
                                        cy={y}
                                        r="2"
                                        fill={CATEGORY_CONFIG[categoryKey].color}
                                    />
                                );
                            }
                            
                            // Jika data lebih dari 1, gambar garis
                            const points = chartData.map((d, i) => {
                                const x = (i / (chartData.length - 1)) * 100;
                                const y = maxValue > 0 ? 100 - (d[categoryKey] / maxValue) * 100 : 100;
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

            {/* Sumbu X */}
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