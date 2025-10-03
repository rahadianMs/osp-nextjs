"use client";

import { useState } from 'react';

// Faktor emisi (dalam kg CO2e per unit)
const EMISSION_FACTORS = {
    electricity: 0.85,    // kg CO2e per kWh
    waste: {
        organic: 0.5,       // kg CO2e per kg
        plastic: 1.8,       // kg CO2e per kg
        paper: 0.9,         // kg CO2e per kg
        glass: 0.3,         // kg CO2e per kg
        metal: 1.2,         // kg CO2e per kg
        other: 0.55         // kg CO2e per kg (default)
    },
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
    const [vehicles, setVehicles] = useState([{ id: Date.now(), type: 'petrol', km: '', frequency: '', quantity: 1 }]);
    const [wasteItems, setWasteItems] = useState([{ id: Date.now(), type: 'organic', weight: '' }]);


    // --- Fungsi untuk mengelola daftar kendaraan ---
    const handleAddVehicle = () => {
        setVehicles([...vehicles, { id: Date.now(), type: 'petrol', km: '', frequency: '', quantity: 1 }]);
    };

    const handleRemoveVehicle = (id) => {
        setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
    };

    const handleVehicleChange = (id, field, value) => {
        setVehicles(vehicles.map(vehicle =>
            vehicle.id === id ? { ...vehicle, [field]: value } : vehicle
        ));
    };

    // --- Fungsi untuk mengelola daftar sampah ---
    const handleAddWasteItem = () => {
        setWasteItems([...wasteItems, { id: Date.now(), type: 'organic', weight: '' }]);
    };

    const handleRemoveWasteItem = (id) => {
        setWasteItems(wasteItems.filter(item => item.id !== id));
    };

    const handleWasteChange = (id, field, value) => {
        setWasteItems(wasteItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };


    // --- Fungsi utama untuk submit data ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        // 1. Cek apakah laporan untuk bulan ini sudah ada
        const { data: existingEntry, error: fetchError } = await supabase
            .from('carbon_entries')
            .select('*')
            .eq('user_id', user.id)
            .eq('report_month', reportMonth)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = baris tidak ditemukan, itu bukan error
            setMessage({ type: 'error', text: `Gagal memeriksa data: ${fetchError.message}` });
            setLoading(false);
            return;
        }

        // 2. Siapkan data baru berdasarkan data yang sudah ada (jika ada)
        let newData = existingEntry ? { ...existingEntry } : {
            user_id: user.id,
            report_month: reportMonth,
            electricity_co2e: 0,
            transport_co2e: 0,
            waste_co2e: 0,
        };

        // 3. Hitung emisi untuk tab yang aktif dan perbarui data
        if (activeTab === 'electricity') {
            const kwh = parseFloat(electricity) || 0;
            newData.electricity_co2e = kwh * EMISSION_FACTORS.electricity;
            newData.electricity_details = { kwh };
        } else if (activeTab === 'waste') {
            let totalWasteCo2e = 0;
            wasteItems.forEach(item => {
                const weight = parseFloat(item.weight) || 0;
                const factor = EMISSION_FACTORS.waste[item.type] || 0;
                totalWasteCo2e += weight * factor;
            });
            newData.waste_co2e = totalWasteCo2e;
            newData.waste_details = wasteItems;
        } else if (activeTab === 'transport') {
            let totalTransportCo2e = 0;
            vehicles.forEach(v => {
                const km = parseFloat(v.km) || 0;
                const frequency = parseFloat(v.frequency) || 0;
                const quantity = parseInt(v.quantity, 10) || 1;
                const factor = EMISSION_FACTORS.transport[v.type] || 0;
                totalTransportCo2e += km * factor * frequency * WEEKS_IN_MONTH * quantity;
            });
            newData.transport_co2e = totalTransportCo2e;
            newData.transport_details = vehicles;
        }

        // 4. Hitung ulang total emisi gabungan
        newData.total_co2e_kg = (newData.electricity_co2e || 0) + (newData.transport_co2e || 0) + (newData.waste_co2e || 0);

        // 5. Buat judul laporan bulanan
        const monthDate = new Date(reportMonth + '-02');
        const monthName = monthDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
        newData.calculation_title = `Laporan Emisi - ${monthName}`;

        // 6. Lakukan UPDATE jika ada, atau INSERT jika tidak ada
        let submissionError;
        if (existingEntry) {
            // Hapus properti yang tidak perlu diupdate
            delete newData.created_at; 
            const { error } = await supabase.from('carbon_entries').update(newData).eq('id', existingEntry.id);
            submissionError = error;
        } else {
            const { error } = await supabase.from('carbon_entries').insert(newData);
            submissionError = error;
        }

        if (submissionError) {
            setMessage({ type: 'error', text: `Gagal menyimpan laporan: ${submissionError.message}` });
        } else {
            setMessage({ type: 'success', text: `Sukses! Data ${activeTab} untuk ${monthName} telah disimpan.` });
            // Reset form
            if (activeTab === 'electricity') setElectricity('');
            if (activeTab === 'waste') setWasteItems([{ id: Date.now(), type: 'organic', weight: '' }]);
            if (activeTab === 'transport') setVehicles([{ id: Date.now(), type: 'petrol', km: '', frequency: '', quantity: 1 }]);
            
            if (onReportSubmitted) {
                onReportSubmitted();
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
                        {vehicles.map((vehicle) => (
                            <div key={vehicle.id} className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end p-4 border rounded-lg bg-slate-50">
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
                                     <span className="text-xs text-slate-500">Total penggunaan/minggu</span>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Jumlah</label>
                                    <input type="number" placeholder="1" min="1" value={vehicle.quantity} onChange={(e) => handleVehicleChange(vehicle.id, 'quantity', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
                                     <span className="text-xs text-slate-500">unit</span>
                                </div>
                                <div className="col-span-2 md:col-span-1 flex justify-end">
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
                    <div className="space-y-4">
                        {wasteItems.map((item) => (
                            <div key={item.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 border rounded-lg bg-slate-50">
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Jenis Sampah</label>
                                    <select value={item.type} onChange={(e) => handleWasteChange(item.id, 'type', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm">
                                        <option value="organic">Sampah Organik</option>
                                        <option value="plastic">Plastik</option>
                                        <option value="paper">Kertas</option>
                                        <option value="glass">Kaca</option>
                                        <option value="metal">Logam</option>
                                        <option value="other">Lainnya</option>
                                    </select>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Berat Sampah</label>
                                    <div className="relative">
                                        <input type="number" placeholder="0" value={item.weight} onChange={(e) => handleWasteChange(item.id, 'weight', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm pr-10" />
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-500">kg</span>
                                    </div>
                                </div>
                                <div className="md:col-span-1 flex justify-end">
                                    {wasteItems.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveWasteItem(item.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Hapus</button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddWasteItem} className="w-full py-2 text-sm font-semibold text-[#348567] border-2 border-[#348567] rounded-lg hover:bg-emerald-50 transition-colors">
                            + Tambah Jenis Sampah
                        </button>
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