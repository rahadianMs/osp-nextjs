"use client";

import { useState, useEffect } from 'react';
import { EyeIcon } from './Icons';
import ReportDetailModal from './ReportDetailModal';

export default function AdminVerificationPage({ supabase }) {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);

    // Fetch Laporan yang Belum Diverifikasi
    const fetchUnverifiedReports = async () => {
        setLoading(true);
        try {
            // 1. Ambil data carbon_entries yang belum diverifikasi
            const { data: entries, error: entriesError } = await supabase
                .from('carbon_entries')
                .select('*')
                .eq('is_verified', false) // Hanya yang belum verifikasi
                .order('created_at', { ascending: false });

            if (entriesError) throw entriesError;

            // 2. Ambil data Profil untuk mendapatkan Nama Bisnis
            // (Kita lakukan manual mapping karena relasi di supabase kadang butuh setup khusus)
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

            // 3. Gabungkan Data
            const combinedData = entries.map(entry => ({
                ...entry,
                business_name: profilesMap[entry.user_id] || 'Nama Tidak Diketahui'
            }));

            setReports(combinedData);

        } catch (error) {
            console.error("Error fetching verification data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnverifiedReports();
    }, []);

    // Handler untuk Verifikasi
    const handleVerify = async (id) => {
        if(!confirm("Apakah Anda yakin data ini valid dan ingin memverifikasinya?")) return;

        try {
            const { error } = await supabase
                .from('carbon_entries')
                .update({ is_verified: true })
                .eq('id', id);

            if (error) throw error;

            alert("Laporan berhasil diverifikasi!");
            setSelectedReport(null); // Tutup modal
            fetchUnverifiedReports(); // Refresh tabel

        } catch (error) {
            alert("Gagal memverifikasi: " + error.message);
        }
    };

    // Handler untuk Menolak (Opsional: Bisa dikembangkan untuk kirim notifikasi alasan)
    const handleReject = async (id) => {
        if(!confirm("Tolak laporan ini? (User harus merevisi)")) return;
        // Disini logika penolakan, sementara kita hanya tutup modal atau bisa update status jadi 'rejected' jika ada kolomnya
        alert("Fitur penolakan (kirim notifikasi revisi) akan segera hadir.");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Verifikasi Laporan</h2>
                    <p className="text-slate-500">Validasi data emisi yang masuk dari mitra usaha.</p>
                </div>
                <button onClick={fetchUnverifiedReports} className="text-sm text-[#348567] hover:underline">
                    Refresh Data
                </button>
            </div>

            {loading ? (
                <div className="p-8 text-center bg-white rounded-xl shadow-sm border animate-pulse text-slate-500">
                    Memuat antrean verifikasi...
                </div>
            ) : reports.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-xl shadow-sm border text-slate-500">
                    <p className="text-lg font-medium">🎉 Tidak ada antrean.</p>
                    <p className="text-sm">Semua laporan telah diperiksa.</p>
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
                                            className="text-[#348567] hover:text-[#2A6A52] font-medium flex items-center justify-end gap-1 w-full"
                                        >
                                            <EyeIcon className="w-4 h-4" /> Tinjau
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL DETAIL (Versi Admin) */}
            {selectedReport && (
                <ReportDetailModal 
                    entry={selectedReport}
                    onClose={() => setSelectedReport(null)}
                    // Kita kirim props khusus 'isAdminVerification' ke modal
                    isAdminVerification={true} 
                    onVerify={() => handleVerify(selectedReport.id)}
                    onReject={() => handleReject(selectedReport.id)}
                />
            )}
        </div>
    );
}