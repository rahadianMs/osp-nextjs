"use client";

import { useState } from 'react';
import { LinkIcon, PlusCircleIcon, TrashIcon } from './Icons';

// --- DATA FAKTOR EMISI (Tetap sama) ---
const ELECTRICITY_EMISSION_FACTORS = {
    "DKI Jakarta": { factor: 0.00080 },
    "Jawa Barat": { factor: 0.00080 },
    "Banten": { factor: 0.00080 },
    "Jawa Tengah": { factor: 0.00080 },
    "DI Yogyakarta": { factor: 0.00080 },
    "Jawa Timur": { factor: 0.00080 },
    "Bali": { factor: 0.00052 },
    "Sumatera Utara": { factor: 0.00077 },
    "Sumatera Selatan": { factor: 0.00077 },
    "Sumatera Barat": { factor: 0.00077 },
    "Riau": { factor: 0.00077 },
    "Sulawesi Selatan": { factor: 0.00073 },
    "Sulawesi Utara": { factor: 0.00067 },
    "Gorontalo": { factor: 0.00067 },
    "Kalimantan Selatan": { factor: 0.00120 },
    "Kalimantan Barat": { factor: 0.00167 },
    "Kalimantan Timur": { factor: 0.00112 },
    "Papua": { factor: 0.00050 },
    "Maluku": { factor: 0.00065 },
    "Kepulauan Riau": { factor: 0.00076 },
    "Nusa Tenggara Barat": { factor: 0.00127 },
    "Papua Barat": { factor: 0.00056 },
    "Sulawesi Tenggara": { factor: 0.00087 },
    "Kepulauan Bangka Belitung": { factor: 0.00104 },
    "Nusa Tenggara Timur": { factor: 0.00079 },
    "Maluku Utara": { factor: 0.00042 },
    "Bengkulu": { factor: 0.00070 },
};

const NON_ELECTRIC_EMISSION_FACTORS = {
    diesel_mineral: { name: 'Diesel (100% mineral diesel)', factor: 0.00266155, unit: 'liter' },
    diesel_biofuel: { name: 'Diesel (average biofuel blend)', factor: 0.00251279, unit: 'liter' },
    fuel_oil: { name: 'Fuel oil', factor: 0.00317493, unit: 'liter' },
    lpg: { name: 'LPG (Liquefied Petroleum Gas)', factor: 0.00155713, unit: 'liter' },
    natural_gas: { name: 'Natural gas', factor: 0.00204542, unit: 'cubic meter' },
    cng: { name: 'CNG (Compressed Natural Gas)', factor: 0.00044942, unit: 'liter' },
    lng: { name: 'LNG (Liquefied Natural Gas)', factor: 0.00117216, unit: 'liter' },
    propane: { name: 'Propane', factor: 0.00154357, unit: 'liter' }
};

const WASTE_EMISSION_FACTORS = {
    food_waste: { name: 'Limbah makanan & minuman', treatments: { recycled: null, combustion: 0.00641061, composting: 0.00888386, landfill: 0.70020961 } },
    garden_waste: { name: 'Limbah taman', treatments: { recycled: 0.00641061, combustion: 0.00641061, composting: 0.00888386, landfill: 0.64660632 } },
    plastic: { name: 'Plastik', treatments: { recycled: 0.00641061, combustion: 0.00641061, composting: null, landfill: 0.00888386 } },
    paper_cardboard: { name: 'Kertas dan Karton', treatments: { recycled: 0.00641061, combustion: 0.00641061, composting: 0.00888386, landfill: 1.16439015 } },
    metal: { name: 'Logam', treatments: { recycled: 0.00641061, combustion: 0.00641061, composting: null, landfill: 0.00888386 } },
    glass: { name: 'Kaca', treatments: { recycled: 0.00641061, combustion: 0.00641061, composting: null, landfill: 0.00888386 } },
    electronics: { name: 'Alat Elektronik', treatments: { recycled: 0.00641061, combustion: 0.00641061, composting: null, landfill: 0.00888386 } },
    fabric: { name: 'Kain', treatments: { recycled: 0.00641061, combustion: 0.00641061, composting: 0.49668303, landfill: null } },
};

const WASTE_TREATMENTS = {
    recycled: 'Didaur ulang',
    combustion: 'Pembakaran untuk energi',
    composting: 'Pengomposan',
    landfill: 'Tempat Pembuangan Akhir (TPA)'
};

