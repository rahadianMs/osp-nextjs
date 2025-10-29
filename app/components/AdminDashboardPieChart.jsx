"use client";
// --- MODIFIKASI: Impor useState ---
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Palet warna
const COLORS = {
    'Scope 1': '#d97706', // Oranye
    'Scope 2': '#059669', // Hijau
    'Scope 3': '#2563eb', // Biru
};

// Teks deskripsi untuk tooltip
const SCOPE_DESCRIPTIONS = {
    'Scope 1': 'Emisi langsung dari sumber yang dimiliki atau dikendalikan perusahaan.',
    'Scope 2': 'Emisi tidak langsung dari pembangkitan listrik yang dibeli.',
    'Scope 3': 'Emisi tidak langsung lainnya dalam rantai nilai perusahaan (misalnya, limbah).',
};

// Fungsi untuk label persentase kustom
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text 
            x={x} 
            y={y} 
            fill="white" 
            textAnchor="middle" 
            dominantBaseline="central"
            fontSize={12}
            fontWeight="bold"
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};


// --- MODIFIKASI: Komponen Legend Kustom dengan Tooltip Kustom ---
const CustomLegend = ({ payload }) => {
    // State untuk melacak item yang sedang di-hover
    const [hoveredScope, setHoveredScope] = useState(null);

    return (
        <ul className="flex justify-center items-center gap-4 list-none p-0 mt-4">
            {payload.map((entry, index) => (
                <li 
                    key={`item-${index}`}
                    // Tambahkan event handler mouse
                    onMouseEnter={() => setHoveredScope(entry.value)}
                    onMouseLeave={() => setHoveredScope(null)}
                    // Tambahkan position:relative untuk positioning tooltip
                    className="flex items-center gap-2 relative" 
                >
                    {/* Kotak warna */}
                    <span 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    ></span>
                    {/* Teks Scope */}
                    <span className="text-sm text-slate-600">{entry.value}</span>

                    {/* --- INI ADALAH TOOLTIP KUSTOM --- */}
                    {/* Muncul hanya jika state hoveredScope cocok dengan item ini */}
                    {hoveredScope === entry.value && (
                        <div 
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 
                                       bg-slate-800 text-white text-xs 
                                       rounded-md shadow-lg w-60 z-10 
                                       pointer-events-none"
                            // w-60 (width 240px), sesuaikan jika perlu
                        >
                            {SCOPE_DESCRIPTIONS[entry.value] || ''}
                            
                            {/* Panah kecil di bawah tooltip */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 
                                        w-0 h-0 border-x-4 border-x-transparent 
                                        border-t-4 border-t-slate-800">
                            </div>
                        </div>
                    )}
                    {/* --- AKHIR TOOLTIP KUSTOM --- */}
                </li>
            ))}
        </ul>
    );
};
// --- AKHIR MODIFIKASI ---


export default function AdminDashboardPieChart({ supabase }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPieData = async () => {
            try {
                setLoading(true);
                const { data: rpcData, error } = await supabase.rpc('get_admin_pie_chart_data');
                if (error) throw error;
                
                const formattedData = rpcData
                    .map(item => ({
                        name: item.scope,
                        value: parseFloat(item.total_emissions)
                    }))
                    .filter(item => item.value > 0); 
                
                setData(formattedData);
            } catch (error) {
                console.error('Error fetching admin pie chart data:', error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPieData();
    }, [supabase]);

    if (loading) {
        return (
            <div className="p-6 bg-white rounded-xl shadow-md border h-96 animate-pulse flex items-center justify-center">
                <p className="text-slate-500">Memuat data distribusi...</p>
            </div>
        );
    }
    
    if (data.length === 0) {
        return (
             <div className="p-6 bg-white rounded-xl shadow-md border h-96 flex flex-col items-center justify-center">
                 <h3 className="text-xl font-bold text-slate-800 mb-6">Distribusi Emisi Keseluruhan (Scope 1, 2, 3)</h3>
                <p className="text-slate-500">Belum ada data emisi yang dilaporkan.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-xl shadow-md border">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Distribusi Emisi Keseluruhan (Scope 1, 2, 3)</h3>
            <div style={{ width: '100%', height: 320 }}>
                {/* Responsive container untuk PieChart */}
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={70}     
                            outerRadius={110}    
                            fill="#8884d8"
                            paddingAngle={5}     
                            cornerRadius={8}     
                            labelLine={false}    
                            label={renderCustomizedLabel}
                            isAnimationActive={false} // Perbaikan 'getar'
                        >
                            {data.map((entry) => (
                                <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} />
                            ))}
                        </Pie>

                        <Tooltip 
                           formatter={(value) => `${value.toLocaleString('id-ID', {maximumFractionDigits: 1})} kg CO2e`}
                           animationDuration={0} // Perbaikan 'getar'
                        />
                        {/* Menggunakan Legend Kustom */}
                        <Legend content={<CustomLegend />} verticalAlign="bottom" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}