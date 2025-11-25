"use client";

import { useState } from 'react';
import { LinkIcon, PlusCircleIcon, TrashIcon } from './Icons';

// --- DATA FAKTOR EMISI LISTRIK (Scope 2) ---
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

// --- DATA FAKTOR EMISI ENERGI NON-LISTRIK (Scope 1 - Stationary) ---
const NON_ELECTRIC_EMISSION_FACTORS = {
    diesel_oil: { name: 'Diesel (Solar Industri/Genset)', factor: 2.918, unit: 'liter' },
    lpg: { name: 'Liquified Petroleum Gases (LPG)', factor: 1.467, unit: 'liter' }, 
    motor_gasoline: { name: 'Motor Gasoline (Bensin untuk Genset/Alat)', factor: 2.318, unit: 'liter' },
    natural_gas: { name: 'Natural Gas (Gas Alam)', factor: 1.891, unit: 'cubic meter' },
};

// --- DATA FAKTOR EMISI TRANSPORTASI (Scope 1 - Mobile) ---
const TRANSPORT_FUEL_FACTORS = {
    bensin_ron_98: { name: 'Bensin RON 98', factor: 2.404 }, 
    bensin_ron_92: { name: 'Bensin RON 92', factor: 2.408 },       
    bensin_ron_90: { name: 'Bensin RON 90', factor: 2.416 },       
    bensin_ron_88: { name: 'Bensin RON 88', factor: 2.429 },         
    minyak_solar_cn_53: { name: 'Minyak Solar CN 53', factor: 2.934 },             
    minyak_solar_cn_51: { name: 'Minyak Solar CN 51', factor: 2.929 },
    minyak_solar_cn_48: { name: 'Minyak Solar CN 48', factor: 2.932 },
    minyak_diesel: { name: 'Minyak Diesel', factor: 2.937 },             
};

// --- KONSTANTA & DATA LIMBAH (Waste - Scope 3) ---
const WASTE_CONSTANTS = {
    DOC_F: 0.5,    
    F: 0.5,        
    MCF: 0.6,      
    GWP_CH4: 29.8, 
    GWP_N2O: 273,  
    GWP_CO2: 1,
    C_TO_CH4: 16/12,
    C_TO_CO2: 44/12,
    OF_INCINERATION: 1,    
    OF_OPEN_BURNING: 0.58  
};

const WASTE_TYPES = {
    food_waste: { 
        name: 'Sisa makanan (Food waste)', 
        doc_j: 0.15, 
        comp_ch4: 0.004, comp_n2o: 0.00024, bio_ch4: 0.0008, bio_n2o: 0,
        dm: 0.4, cf: 0.38, fcf: 0 
    },
    paper_cardboard: { 
        name: 'Kertas & kardus (Paper)', 
        doc_j: 0.40, 
        comp_ch4: 0.01, comp_n2o: 0.0006, bio_ch4: 0.002, bio_n2o: 0,
        dm: 0.9, cf: 0.46, fcf: 0.01 
    },
    wood: { 
        name: 'Kayu (Wood)', 
        doc_j: 0.43, 
        comp_ch4: 0.01, comp_n2o: 0.0006, bio_ch4: 0.002, bio_n2o: 0,
        dm: 0.85, cf: 0.5, fcf: 0 
    },
    garden_waste: { 
        name: 'Limbah Taman (Garden)', 
        doc_j: 0.20, 
        comp_ch4: 0.004, comp_n2o: 0.00024, bio_ch4: 0.0008, bio_n2o: 0,
        dm: 0.4, cf: 0.49, fcf: 0 
    },
    mixed: { 
        name: 'Campuran residu (Mixed residual)', 
        doc_j: 0.17, 
        comp_ch4: 0.004, comp_n2o: 0.00024, bio_ch4: 0.0008, bio_n2o: 0,
        dm: 0.764, cf: 0.44, fcf: 0.173 
    },
    textile: { 
        name: 'Tekstil (Textile / linen)', doc_j: 0.24,
        dm: 0.8, cf: 0.5, fcf: 0.2 
    },
    plastic: { 
        name: 'Plastik', doc_j: 0,
        dm: 1.0, cf: 0.75, fcf: 1.0 
    }, 
    glass_metal: { 
        name: 'Kaca / Logam / Inert', doc_j: 0,
        dm: 1.0, cf: 0, fcf: 0 
    }
};

