import { BoltIcon, TransportIcon, TrashCanIcon, FireIcon } from './Icons';

// Ikon PaperClip
const PaperClipIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
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
                    const hasEvidence = entry.evidence_links && Array.isArray(entry.evidence_links) && entry.evidence_links.length > 0;

                    return (
                        <button
                            key={entry.id}
                            onClick={() => onReportClick(entry)}
                            className="w-full bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-200 transition-all duration-200 text-left group relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-emerald-600 transition-colors">
                                            {entry.calculation_title || 'Laporan Tanpa Judul'}
                                        </h3>
                                        {hasEvidence && (
                                            <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium border border-blue-200" title="Memiliki Bukti Lampiran">
                                                <PaperClipIcon className="w-3 h-3" />
                                                Bukti
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
                                        {/* PERBAIKAN SATUAN DI SINI */}
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
                                    {/* PERBAIKAN SATUAN DI SINI */}
                                    <span className="font-medium">{(entry.electricity_co2e || 0).toFixed(2)} <span className="text-xs text-slate-400">Ton CO₂e</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="p-1.5 bg-red-50 rounded-lg text-red-600">
                                        <FireIcon className="w-5 h-5" />
                                    </div>
                                    {/* PERBAIKAN SATUAN DI SINI */}
                                    <span className="font-medium">{(entry.non_electricity_co2e || 0).toFixed(2)} <span className="text-xs text-slate-400">Ton CO₂e</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                                        <TransportIcon className="w-5 h-5" />
                                    </div>
                                    {/* PERBAIKAN SATUAN DI SINI */}
                                    <span className="font-medium">{(entry.transport_co2e || 0).toFixed(2)} <span className="text-xs text-slate-400">Ton CO₂e</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                                        <TrashCanIcon className="w-5 h-5" />
                                    </div>
                                    {/* PERBAIKAN SATUAN DI SINI */}
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