const TRANSPORT_EMISSION_FACTORS = {
    diesel: 0.00016984, petrol: 0.0001645, motorcycle: 0.00011367
};

export default function CarbonCalculator({ supabase, user, onReportSubmitted }) {
    const [activeTab, setActiveTab] = useState('electricity');
    const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [calculationResult, setCalculationResult] = useState(null);

    // State Data Form
    const [electricity, setElectricity] = useState({ kwh: '', location: 'DKI Jakarta', area: '', occupiedNights: '' });
    const [nonElectricEnergy, setNonElectricEnergy] = useState([{ id: Date.now(), type: 'diesel_mineral', usage: '', frequency: '' }]);
    const [vehicles, setVehicles] = useState([{ id: Date.now(), type: 'petrol', km: '', frequency: '' }]);
    const [wasteItems, setWasteItems] = useState([{ id: Date.now(), type: 'food_waste', treatment: 'landfill', weight: '' }]);

    // State untuk Evidence (Bukti)
    const [evidenceLinks, setEvidenceLinks] = useState([{ id: Date.now(), url: '', description: '' }]);

    // Handlers Listrik
    const handleElectricityChange = (field, value) => setElectricity(prev => ({ ...prev, [field]: value }));

    // Handlers Non-Listrik
    const handleAddNonElectricEnergy = () => setNonElectricEnergy([...nonElectricEnergy, { id: Date.now(), type: 'diesel_mineral', usage: '', frequency: '' }]);
    const handleRemoveNonElectricEnergy = (id) => setNonElectricEnergy(nonElectricEnergy.filter(e => e.id !== id));
    const handleNonElectricEnergyChange = (id, field, value) => setNonElectricEnergy(nonElectricEnergy.map(e => e.id === id ? { ...e, [field]: value } : e));

    // Handlers Kendaraan
    const handleAddVehicle = () => setVehicles([...vehicles, { id: Date.now(), type: 'petrol', km: '', frequency: '' }]);
    const handleRemoveVehicle = (id) => setVehicles(vehicles.filter(v => v.id !== id));
    const handleVehicleChange = (id, field, value) => setVehicles(vehicles.map(v => v.id === id ? { ...v, [field]: value } : v));
    
    // Handlers Limbah
    const handleAddWasteItem = () => setWasteItems([...wasteItems, { id: Date.now(), type: 'food_waste', treatment: 'landfill', weight: '' }]);
    const handleRemoveWasteItem = (id) => setWasteItems(wasteItems.filter(i => i.id !== id));
    const handleWasteChange = (id, field, value) => {
        setWasteItems(wasteItems.map(item => {
            if (item.id === id) {
                const newItem = { ...item, [field]: value };
                if (field === 'type') {
                    const firstValidTreatment = Object.keys(WASTE_EMISSION_FACTORS[value].treatments).find(
                        key => WASTE_EMISSION_FACTORS[value].treatments[key] !== null
                    );
                    newItem.treatment = firstValidTreatment || '';
                }
                return newItem;
            }
            return item;
        }));
    };

    // Handlers Evidence Links
    const handleAddLink = () => setEvidenceLinks([...evidenceLinks, { id: Date.now(), url: '', description: '' }]);
    const handleRemoveLink = (id) => setEvidenceLinks(evidenceLinks.filter(l => l.id !== id));
    const handleLinkChange = (id, field, value) => setEvidenceLinks(evidenceLinks.map(l => l.id === id ? { ...l, [field]: value } : l));

    // Reset form evidence saat ganti tab
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCalculationResult(null);
        setMessage({ type: '', text: '' });
        setEvidenceLinks([{ id: Date.now(), url: '', description: '' }]); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        setCalculationResult(null);

        // 1. Cek data yang sudah ada
        const { data: existingEntry, error: fetchError } = await supabase
            .from('carbon_entries').select('*').eq('user_id', user.id).eq('report_month', reportMonth).single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            setMessage({ type: 'error', text: `Gagal memeriksa data: ${fetchError.message}` });
            setLoading(false);
            return;
        }

        // 2. Siapkan objek data baru
        let newData = existingEntry ? { ...existingEntry } : { user_id: user.id, report_month: reportMonth, electricity_co2e: 0, non_electricity_co2e: 0, transport_co2e: 0, waste_co2e: 0 };

        // 3. Hitung emisi sesuai Tab yang aktif
        if (activeTab === 'electricity') {
            const kwh = parseFloat(electricity.kwh) || 0;
            const area = parseFloat(electricity.area) || 0;
            const occupiedNights = parseFloat(electricity.occupiedNights) || 0;
            const emissionFactor = ELECTRICITY_EMISSION_FACTORS[electricity.location]?.factor || 0;
            const totalEmission = kwh * emissionFactor;
            const areaIntensity = area > 0 ? (totalEmission * 1000) / area : 0;
            const occupancyIntensity = occupiedNights > 0 ? (totalEmission * 1000) / occupiedNights : 0;
            
            newData.electricity_co2e = totalEmission;
            newData.electricity_details = { kwh, location: electricity.location, area, occupiedNights, emissionFactor, areaIntensity, occupancyIntensity };
            // Simpan juga total KWH di root kolom jika perlu, atau ambil dari details nanti
            newData.electricity_kwh = kwh;
            
            setCalculationResult({ totalEmission, areaIntensity, occupancyIntensity });

        } else if (activeTab === 'non-electric') {
            let totalNonElectricCo2e = 0;
            const detailedNonElectricItems = nonElectricEnergy.map(item => {
                const usage = parseFloat(item.usage) || 0;
                const frequency = parseFloat(item.frequency) || 0;
                const emissionData = NON_ELECTRIC_EMISSION_FACTORS[item.type];
                const factor = emissionData?.factor || 0;
                const emission = usage * factor * frequency;
                totalNonElectricCo2e += emission;
                return { ...item, usage, frequency, factor, unit: emissionData.unit, emission };
            }).filter(item => item.usage > 0);

            newData.non_electricity_co2e = totalNonElectricCo2e;
            newData.non_electricity_details = { items: detailedNonElectricItems };
            setCalculationResult({ items: detailedNonElectricItems, monthlyTotal: totalNonElectricCo2e });

        } else if (activeTab === 'transport') {
            let totalTransportCo2e = 0;
            let totalKm = 0; // Variabel untuk hitung total jarak

            vehicles.forEach(v => {
                const km = parseFloat(v.km) || 0;
                const frequency = parseFloat(v.frequency) || 0;
                const usageDistance = km * frequency; // Jarak total untuk kendaraan ini
                
                totalKm += usageDistance; // Tambahkan ke total global
                totalTransportCo2e += usageDistance * (TRANSPORT_EMISSION_FACTORS[v.type] || 0);
            });

            newData.transport_co2e = totalTransportCo2e;
            newData.transport_km = totalKm; // PERBAIKAN UTAMA: Simpan total KM
            newData.transport_details = vehicles;
            setCalculationResult({ monthlyTotal: totalTransportCo2e });

        } else if (activeTab === 'waste') {
            let totalWasteCo2e = 0;
            let totalWasteWeight = 0;

            const detailedWasteItems = wasteItems.map(item => {
                const weight = parseFloat(item.weight) || 0;
                const factor = WASTE_EMISSION_FACTORS[item.type]?.treatments[item.treatment] || 0;
                const emission = weight * factor;
                totalWasteCo2e += emission;
                totalWasteWeight += weight;
                return { ...item, weight, factor, emission };
            }).filter(item => item.weight > 0);

            newData.waste_co2e = totalWasteCo2e;
            newData.waste_kg = totalWasteWeight * 1000; // Simpan dalam kg jika perlu (schema waste_kg numeric)
            newData.waste_details = { items: detailedWasteItems };
            setCalculationResult({ items: detailedWasteItems, monthlyTotal: totalWasteCo2e });
        }

        // 4. Hitung Total Global
        newData.total_co2e_kg = (newData.electricity_co2e || 0) + (newData.non_electricity_co2e || 0) + (newData.transport_co2e || 0) + (newData.waste_co2e || 0);
        const monthDate = new Date(reportMonth + '-02');
        const monthName = monthDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
        newData.calculation_title = `Laporan Emisi - ${monthName}`;

        // Logika Penggabungan Evidence Link
        let existingEvidence = [];
        if (existingEntry && Array.isArray(existingEntry.evidence_links)) {
            existingEvidence = existingEntry.evidence_links;
        }

        const currentTabEvidence = evidenceLinks
            .filter(l => l.url.trim() !== '')
            .map(l => ({
                url: l.url,
                description: l.description,
                category: activeTab 
            }));

        const otherTabEvidence = existingEvidence.filter(link => link.category !== activeTab);
        newData.evidence_links = [...otherTabEvidence, ...currentTabEvidence];
        newData.is_verified = false;

        // 5. Simpan ke Supabase
        const { error: submissionError } = existingEntry
            ? await supabase.from('carbon_entries').update(newData).eq('id', existingEntry.id)
            : await supabase.from('carbon_entries').insert(newData);

        if (submissionError) {
            setMessage({ type: 'error', text: `Gagal menyimpan laporan: ${submissionError.message}` });
        } else {
            setMessage({ type: 'success', text: `Sukses! Data ${activeTab} tersimpan. Status laporan kini "Menunggu Verifikasi".` });
            
            // Reset form
            if (activeTab === 'electricity') setElectricity({ kwh: '', location: 'DKI Jakarta', area: '', occupiedNights: '' });
            if (activeTab === 'non-electric') setNonElectricEnergy([{ id: Date.now(), type: 'diesel_mineral', usage: '', frequency: '' }]);
            if (activeTab === 'transport') setVehicles([{ id: Date.now(), type: 'petrol', km: '', frequency: '' }]);
            if (activeTab === 'waste') setWasteItems([{ id: Date.now(), type: 'food_waste', treatment: 'landfill', weight: '' }]);
            
            setEvidenceLinks([{ id: Date.now(), url: '', description: '' }]);
            
            if (onReportSubmitted) onReportSubmitted();
        }
        setLoading(false);
    };

    const renderForm = () => {
        switch (activeTab) {
            case 'electricity':
                return (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">1. Lokasi Properti (Provinsi)</label>
                            <select id="location" value={electricity.location} onChange={(e) => handleElectricityChange('location', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567]">
                                {Object.keys(ELECTRICITY_EMISSION_FACTORS).map((province) => (
                                    <option key={province} value={province}>{province}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="electricity-kwh" className="block text-sm font-medium text-slate-700 mb-1">2. Total Konsumsi Listrik dari PLN</label>
                            <div className="relative">
                                <input type="number" id="electricity-kwh" value={electricity.kwh} onChange={(e) => handleElectricityChange('kwh', e.target.value)} placeholder="e.g., 1500000" required className="w-full pl-4 pr-12 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567]" />
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-slate-500">kWh</span>
                            </div>
                             <p className="text-xs text-slate-500 mt-1">Masukkan total pemakaian listrik dari tagihan PLN Anda.</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="area" className="block text-sm font-medium text-slate-700 mb-1">3. Total Luas Bangunan</label>
                                <div className="relative">
                                     <input type="number" id="area" value={electricity.area} onChange={(e) => handleElectricityChange('area', e.target.value)} placeholder="e.g., 12000" required className="w-full pl-4 pr-12 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567]" />
                                     <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-slate-500">m²</span>
                                </div>
                                 <p className="text-xs text-slate-500 mt-1">Total luas lantai yang menggunakan listrik.</p>
                            </div>
                            <div>
                                <label htmlFor="occupiedNights" className="block text-sm font-medium text-slate-700 mb-1">4. Total Malam Kamar Terokupansi (Occupied Room Nights)</label>
                                <input type="number" id="occupiedNights" value={electricity.occupiedNights} onChange={(e) => handleElectricityChange('occupiedNights', e.target.value)} placeholder="e.g., 60000" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567]" />
                                <p className="text-xs text-slate-500 mt-1">Jumlah total kamar yang terjual/terisi dalam sebulan.</p>
                            </div>
                        </div>
                    </div>
                );
            case 'non-electric':
                return (
                     <div className="space-y-4">
                        {nonElectricEnergy.map((item) => (
                            <div key={item.id} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-start p-4 border rounded-lg bg-slate-50">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Jenis Bahan Bakar</label>
                                    <select value={item.type} onChange={(e) => handleNonElectricEnergyChange(item.id, 'type', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm">
                                        {Object.entries(NON_ELECTRIC_EMISSION_FACTORS).map(([key, { name }]) => (
                                            <option key={key} value={key}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Jumlah Penggunaan</label>
                                     <div className="relative">
                                        <input type="number" placeholder="0" value={item.usage} onChange={(e) => handleNonElectricEnergyChange(item.id, 'usage', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-500">{NON_ELECTRIC_EMISSION_FACTORS[item.type]?.unit}</span>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Frekuensi</label>
                                    <input type="number" placeholder="0" value={item.frequency} onChange={(e) => handleNonElectricEnergyChange(item.id, 'frequency', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
                                     <span className="text-xs text-slate-500">Total penggunaan/bulan</span>
                                </div>
                                <div className="md:col-span-1 flex items-end justify-end h-full">
                                    {nonElectricEnergy.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveNonElectricEnergy(item.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold p-2">Hapus</button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddNonElectricEnergy} className="w-full py-2 text-sm font-semibold text-[#348567] border-2 border-[#348567] rounded-lg hover:bg-emerald-50 transition-colors">
                            + Tambahkan Bahan Bakar
                        </button>
                    </div>
                );
            case 'transport':
                return (
                    <div className="space-y-4">
                        {vehicles.map((vehicle) => (
                            <div key={vehicle.id} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-start p-4 border rounded-lg bg-slate-50">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Jenis Kendaraan</label>
                                    <select value={vehicle.type} onChange={(e) => handleVehicleChange(vehicle.id, 'type', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm">
                                        <option value="petrol">Mobil Bensin</option>
                                        <option value="diesel">Mobil Diesel</option>
                                        <option value="motorcycle">Motor</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Jarak Tempuh</label>
                                    <input type="number" placeholder="0" value={vehicle.km} onChange={(e) => handleVehicleChange(vehicle.id, 'km', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
                                     <span className="text-xs text-slate-500">km / penggunaan</span>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Frekuensi</label>
                                    <input type="number" placeholder="0" value={vehicle.frequency} onChange={(e) => handleVehicleChange(vehicle.id, 'frequency', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
                                     <span className="text-xs text-slate-500">Total penggunaan/bulan</span>
                                </div>
                                <div className="md:col-span-1 flex items-end justify-end h-full">
                                    {vehicles.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveVehicle(vehicle.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold p-2">Hapus</button>
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
                        {wasteItems.map((item) => {
                            const availableTreatments = WASTE_EMISSION_FACTORS[item.type]?.treatments || {};
                            return (
                                <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border rounded-lg bg-slate-50">
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Tipe Limbah</label>
                                        <select value={item.type} onChange={(e) => handleWasteChange(item.id, 'type', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm">
                                            {Object.entries(WASTE_EMISSION_FACTORS).map(([key, { name }]) => (
                                                <option key={key} value={key}>{name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Tipe Pengolahan</label>
                                        <select value={item.treatment} onChange={(e) => handleWasteChange(item.id, 'treatment', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm">
                                            {Object.entries(WASTE_TREATMENTS).map(([key, name]) => (
                                                <option key={key} value={key} disabled={availableTreatments[key] === null}>
                                                    {name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Jumlah Limbah</label>
                                        <div className="relative">
                                            <input type="number" placeholder="e.g., 2.5" value={item.weight} onChange={(e) => handleWasteChange(item.id, 'weight', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm pr-10" />
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-500">ton</span>
                                        </div>
                                    </div>
                                    <div className="md:col-span-1 flex justify-end">
                                        {wasteItems.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveWasteItem(item.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Hapus</button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <button type="button" onClick={handleAddWasteItem} className="w-full py-2 text-sm font-semibold text-[#348567] border-2 border-[#348567] rounded-lg hover:bg-emerald-50 transition-colors">
                            + Tambah Jenis Limbah
                        </button>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Input Laporan Emisi</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <label htmlFor="reportMonth" className="block text-sm font-medium text-slate-700 mb-1">Periode Laporan</label>
                    <input type="month" id="reportMonth" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} className="w-full md:w-1/2 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567]" required />
                </div>
                <div className="mb-6">
                    <div className="flex border-b border-slate-200 overflow-x-auto">
                        <button type="button" onClick={() => handleTabChange('electricity')} className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'electricity' ? 'border-b-2 border-[#348567] text-[#348567]' : 'text-slate-500 hover:text-slate-700'}`}>Listrik</button>
                        <button type="button" onClick={() => handleTabChange('non-electric')} className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'non-electric' ? 'border-b-2 border-[#348567] text-[#348567]' : 'text-slate-500 hover:text-slate-700'}`}>Energi Non Listrik</button>
                        <button type="button" onClick={() => handleTabChange('transport')} className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'transport' ? 'border-b-2 border-[#348567] text-[#348567]' : 'text-slate-500 hover:text-slate-700'}`}>Transportasi</button>
                        <button type="button" onClick={() => handleTabChange('waste')} className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'waste' ? 'border-b-2 border-[#348567] text-[#348567]' : 'text-slate-500 hover:text-slate-700'}`}>Limbah</button>
                    </div>
                </div>
                <div className="min-h-[200px] mb-6">
                    {renderForm()}
                </div>

                {/* Section Bukti Pendukung */}
                <div className="mb-8 p-5 bg-slate-50 rounded-xl border border-slate-200">
                    <h3 className="text-md font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-slate-600" />
                        Bukti Pendukung (untuk sesi {activeTab === 'non-electric' ? 'Energi' : activeTab})
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                        Unggah link dokumen bukti untuk <strong>kategori ini</strong> agar laporan valid.
                    </p>
                    <div className="space-y-3">
                        {evidenceLinks.map((link) => (
                            <div key={link.id} className="flex flex-col md:flex-row gap-3 items-start">
                                <div className="flex-1 w-full">
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={link.url}
                                        onChange={(e) => handleLinkChange(link.id, 'url', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567] text-sm bg-white"
                                    />
                                </div>
                                <div className="flex-1 w-full">
                                    <input
                                        type="text"
                                        placeholder="Keterangan (cth: Tagihan Listrik)"
                                        value={link.description}
                                        onChange={(e) => handleLinkChange(link.id, 'description', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567] text-sm bg-white"
                                    />
                                </div>
                                {evidenceLinks.length > 1 && (
                                    <button type="button" onClick={() => handleRemoveLink(link.id)} className="text-red-500 p-2 hover:bg-red-100 rounded-lg transition-colors">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={handleAddLink} className="text-sm text-[#348567] font-medium flex items-center gap-1 hover:underline mt-2">
                            <PlusCircleIcon className="w-4 h-4" /> Tambah Link Bukti Lainnya
                        </button>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full py-3 text-base font-semibold text-white bg-[#348567] rounded-lg hover:bg-[#2A6A52] transition-colors disabled:bg-slate-400 shadow-sm hover:shadow-md">
                    {loading ? 'Menyimpan...' : `Simpan Laporan ${activeTab === 'non-electric' ? 'Energi' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                </button>
            </form>

            {message.text && (<p className={`mt-4 text-sm text-center p-3 rounded-lg ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{message.text}</p>)}

            {/* Result Display Sections */}
            {calculationResult && activeTab === 'electricity' && (
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <h3 className="font-bold text-lg text-emerald-800 mb-2">Hasil Analisis Jejak Karbon Listrik</h3>
                    <div className="space-y-2 text-sm text-slate-700">
                        <p><strong>Total Emisi dari Listrik:</strong> <span className="font-semibold text-emerald-700">{calculationResult.totalEmission.toFixed(2)} ton CO₂e</span></p>
                        <hr className="my-2 border-emerald-200"/>
                        <p className="font-semibold">Intensitas Karbon Properti Anda:</p>
                        <ul className="list-disc list-inside pl-2">
                           <li><span className="font-semibold">{calculationResult.areaIntensity.toFixed(2)}</span> kg CO₂e/m²/periode (berdasarkan luas area)</li>
                           <li><span className="font-semibold">{calculationResult.occupancyIntensity.toFixed(2)}</span> kg CO₂e per kamar terisi (berdasarkan hunian)</li>
                        </ul>
                    </div>
                </div>
            )}
             {calculationResult && activeTab === 'non-electric' && (
                 <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <h3 className="font-bold text-lg text-emerald-800 mb-2">Hasil Analisis Jejak Karbon dari Energi Non Listrik</h3>
                    <p className="font-bold text-xl text-emerald-700">{calculationResult.monthlyTotal.toFixed(2)} ton CO₂e</p>
                </div>
            )}
             {calculationResult && activeTab === 'transport' && (
                 <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <h3 className="font-bold text-lg text-emerald-800 mb-2">Hasil Analisis Jejak Karbon dari Transportasi</h3>
                    <p className="font-bold text-xl text-emerald-700">{calculationResult.monthlyTotal.toFixed(2)} ton CO₂e</p>
                </div>
            )}
            {calculationResult && activeTab === 'waste' && (
                 <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <h3 className="font-bold text-lg text-emerald-800 mb-2">Hasil Analisis Jejak Karbon dari Limbah</h3>
                    <p className="font-bold text-xl text-emerald-700">{calculationResult.monthlyTotal.toFixed(2)} ton CO₂e</p>
                </div>
            )}
        </div>
    );
}