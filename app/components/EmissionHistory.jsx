import { BoltIcon, TransportIcon, TrashCanIcon, FireIcon } from './Icons';

// --- 1. Definisikan Ikon Status Tambahan ---

const PaperClipIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
    </svg>
);

const CheckBadgeIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.491 4.491 0 013.497-1.307zm3.25 9.25a.75.75 0 10-1.1-1.1l-1.25 1.25a.75.75 0 000 1.1l1.25 1.25a.75.75 0 001.1-1.1l-.7-.7 3.25-3.25a.75.75 0 00-1.1-1.1l-2.7 2.7z" clipRule="evenodd" />
    </svg>
);

const ClockIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
);

export default function EmissionHistory({ entries, loading, error, onReportClick }) {
    if (loading) {
        return (
            <div>
                <h2 className="text-2xl font-bold mb-6">Riwayat Laporan</h2>
                <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 animate-pulse">
                    Memuat riwayat...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h2 className="text-2xl font-bold mb-6">Riwayat Laporan</h2>
                <div className="text-center p-4 text-red-600 bg-red-50 border border-red-100 rounded-xl">
                    {error}
                </div>
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <div>
                <h2 className="text-2xl font-bold mb-6">Riwayat Laporan</h2>
                <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500">
                    Belum ada riwayat perhitungan. Mulai hitung emisi Anda sekarang!
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Riwayat Laporan</h2>
            <div className="space-y-4">
                {entries.map((entry) => {
                    // Cek apakah ada evidence links
                    const hasEvidence = entry.evidence_links && Array.isArray(entry.evidence_links) && entry.evidence_links.length > 0;
                    const isVerified = entry.is_verified === true;

                    return (
                        <button
                            key={entry.id}
                            onClick={() => onReportClick(entry)}
                            className="w-full bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-200 transition-all duration-200 text-left group relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-emerald-600 transition-colors">
                                            {entry.calculation_title || 'Laporan Tanpa Judul'}
                                        </h3>
                                        
                                        {/* --- LOGIKA BADGE STATUS --- */}
                                        {isVerified ? (
                                            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold border border-emerald-200" title="Laporan Telah Diverifikasi Admin">
                                                <CheckBadgeIcon className="w-3 h-3" />
                                                Terverifikasi
                                            </span>
                                        ) : hasEvidence ? (
                                            <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium border border-amber-200" title="Menunggu Verifikasi Admin">
                                                <ClockIcon className="w-3 h-3" />
                                                Menunggu Verifikasi
                                            </span>
                                        ) : null}

                                        {/* Badge Bukti (Tetap dimunculkan sebagai info tambahan jika belum verified, atau bisa dihide jika verified) */}
                                        {hasEvidence && !isVerified && (
                                            <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium border border-blue-100">
                                                <PaperClipIcon className="w-3 h-3" />
                                                Ada Lampiran
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        {new Date(entry.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })} • {entry.report_month}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-emerald-600">
                                            {parseFloat(entry.total_co2e_kg || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">Ton CO₂e</div>
                                    </div>
                                    <div className="text-slate-300 group-hover:text-emerald-500 transition-colors pl-2">
                                        <ChevronRightIcon />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm items-center border-t border-slate-100 pt-4 mt-2">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                                        <BoltIcon className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium">{(entry.electricity_co2e || 0).toFixed(2)} <span className="text-xs text-slate-400">Ton CO₂e</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="p-1.5 bg-red-50 rounded-lg text-red-600">
                                        <FireIcon className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium">{(entry.non_electricity_co2e || 0).toFixed(2)} <span className="text-xs text-slate-400">Ton CO₂e</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                                        <TransportIcon className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium">{(entry.transport_co2e || 0).toFixed(2)} <span className="text-xs text-slate-400">Ton CO₂e</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                                        <TrashCanIcon className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium">{(entry.waste_co2e || 0).toFixed(2)} <span className="text-xs text-slate-400">Ton CO₂e</span></span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}