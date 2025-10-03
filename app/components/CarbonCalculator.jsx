"use client";

import { useState } from 'react';

// Faktor emisi (dalam kg CO2e per unit)
const EMISSION_FACTORS = {
electricity: 0.85,    // kg CO2e per kWh
waste: 0.55,          // kg CO2e per kg
// Faktor emisi transportasi
transport: {
diesel: 0.16984,      // Mobil Diesel
petrol: 0.1645,       // Mobil Bensin
motorcycle: 0.11367   // Motor
}
};

// Konstanta untuk kalkulasi frekuensi
const WEEKS_IN_MONTH = 4.345;

export default function CarbonCalculator({ supabase, user, onReportSubmitted }) {
const [activeTab, setActiveTab] = useState('electricity');
const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState({ type: '', text: '' });

// State untuk setiap kategori
const [electricity, setElectricity] = useState('');
const [waste, setWaste] = useState('');
// State untuk daftar kendaraan (form dinamis)
const [vehicles, setVehicles] = useState([{ id: Date.now(), type: 'petrol', km: '', frequency: '' }]);

// --- Fungsi untuk mengelola daftar kendaraan ---

const handleAddVehicle = () => {
    setVehicles([...vehicles, { id: Date.now(), type: 'petrol', km: '', frequency: '' }]);
};

const handleRemoveVehicle = (id) => {
    setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
};

const handleVehicleChange = (id, field, value) => {
    setVehicles(vehicles.map(vehicle => 
        vehicle.id === id ? { ...vehicle, [field]: value } : vehicle
    ));
};

// --- Fungsi utama untuk submit data ---

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    let newEntryData = {
        user_id: user.id,
        report_month: reportMonth,
        category: activeTab,
    };

    let total_co2e_kg = 0;

    // Logika kalkulasi berdasarkan tab yang aktif
    if (activeTab === 'electricity') {
        const electricity_kwh = parseFloat(electricity) || 0;
        total_co2e_kg = electricity_kwh * EMISSION_FACTORS.electricity;
        newEntryData = { ...newEntryData, electricity_kwh };

    } else if (activeTab === 'waste') {
        const waste_kg = parseFloat(waste) || 0;
        total_co2e_kg = waste_kg * EMISSION_FACTORS.waste;
        newEntryData = { ...newEntryData, waste_kg };

    } else if (activeTab === 'transport') {
        let totalKmPerMonth = 0;
        vehicles.forEach(v => {
            const km = parseFloat(v.km) || 0;
            const frequency = parseFloat(v.frequency) || 0;
            const factor = EMISSION_FACTORS.transport[v.type] || 0;
            
            const vehicleMonthlyEmission = km * factor * frequency * WEEKS_IN_MONTH;
            total_co2e_kg += vehicleMonthlyEmission;
            totalKmPerMonth += km * frequency * WEEKS_IN_MONTH;
        });
        newEntryData = { 
            ...newEntryData, 
            transport_km: totalKmPerMonth,
            transport_details: vehicles // Simpan detail kendaraan ke kolom JSONB
        };
    }

    newEntryData.total_co2e_kg = total_co2e_kg;

    // Kirim data ke Supabase
    const { error } = await supabase.from('carbon_entries').insert([newEntryData]);

    if (error) {
        setMessage({ type: 'error', text: `Error: ${error.message}` });
    } else {
        setMessage({ type: 'success', text: `Sukses! Laporan ${activeTab} telah disimpan dengan total emisi ${total_co2e_kg.toFixed(2)} kg CO2e.` });
        // Reset form untuk tab yang aktif
        if (activeTab === 'electricity') setElectricity('');
        if (activeTab === 'waste') setWaste('');
        if (activeTab === 'transport') setVehicles([{ id: Date.now(), type: 'petrol', km: '', frequency: '' }]);
        
        if (onReportSubmitted) {
            onReportSubmitted(); // Panggil callback untuk refresh riwayat
        }
    }
    
    setLoading(false);
};