const WASTE_TREATMENTS = {
    landfill: 'Tempat Pembuangan Akhir (TPA)',
    composting: 'Composting (Kompos)',
    biogas: 'Diolah menjadi biogas',
    recycled: 'Didaur Ulang/Digunakan kembali',
    open_burning: 'Dibakar Terbuka (Open Burning)',
    incineration: 'Penggunaan Insinerasi'
};

const NON_BIOLOGICAL_TYPES = ['plastic', 'glass_metal', 'textile'];

export default function CarbonCalculator({ supabase, user, onReportSubmitted }) {
    const [activeTab, setActiveTab] = useState('electricity');
    const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [calculationResult, setCalculationResult] = useState(null);

    const [electricity, setElectricity] = useState({ kwh: '', location: 'DKI Jakarta', area: '', occupiedNights: '' });
    const [nonElectricEnergy, setNonElectricEnergy] = useState([{ id: Date.now(), type: 'diesel_oil', usage: '', frequency: '' }]);
    const [vehicles, setVehicles] = useState([{ id: Date.now(), vehicleType: 'Mobil', fuelType: 'bensin_ron_92', liters: '', frequency: '' }]);
    const [wasteItems, setWasteItems] = useState([{ id: Date.now(), type: 'food_waste', treatment: 'landfill', weight: '' }]);
    const [evidenceLinks, setEvidenceLinks] = useState([{ id: Date.now(), url: '', description: '' }]);

    const handleElectricityChange = (field, value) => setElectricity(prev => ({ ...prev, [field]: value }));

    const handleAddNonElectricEnergy = () => setNonElectricEnergy([...nonElectricEnergy, { id: Date.now(), type: 'diesel_oil', usage: '', frequency: '' }]);
    const handleRemoveNonElectricEnergy = (id) => setNonElectricEnergy(nonElectricEnergy.filter(e => e.id !== id));
    const handleNonElectricEnergyChange = (id, field, value) => setNonElectricEnergy(nonElectricEnergy.map(e => e.id === id ? { ...e, [field]: value } : e));

    const handleAddVehicle = () => setVehicles([...vehicles, { id: Date.now(), vehicleType: 'Mobil', fuelType: 'bensin_ron_92', liters: '', frequency: '' }]);
    const handleRemoveVehicle = (id) => setVehicles(vehicles.filter(v => v.id !== id));
    const handleVehicleChange = (id, field, value) => setVehicles(vehicles.map(v => v.id === id ? { ...v, [field]: value } : v));
    
    const handleAddWasteItem = () => setWasteItems([...wasteItems, { id: Date.now(), type: 'food_waste', treatment: 'landfill', weight: '' }]);
    const handleRemoveWasteItem = (id) => setWasteItems(wasteItems.filter(i => i.id !== id));
    
    const handleWasteChange = (id, field, value) => {
        setWasteItems(wasteItems.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                if (field === 'type') {
                    const isNonBio = NON_BIOLOGICAL_TYPES.includes(value);
                    const isBioTreatment = ['composting', 'biogas'].includes(updatedItem.treatment);
                    if (isNonBio && isBioTreatment) {
                        updatedItem.treatment = 'landfill';
                    }
                }
                return updatedItem;
            }
            return item;
        }));
    };

    const handleAddLink = () => setEvidenceLinks([...evidenceLinks, { id: Date.now(), url: '', description: '' }]);
    const handleRemoveLink = (id) => setEvidenceLinks(evidenceLinks.filter(l => l.id !== id));
    const handleLinkChange = (id, field, value) => setEvidenceLinks(evidenceLinks.map(l => l.id === id ? { ...l, [field]: value } : l));

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCalculationResult(null);
        setMessage({ type: '', text: '' });
        setEvidenceLinks([{ id: Date.now(), url: '', description: '' }]); 
    };

    const calculateWasteEmission = (type, treatment, weightKg) => {
        if (!weightKg || weightKg <= 0) return 0;
        
        const wasteData = WASTE_TYPES[type];
        
        // 1. LANDFILL (TPA)
        if (treatment === 'landfill') {
            const emissionKgCO2e = weightKg * wasteData.doc_j * WASTE_CONSTANTS.DOC_F * WASTE_CONSTANTS.F * WASTE_CONSTANTS.MCF * WASTE_CONSTANTS.C_TO_CH4 * WASTE_CONSTANTS.GWP_CH4;
            return emissionKgCO2e / 1000; 
        } 
        // 2. COMPOSTING
        else if (treatment === 'composting') {
            if (!wasteData.comp_ch4) return 0; 
            const ch4Emission = weightKg * wasteData.comp_ch4 * WASTE_CONSTANTS.GWP_CH4;
            const n2oEmission = weightKg * wasteData.comp_n2o * WASTE_CONSTANTS.GWP_N2O;
            return (ch4Emission + n2oEmission) / 1000;
        }
        // 3. BIOGAS
        else if (treatment === 'biogas') {
            if (!wasteData.bio_ch4) return 0;
            const ch4Emission = weightKg * wasteData.bio_ch4 * WASTE_CONSTANTS.GWP_CH4;
            const n2oEmission = weightKg * wasteData.bio_n2o * WASTE_CONSTANTS.GWP_N2O;
            return (ch4Emission + n2oEmission) / 1000;
        }
        // 4. INCINERATION
        else if (treatment === 'incineration') {
            // a. N2O
            const n2oEmission = weightKg * 0.00006 * WASTE_CONSTANTS.GWP_N2O;
            
            // b. CH4 [FIXED: Updated Factor from 0.000006 to 0.00006]
            // Menggunakan faktor 0.00006 agar sesuai dengan target 1.817 ton (Excel User)
            const ch4Emission = weightKg * 0.00006 * WASTE_CONSTANTS.GWP_CH4;
            
            // c. CO2 Fosil
            const co2Emission = weightKg * wasteData.dm * wasteData.cf * wasteData.fcf * WASTE_CONSTANTS.OF_INCINERATION * WASTE_CONSTANTS.C_TO_CO2 * WASTE_CONSTANTS.GWP_CO2;
            
            return (n2oEmission + ch4Emission + co2Emission) / 1000;
        } 
        // 5. OPEN BURNING
        else if (treatment === 'open_burning') {
            const n2oEmission = weightKg * 0.00015 * WASTE_CONSTANTS.GWP_N2O;
            const ch4Emission = weightKg * 0.0065 * WASTE_CONSTANTS.GWP_CH4;
            const co2Emission = weightKg * wasteData.dm * wasteData.cf * wasteData.fcf * WASTE_CONSTANTS.OF_OPEN_BURNING * WASTE_CONSTANTS.C_TO_CO2 * WASTE_CONSTANTS.GWP_CO2;
            return (n2oEmission + ch4Emission + co2Emission) / 1000;
        }
        
        return 0; // Recycled
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        setCalculationResult(null);

        const { data: existingEntry, error: fetchError } = await supabase
            .from('carbon_entries').select('*').eq('user_id', user.id).eq('report_month', reportMonth).single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            setMessage({ type: 'error', text: `Gagal memeriksa data: ${fetchError.message}` });
            setLoading(false);
            return;
        }

        let newData = existingEntry ? { ...existingEntry } : { user_id: user.id, report_month: reportMonth, electricity_co2e: 0, non_electricity_co2e: 0, transport_co2e: 0, waste_co2e: 0 };

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
            newData.electricity_kwh = kwh;
            
            setCalculationResult({ totalEmission, areaIntensity, occupancyIntensity });

        } else if (activeTab === 'non-electric') {
            let totalNonElectricCo2e = 0;
            const detailedNonElectricItems = nonElectricEnergy.map(item => {
                const usage = parseFloat(item.usage) || 0;
                const frequency = parseFloat(item.frequency) || 0;
                const emissionData = NON_ELECTRIC_EMISSION_FACTORS[item.type];
                const factor = emissionData?.factor || 0; 
                const emission = (usage * frequency * factor) / 1000; 
                
                totalNonElectricCo2e += emission;
                return { ...item, usage, frequency, factor, unit: emissionData.unit, emission };
            }).filter(item => item.usage > 0);

            newData.non_electricity_co2e = totalNonElectricCo2e; 
            newData.non_electricity_details = { items: detailedNonElectricItems };
            setCalculationResult({ items: detailedNonElectricItems, monthlyTotal: totalNonElectricCo2e });

        } else if (activeTab === 'transport') {
            let totalTransportCo2e = 0;
            let totalLiters = 0; 

            const detailedVehicles = vehicles.map(v => {
                const liters = parseFloat(v.liters) || 0;
                const frequency = parseFloat(v.frequency) || 0;
                const fuelData = TRANSPORT_FUEL_FACTORS[v.fuelType];
                const factor = fuelData?.factor || 0; 
                const totalConsumedLiters = liters * frequency;
                const emission = (totalConsumedLiters * factor) / 1000; 

                totalTransportCo2e += emission;
                totalLiters += totalConsumedLiters;
                
                return { ...v, totalConsumedLiters, factor, emission, fuelName: fuelData?.name };
            });

            newData.transport_co2e = totalTransportCo2e; 
            newData.transport_km = 0; 
            newData.transport_details = detailedVehicles;
            setCalculationResult({ monthlyTotal: totalTransportCo2e, totalLiters });

        } else if (activeTab === 'waste') {
            let totalWasteCo2e = 0;
            let totalWasteWeightKg = 0;

            const detailedWasteItems = wasteItems.map(item => {
                const weightKg = parseFloat(item.weight) || 0; 
                
                const emissionTonCO2e = calculateWasteEmission(item.type, item.treatment, weightKg);
                
                totalWasteCo2e += emissionTonCO2e;
                totalWasteWeightKg += weightKg;
                
                return { ...item, weight: weightKg, emission: emissionTonCO2e };
            }).filter(item => item.weight > 0);

            newData.waste_co2e = totalWasteCo2e; 
            newData.waste_kg = totalWasteWeightKg; 
            newData.waste_details = { items: detailedWasteItems };
            setCalculationResult({ items: detailedWasteItems, monthlyTotal: totalWasteCo2e });
        }

        newData.total_co2e_kg = (newData.electricity_co2e || 0) + (newData.non_electricity_co2e || 0) + (newData.transport_co2e || 0) + (newData.waste_co2e || 0);
        const monthDate = new Date(reportMonth + '-02');
        const monthName = monthDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
        newData.calculation_title = `Laporan Emisi - ${monthName}`;

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

        const { error: submissionError } = existingEntry
            ? await supabase.from('carbon_entries').update(newData).eq('id', existingEntry.id)
            : await supabase.from('carbon_entries').insert(newData);

        if (submissionError) {
            setMessage({ type: 'error', text: `Gagal menyimpan laporan: ${submissionError.message}` });
        } else {
            setMessage({ type: 'success', text: `Sukses! Data ${activeTab} tersimpan.` });
            
            if (activeTab === 'electricity') setElectricity({ kwh: '', location: 'DKI Jakarta', area: '', occupiedNights: '' });
            if (activeTab === 'non-electric') setNonElectricEnergy([{ id: Date.now(), type: 'diesel_oil', usage: '', frequency: '' }]);
            if (activeTab === 'transport') setVehicles([{ id: Date.now(), vehicleType: 'Mobil', fuelType: 'bensin_ron_92', liters: '', frequency: '' }]);
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
                                <input type="number" min="0" id="electricity-kwh" value={electricity.kwh} onChange={(e) => handleElectricityChange('kwh', e.target.value)} placeholder="e.g., 1500000" required className="w-full pl-4 pr-12 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567]" />
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-slate-500">kWh</span>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="area" className="block text-sm font-medium text-slate-700 mb-1">3. Total Luas Bangunan</label>
                                <div className="relative">
                                     <input type="number" min="0" id="area" value={electricity.area} onChange={(e) => handleElectricityChange('area', e.target.value)} placeholder="e.g., 12000" required className="w-full pl-4 pr-12 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567]" />
                                     <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-slate-500">m²</span>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="occupiedNights" className="block text-sm font-medium text-slate-700 mb-1">4. Total Malam Kamar Terokupansi</label>
                                <input type="number" min="0" id="occupiedNights" value={electricity.occupiedNights} onChange={(e) => handleElectricityChange('occupiedNights', e.target.value)} placeholder="e.g., 60000" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567]" />
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
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Jumlah Konsumsi</label>
                                     <div className="relative">
                                        <input type="number" min="0" placeholder="0" value={item.usage} onChange={(e) => handleNonElectricEnergyChange(item.id, 'usage', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-500">{NON_ELECTRIC_EMISSION_FACTORS[item.type]?.unit}</span>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Frekuensi Pengisian</label>
                                    <input type="number" min="0" placeholder="1" value={item.frequency} onChange={(e) => handleNonElectricEnergyChange(item.id, 'frequency', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
                                     <span className="text-xs text-slate-500">kali / bulan</span>
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
                            <div key={vehicle.id} className="grid grid-cols-1 md:grid-cols-8 gap-4 items-start p-4 border rounded-lg bg-slate-50">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Jenis Kendaraan</label>
                                    <select value={vehicle.vehicleType} onChange={(e) => handleVehicleChange(vehicle.id, 'vehicleType', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm">
                                        <option value="Mobil">Mobil</option>
                                        <option value="Motor">Motor</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Jenis Bahan Bakar</label>
                                    <select value={vehicle.fuelType} onChange={(e) => handleVehicleChange(vehicle.id, 'fuelType', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm">
                                        {Object.entries(TRANSPORT_FUEL_FACTORS).map(([key, { name }]) => (
                                            <option key={key} value={key}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Konsumsi BBM</label>
                                    <div className="relative">
                                        <input type="number" min="0" placeholder="0" value={vehicle.liters} onChange={(e) => handleVehicleChange(vehicle.id, 'liters', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-500">Liter</span>
                                    </div>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Frekuensi</label>
                                    <input type="number" min="0" placeholder="1" value={vehicle.frequency} onChange={(e) => handleVehicleChange(vehicle.id, 'frequency', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
                                     <span className="text-xs text-slate-500">kali/bln</span>
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
                        {wasteItems.map((item) => (
                            <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border rounded-lg bg-slate-50">
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Tipe Limbah</label>
                                    <select value={item.type} onChange={(e) => handleWasteChange(item.id, 'type', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm">
                                        {Object.entries(WASTE_TYPES).map(([key, { name }]) => (
                                            <option key={key} value={key}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Tipe Pengolahan</label>
                                    <select value={item.treatment} onChange={(e) => handleWasteChange(item.id, 'treatment', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm">
                                        {Object.entries(WASTE_TREATMENTS).map(([key, name]) => {
                                            if ((key === 'composting' || key === 'biogas') && NON_BIOLOGICAL_TYPES.includes(item.type)) {
                                                return null;
                                            }
                                            return (
                                                <option key={key} value={key}>
                                                    {name}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Jumlah Limbah</label>
                                    <div className="relative">
                                        <input type="number" min="0" placeholder="e.g., 2500" value={item.weight} onChange={(e) => handleWasteChange(item.id, 'weight', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm pr-10" />
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

                <div className="mb-8 p-5 bg-slate-50 rounded-xl border border-slate-200">
                    <h3 className="text-md font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-slate-600" />
                        Bukti Pendukung
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
                    {loading ? 'Menyimpan...' : `Simpan Laporan`}
                </button>
            </form>

            {message.text && (<p className={`mt-4 text-sm text-center p-3 rounded-lg ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{message.text}</p>)}

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
                    <p className="text-sm text-emerald-600 mt-2">Total Bahan Bakar: {calculationResult.totalLiters.toFixed(2)} Liter</p>
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