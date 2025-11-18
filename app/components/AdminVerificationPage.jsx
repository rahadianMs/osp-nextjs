"use client";

import { useState, useEffect } from 'react';
import { EyeIcon, DocumentChartBarIcon } from './Icons'; // Pastikan ikon ini ada atau ganti dengan ikon lain
import ReportDetailModal from './ReportDetailModal';

// Komponen Tab Sederhana
const TabButton = ({ active, onClick, label, count }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            active 
                ? 'border-[#348567] text-[#348567]' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
        }`}
    >
        {label}
        {count !== undefined && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {count}
            </span>
        )}
    </button>
);

export default function AdminVerificationPage({ supabase }) {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('unverified'); // State untuk Tab: 'unverified' | 'verified'
    const [selectedReport, setSelectedReport] = useState(null);

    // Fetch Data Laporan (Berdasarkan Tab Aktif)
    const fetchReports = async () => {
        setLoading(true);
        try {
            // 1. Tentukan filter berdasarkan tab
            const isVerifiedFilter = activeTab === 'verified';

            // 2. Query database
            const { data: entries, error: entriesError } = await supabase
                .from('carbon_entries')
                .select('*')
                .eq('is_verified', isVerifiedFilter) // Filter dinamis
                .order('created_at', { ascending: false }); // Urutkan dari yang terbaru

            if (entriesError) throw entriesError;

            // 3. Ambil data Profil untuk mendapatkan Nama Bisnis
            const userIds = [...new Set(entries.map(e => e.user_id))];
            
            let profilesMap = {};
            if (userIds.length > 0) {
                const { data: profiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, business_name')
                    .in('id', userIds);
                
                if (!profilesError && profiles) {
                    profiles.forEach(p => { profilesMap[p.id] = p.business_name });
                }
            }

            // 4. Gabungkan Data
            const combinedData = entries.map(entry => ({
                ...entry,
                business_name: profilesMap[entry.user_id] || 'Nama Tidak Diketahui'
            }));

            setReports(combinedData);

        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };

    // Refresh data setiap kali tab berubah
    useEffect(() => {
        fetchReports();
    }, [activeTab]);

    // Handler Verifikasi
    const handleVerify = async (id) => {
        if(!confirm("Apakah Anda yakin data ini valid dan ingin memverifikasinya?")) return;

        try {
            const { error } = await supabase
                .from('carbon_entries')
                .update({ is_verified: true })
                .eq('id', id);

            if (error) throw error;

            alert("Laporan berhasil diverifikasi!");
            setSelectedReport(null); 
            fetchReports(); // Refresh list

        } catch (error) {
            alert("Gagal memverifikasi: " + error.message);
        }
    };

    // Handler Hapus (Opsional: Untuk admin membersihkan data sampah di tab verified)
    const handleDelete = async (id) => {
        if(!confirm("Hapus laporan ini secara permanen?")) return;
        try {
            const { error } = await supabase
                .from('carbon_entries')
                .delete()
                .eq('id', id);
            if (error) throw error;
            
            setSelectedReport(null);
            fetchReports();
        } catch (error) {
            alert("Gagal menghapus: " + error.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Verifikasi Laporan</h2>
                    <p className="text-slate-500">Kelola validasi data emisi mitra usaha.</p>
                </div>
            </div>

            {/* --- NAVIGATION TABS --- */}
            <div className="border-b border-slate-200 flex gap-2 mb-6">
                <TabButton 
                    label="Menunggu Verifikasi" 
                    active={activeTab === 'unverified'} 
                    onClick={() => setActiveTab('unverified')}
                    // count bisa ditambahkan jika Anda mau fetch count terpisah, tapi opsional
                />
                <TabButton 
                    label="Riwayat Terverifikasi" 
                    active={activeTab === 'verified'} 
                    onClick={() => setActiveTab('verified')}
                />
            </div>

            {/* --- CONTENT TABLE --- */}
            {loading ? (
                <div className="p-12 text-center bg-white rounded-xl shadow-sm border animate-pulse">
                    <p className="text-slate-500">Memuat data...</p>
                </div>
            ) : reports.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-xl shadow-sm border text-slate-500 flex flex-col items-center">
                    <DocumentChartBarIcon className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-lg font-medium">Tidak ada data.</p>
                    <p className="text-sm">
                        {activeTab === 'unverified' 
                            ? "Semua laporan telah diperiksa! 🎉" 
                            : "Belum ada laporan yang diverifikasi."}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-4">Nama Usaha</th>
                                <th className="px-6 py-4">Periode</th>
                                <th className="px-6 py-4">Total Emisi</th>
                                <th className="px-6 py-4 text-center">Bukti</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report) => (
                                <tr key={report.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {report.business_name}
                                    </td>
                                    <td className="px-6 py-4">
                                        {report.calculation_title || report.report_month}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-emerald-600">
                                            {(report.total_co2e_kg || 0).toFixed(2)}
                                        </span> Ton CO₂e
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {report.evidence_links?.length > 0 ? (
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                {report.evidence_links.length} Lampiran
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 italic">Tidak ada</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setSelectedReport(report)}
                                            className={`font-medium flex items-center justify-end gap-1 w-full ${
                                                activeTab === 'unverified' 
                                                    ? 'text-[#348567] hover:text-[#2A6A52]' 
                                                    : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            <EyeIcon className="w-4 h-4" /> 
                                            {activeTab === 'unverified' ? 'Tinjau' : 'Detail'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL DETAIL */}
            {selectedReport && (
                <ReportDetailModal 
                    entry={selectedReport}
                    onClose={() => setSelectedReport(null)}
                    
                    // Logika Penting:
                    // Jika di tab 'unverified', aktifkan mode AdminVerification (tombol Verifikasi muncul)
                    // Jika di tab 'verified', matikan mode AdminVerification (hanya tombol Download & Hapus yg muncul)
                    isAdminVerification={activeTab === 'unverified'} 
                    
                    onVerify={() => handleVerify(selectedReport.id)}
                    
                    // Jika di tab 'verified', kita mungkin ingin admin bisa menghapus jika ada kesalahan
                    onDelete={activeTab === 'verified' ? handleDelete : undefined}
                />
            )}
        </div>
    );
}