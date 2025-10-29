"use client";
import { useState, useEffect } from 'react';
// --- MODIFIKASI: Impor LineChart dan Line ---
import { 
    LineChart, Line, XAxis, YAxis, 
    CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Helper untuk format bulan
const formatMonth = (monthStr) => {
    if (!monthStr) return "";
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
};

export default function AdminDashboardTrends({ supabase }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                setLoading(true);
                const { data: rpcData, error } = await supabase.rpc('get_admin_monthly_trends');
                
                if (error) throw error;
                
                const formattedData = rpcData.map(item => ({
                    name: formatMonth(item.report_month),
                    "Total Emisi": parseFloat(item.total_emissions),
                }));
                
                setData(formattedData);
            } catch (error) {
                console.error('Error fetching admin trends:', error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTrends();
    }, [supabase]);

    if (loading) {
        return (
            <div className="p-6 bg-white rounded-xl shadow-md border h-96 animate-pulse flex items-center justify-center">
                <p className="text-slate-500">Memuat data tren...</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-xl shadow-md border">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Tren Emisi per Bulan (6 Bulan Terakhir - Semua User)</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    {/* --- MODIFIKASI: Gunakan LineChart --- */}
                    <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} tickFormatter={(val) => `${val.toLocaleString('id-ID')}`} />
                        <Tooltip 
                            formatter={(value) => [`${value.toLocaleString('id-ID', {maximumFractionDigits: 1})} kg CO2e`, "Total Emisi"]} 
                        />
                        <Legend />
                        {/* --- MODIFIKASI: Gunakan Line --- */}
                        <Line 
                            type="monotone" 
                            dataKey="Total Emisi" 
                            stroke="#059669" // Warna hijau yang sama dengan dasbor user
                            strokeWidth={2} 
                            activeDot={{ r: 8 }} 
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}