import { useState } from 'react';
import { motion } from 'framer-motion';
import { generatePdf } from '../lib/generatePdf';
import { BoltIcon, TransportIcon, TrashCanIcon, FireIcon } from './Icons';

// --- 1. Ikon-ikon Pendukung ---
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const LinkIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
);

// Mapping Kategori untuk Badge Evidence (UPDATED: Label Bahan Bakar -> Energi Non-Listrik)
const EVIDENCE_CATEGORIES = {
    'electricity': { label: 'Listrik', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    'non-electric': { label: 'Energi Non-Listrik', color: 'bg-red-100 text-red-700 border-red-200' },
    'transport': { label: 'Transportasi', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    'waste': { label: 'Limbah', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
};

export default function ReportDetailModal({ entry, onClose, onDelete }) {
    const [isDownloading, setIsDownloading] = useState(false);

    if (!entry) return null;

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const businessName = entry.user?.user_metadata?.business_name || "Nama Usaha";
            await generatePdf(entry, businessName);
        } catch (error) {
            console.error("Gagal download PDF:", error);
            alert("Gagal mengunduh PDF.");
        } finally {
            setIsDownloading(false);
        }
    };

    // Helper Data Evidence
    const getEvidenceData = (item) => {
        if (typeof item === 'string') {
            return { url: item, label: item, category: null };
        }
        if (typeof item === 'object' && item !== null) {
            return { 
                url: item.url || '#', 
                label: item.description || item.url || 'Bukti Lampiran',
                category: item.category || null 
            };
        }
        return { url: '#', label: 'Format tidak dikenali', category: null };
    };

    const evidenceLinks = Array.isArray(entry.evidence_links) ? entry.evidence_links : [];

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    // --- Helper Perhitungan Total ---

    // 1. Total Berat Limbah (Ton)
    const getTotalWasteWeight = () => {
        if (entry.waste_kg) return (parseFloat(entry.waste_kg) / 1000).toFixed(2); 
        if (entry.waste_details?.items) {
            const total = entry.waste_details.items.reduce((acc, item) => acc + (parseFloat(item.weight) || 0), 0);
            return total.toFixed(2);
        }
        return '0.00';
    };

    // 2. Total Jarak Transportasi (KM)
    const getTotalTransportKm = () => {
        if (entry.transport_km) return parseFloat(entry.transport_km).toLocaleString('id-ID');
        if (entry.transport_details && Array.isArray(entry.transport_details)) {
            const total = entry.transport_details.reduce((acc, v) => acc + ((parseFloat(v.km)||0) * (parseFloat(v.frequency)||0)), 0);
            return total.toLocaleString('id-ID');
        }
        return '0';
    };

    // 3. Total Konsumsi BBM (Liter) - BARU
    const getTotalFuelConsumption = () => {
        if (entry.non_electricity_details?.items) {
            // Filter hanya yang satuannya liter (atau asumsikan semua cair adalah liter)
            // Dan kalikan usage * frequency
            const total = entry.non_electricity_details.items
                .filter(item => item.unit === 'liter') 
                .reduce((acc, item) => acc + ((parseFloat(item.usage)||0) * (parseFloat(item.frequency)||0)), 0);
            
            return total.toLocaleString('id-ID');
        }
        return '0';
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }} 
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header Modal */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 pr-8">
                            {entry.calculation_title || 'Detail Laporan Emisi'}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Dibuat pada {formatDate(entry.created_at)}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                        <CloseIcon />
                    </button>
                </div>

                {/* Body Modal */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    
                    {/* Total Emisi (Satuan Ton CO2e) */}
                    <div className="bg-emerald-50 rounded-xl p-6 text-center mb-8 border border-emerald-100">
                        <p className="text-sm font-medium text-emerald-800 mb-1 uppercase tracking-wide">Total Jejak Karbon</p>
                        <div className="text-4xl font-bold text-emerald-600 mb-2">
                            {parseFloat(entry.total_co2e_kg || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-emerald-700 font-medium">Ton CO₂e</p>
                    </div>

                    {/* Grid Rincian Emisi */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {/* 1. Listrik */}
                        {entry.electricity_co2e > 0 && (
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 h-full">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-amber-500">
                                        <BoltIcon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-semibold text-slate-700">Listrik</h3>
                                </div>
                                <div className="space-y-1 ml-1">
                                    <p className="text-2xl font-bold text-slate-800">
                                        {(entry.electricity_co2e || 0).toFixed(2)} <span className="text-sm font-normal text-slate-500">Ton CO₂e</span>
                                    </p>
                                    {entry.electricity_details && (
                                        <p className="text-sm text-slate-500">Total Konsumsi: {Number(entry.electricity_details.kwh).toLocaleString('id-ID')} kWh</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 2. Energi Non-Listrik (UPDATED NAME & DETAIL) */}
                        {entry.non_electricity_co2e > 0 && (
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100 h-full">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-red-500">
                                        <FireIcon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-semibold text-slate-700">Energi Non-Listrik</h3>
                                </div>
                                <div className="space-y-1 ml-1">
                                    <p className="text-2xl font-bold text-slate-800">
                                        {(entry.non_electricity_co2e || 0).toFixed(2)} <span className="text-sm font-normal text-slate-500">Ton CO₂e</span>
                                    </p>
                                    {/* Detail Total Konsumsi Liter Ditambahkan Disini */}
                                    <p className="text-sm text-slate-500">Total Konsumsi: {getTotalFuelConsumption()} Liter</p>
                                </div>
                            </div>
                        )}

                        {/* 3. Transportasi */}
                        {entry.transport_co2e > 0 && (
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 h-full">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-blue-500">
                                        <TransportIcon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-semibold text-slate-700">Transportasi</h3>
                                </div>
                                <div className="space-y-1 ml-1">
                                    <p className="text-2xl font-bold text-slate-800">
                                        {(entry.transport_co2e || 0).toFixed(2)} <span className="text-sm font-normal text-slate-500">Ton CO₂e</span>
                                    </p>
                                    <p className="text-sm text-slate-500">Jarak Total: {getTotalTransportKm()} km</p>
                                </div>
                            </div>
                        )}

                        {/* 4. Limbah */}
                        {entry.waste_co2e > 0 && (
                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 h-full">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-500">
                                        <TrashCanIcon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-semibold text-slate-700">Limbah</h3>
                                </div>
                                <div className="space-y-1 ml-1">
                                    <p className="text-2xl font-bold text-slate-800">
                                        {(entry.waste_co2e || 0).toFixed(2)} <span className="text-sm font-normal text-slate-500">Ton CO₂e</span>
                                    </p>
                                    <p className="text-sm text-slate-500">Total Berat: {getTotalWasteWeight()} ton</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- BAGIAN EVIDENCE LINKS --- */}
                    {evidenceLinks.length > 0 && (
                        <div className="mb-8">
                            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <LinkIcon className="w-5 h-5 text-slate-500" />
                                Bukti Lampiran & Dokumen
                            </h3>
                            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                                <ul className="divide-y divide-slate-200">
                                    {evidenceLinks.map((item, index) => {
                                        const { url, label, category } = getEvidenceData(item);
                                        const tagStyle = category ? EVIDENCE_CATEGORIES[category] : null;

                                        return (
                                            <li key={item.id || index} className="group">
                                                <a 
                                                    href={url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 hover:bg-slate-100 transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                            <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
                                                            <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
                                                        </svg>
                                                    </div>
                                                    <div className="overflow-hidden flex-1">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            {tagStyle && (
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${tagStyle.color}`}>
                                                                    {tagStyle.label}
                                                                </span>
                                                            )}
                                                            <p className="text-sm font-medium text-blue-600 group-hover:underline truncate">
                                                                {label}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-slate-500 truncate">{url}</p>
                                                    </div>
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Modal */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                    <button onClick={() => onDelete(entry.id)} className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2">
                        <TrashCanIcon className="w-4 h-4" />
                        Hapus Laporan
                    </button>
                    <div className="flex gap-3">
                        <button onClick={handleDownload} disabled={isDownloading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200 disabled:bg-slate-200 disabled:text-slate-500 transition-colors">
                            <DownloadIcon /> 
                            {isDownloading ? 'Membuat PDF...' : 'Download PDF'}
                        </button>
                        <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm">
                            Tutup
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}