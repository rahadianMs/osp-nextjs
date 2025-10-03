// Komponen ini tidak lagi mengambil datanya sendiri.
// Sekarang hanya bertugas menampilkan data yang diterima via props.

// Ikon panah untuk indikasi "klik untuk detail"
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;

export default function EmissionHistory({ entries, loading, error, onReportClick }) {

    if (loading) {
        return (
            <div>
                <h2 className="text-2xl font-bold mb-6">Riwayat Laporan</h2>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm border">Memuat riwayat...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h2 className="text-2xl font-bold mb-6">Riwayat Laporan</h2>
                <div className="text-center p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Riwayat Laporan</h2>
            {entries.length === 0 ? (
                <p className="text-slate-500 bg-white p-6 rounded-lg shadow-sm border">Anda belum memiliki laporan. Buat laporan baru di atas untuk melihat riwayat di sini.</p>
            ) : (
                <div className="space-y-3">
                    {entries.map(entry => (
                        <button 
                            key={entry.id} 
                            onClick={() => onReportClick(entry)}
                            className="w-full bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center transition-all hover:shadow-md hover:border-[#348567] focus:outline-none focus:ring-2 focus:ring-[#348567]"
                        >
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 text-left">{entry.calculation_title || 'Laporan Tanpa Judul'}</h3>
                                <p className="text-sm text-slate-500 text-left">
                                    Disimpan pada: {new Date(entry.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-xl font-bold text-[#348567]">{entry.total_co2e_kg.toFixed(2)}</p>
                                    <p className="text-sm text-slate-500">kg CO₂e</p>
                                </div>
                                <ChevronRightIcon />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}