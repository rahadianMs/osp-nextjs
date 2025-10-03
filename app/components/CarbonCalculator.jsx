"use client";

import { useState } from 'react';

// Faktor emisi (dalam kg CO2e per unit).
const EMISSION_FACTORS = {
electricity: 0.85, // kg CO2e per kWh
transport: 0.17,   // kg CO2e per km (mobil bensin rata-rata)
waste: 0.55,       // kg CO2e per kg
};

const CATEGORIES = {
electricity: { name: 'Listrik', unit: 'kWh' },
transport: { name: 'Transportasi', unit: 'km' },
waste: { name: 'Sampah', unit: 'kg' },
}

// Perubahan: Prop setActiveDashboardPage diganti dengan onReportSaved
export default function CarbonCalculator({ supabase, user, onReportSaved }) {
const [activeCategory, setActiveCategory] = useState('electricity');
const [value, setValue] = useState('');
const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState('');

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!value || !reportMonth) {
        setMessage('Harap isi semua kolom yang diperlukan.');
        return;
    }
    setLoading(true);
    setMessage('');

    const numericValue = parseFloat(value) || 0;
    const total_co2e_kg = numericValue * EMISSION_FACTORS[activeCategory];

    const newEntry = {
        user_id: user.id,
        report_month: reportMonth,
        category: activeCategory,
        electricity_kwh: activeCategory === 'electricity' ? numericValue : 0,
        transport_km: activeCategory === 'transport' ? numericValue : 0,
        waste_kg: activeCategory === 'waste' ? numericValue : 0,
        total_co2e_kg,
        calculation_title: `${CATEGORIES[activeCategory].name} - ${new Date(reportMonth + '-02').toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`
    };

    const { error } = await supabase.from('carbon_entries').insert([newEntry]);

    if (error) {
        setMessage(`Error: ${error.message}`);
    } else {
        setMessage(`Sukses! Laporan ${CATEGORIES[activeCategory].name} telah disimpan.`);
        setValue('');
        // Panggil fungsi callback untuk memberitahu parent agar me-refresh data
        if (onReportSaved) {
            onReportSaved();
        }
        // Hapus pesan setelah 3 detik
        setTimeout(() => setMessage(''), 3000);
    }

    setLoading(false);
};

return (
    <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Input Laporan Emisi Karbon</h1>
        <div className="bg-white p-8 rounded-xl shadow-md border">
            <div className="flex border-b mb-6">
                {Object.keys(CATEGORIES).map(cat => (
                    <button
                        key={cat}
                        onClick={() => { setActiveCategory(cat); setValue(''); setMessage(''); }}
                        className={`px-4 py-3 font-semibold text-sm ${activeCategory === cat ? 'border-b-2 border-[#348567] text-[#348567]' : 'text-slate-500'}`}
                    >
                        {CATEGORIES[cat].name}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label htmlFor="report-month" className="block text-sm font-medium text-slate-700 mb-1">
                            Bulan Laporan
                        </label>
                        <input
                            type="month"
                            id="report-month"
                            value={reportMonth}
                            onChange={(e) => setReportMonth(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567]"
                        />
                    </div>
                    <div>
                        <label htmlFor="value" className="block text-sm font-medium text-slate-700 mb-1">
                            Jumlah Konsumsi / Produksi
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                id="value"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="0"
                                required
                                className="w-full pl-4 pr-16 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567]"
                            />
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-slate-500">
                                {CATEGORIES[activeCategory].unit}
                            </span>
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full py-3 text-base font-semibold text-white bg-[#348567] rounded-lg hover:bg-[#2A6A52] transition-colors disabled:bg-slate-400">
                    {loading ? 'Menyimpan...' : `Simpan Laporan ${CATEGORIES[activeCategory].name}`}
                </button>
            </form>
            {message && <p className="mt-4 text-sm text-center p-3 bg-emerald-50 text-emerald-700 rounded-lg">{message}</p>}
        </div>
    </div>
);

}