const renderForm = () => {
    switch (activeTab) {
        case 'electricity':
            return (
                <div>
                    <label htmlFor="electricity" className="block text-sm font-medium text-slate-700 mb-1">Total Konsumsi Listrik</label>
                    <div className="relative">
                        <input
                            type="number" id="electricity" value={electricity}
                            onChange={(e) => setElectricity(e.target.value)}
                            placeholder="0" required
                            className="w-full pl-4 pr-12 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567]"
                        />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-slate-500">kWh</span>
                    </div>
                </div>
            );
        case 'transport':
            return (
                <div className="space-y-4">
                    {vehicles.map((vehicle, index) => (
                        <div key={vehicle.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border rounded-lg bg-slate-50">
                            <div className="md:col-span-1">
                                <label className="block text-xs font-medium text-slate-600 mb-1">Jenis Kendaraan</label>
                                <select value={vehicle.type} onChange={(e) => handleVehicleChange(vehicle.id, 'type', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm">
                                    <option value="petrol">Mobil Bensin</option>
                                    <option value="diesel">Mobil Diesel</option>
                                    <option value="motorcycle">Motor</option>
                                </select>
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-xs font-medium text-slate-600 mb-1">Jarak Tempuh</label>
                                <input type="number" placeholder="0" value={vehicle.km} onChange={(e) => handleVehicleChange(vehicle.id, 'km', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
                                 <span className="text-xs text-slate-500">km / penggunaan</span>
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-xs font-medium text-slate-600 mb-1">Frekuensi</label>
                                <input type="number" placeholder="0" value={vehicle.frequency} onChange={(e) => handleVehicleChange(vehicle.id, 'frequency', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
                                 <span className="text-xs text-slate-500">kali / minggu</span>
                            </div>
                            <div className="md:col-span-1 flex justify-end">
                                {vehicles.length > 1 && (
                                    <button type="button" onClick={() => handleRemoveVehicle(vehicle.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Hapus</button>
                                )}
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddVehicle} className="w-full py-2 text-sm font-semibold text-[#348567] border-2 border-[#348567] rounded-lg hover:bg-emerald-50 transition-colors">
                        + Tambahkan Kendaraan
                    </button>
                </div>
            );
        case 'waste':
            return (
                <div>
                    <label htmlFor="waste" className="block text-sm font-medium text-slate-700 mb-1">Total Produksi Sampah</label>
                    <div className="relative">
                        <input
                            type="number" id="waste" value={waste}
                            onChange={(e) => setWaste(e.target.value)}
                            placeholder="0" required
                            className="w-full pl-4 pr-12 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567]"
                        />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-slate-500">kg</span>
                    </div>
                </div>
            );
        default: return null;
    }
};

return (
    <div className="bg-white p-8 rounded-xl shadow-md border">
        <h2 className="text-2xl font-bold mb-6">Input Laporan Emisi</h2>
        
        <form onSubmit={handleSubmit}>
            <div className="mb-6">
                <label htmlFor="reportMonth" className="block text-sm font-medium text-slate-700 mb-1">Periode Laporan</label>
                <input
                    type="month"
                    id="reportMonth"
                    value={reportMonth}
                    onChange={(e) => setReportMonth(e.target.value)}
                    className="w-full md:w-1/2 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567]"
                    required
                />
            </div>

            <div className="mb-6">
                <div className="flex border-b border-slate-200">
                    <button type="button" onClick={() => setActiveTab('electricity')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'electricity' ? 'border-b-2 border-[#348567] text-[#348567]' : 'text-slate-500'}`}>Listrik</button>
                    <button type="button" onClick={() => setActiveTab('transport')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'transport' ? 'border-b-2 border-[#348567] text-[#348567]' : 'text-slate-500'}`}>Transportasi</button>
                    <button type="button" onClick={() => setActiveTab('waste')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'waste' ? 'border-b-2 border-[#348567] text-[#348567]' : 'text-slate-500'}`}>Sampah</button>
                </div>
            </div>

            <div className="min-h-[200px] mb-6">
                {renderForm()}
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 text-base font-semibold text-white bg-[#348567] rounded-lg hover:bg-[#2A6A52] transition-colors disabled:bg-slate-400">
                {loading ? 'Menyimpan...' : `Simpan Laporan ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
            </button>
        </form>
        
        {message.text && (
             <p className={`mt-4 text-sm text-center p-3 rounded-lg ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
             </p>
        )}
    </div>
);

}