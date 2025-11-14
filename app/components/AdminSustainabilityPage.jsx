"use client";

import React, { useState, useEffect, useCallback } from 'react';

// Impor ikon dan generator PDF
import { ArrowDownTrayIcon, TrashIcon, CheckBadgeIcon } from "./Icons";
import { generateActivityReportPdf } from "../lib/generateActivityReportPdf";

// Komponen Spinner untuk loading
const SmallSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// Komponen kontrol paginasi (Tidak berubah)
const PaginationControls = ({ currentPage, totalPages, onPageChange, pageSize, onPageSizeChange, totalUsers }) => {
    // ... (Isi komponen ini sama seperti file Anda)
    const pageSizes = [5, 20, 25, 50, 100]; 
    const from = (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, totalUsers);
    if (totalUsers === 0) return null;

    return (
        <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
                <label htmlFor="pageSize" className="text-sm text-slate-600">
                    Tampilkan:
                </label>
                <select
                    id="pageSize"
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="p-1 text-sm border border-slate-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                >
                    {pageSizes.map(size => (
                        <option key={size} value={size}>{size} per halaman</option>
                    ))}
                </select>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">
                    {from}-{to} dari {totalUsers}
                </span>
                <div className="flex gap-1">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-slate-300 rounded-md disabled:opacity-50"
                    >
                        Sebelumnya
                    </button>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border border-slate-300 rounded-md disabled:opacity-50"
                    >
                        Berikutnya
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function AdminSustainabilityPage({ supabase }) {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(0);
    const [totalReports, setTotalReports] = useState(0);
    const [error, setError] = useState(null);

    // State untuk loading tombol aksi
    const [downloadingId, setDownloadingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [verifyingId, setVerifyingId] = useState(null);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // --- PERBAIKAN: Menggunakan 2 Kueri Terpisah (Lebih Aman & Stabil) ---
    const fetchReports = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // 1. Hitung total laporan
            const { count, error: countError } = await supabase
                .from('sustainability_reports')
                .select('*', { count: 'exact', head: true });

            if (countError) throw countError;

            setTotalReports(count);
            setTotalPages(Math.ceil(count / pageSize));

            // 2. Hitung rentang data
            const from = (currentPage - 1) * pageSize;
            const to = from + pageSize - 1;

            // 3. Ambil data laporan (Kueri Pertama)
            const { data: reportsData, error: reportsError } = await supabase
                .from('sustainability_reports')
                .select('*') // Ambil semua data laporan
                .order('created_at', { ascending: false })
                .range(from, to);

            if (reportsError) throw reportsError;

            // 4. Ambil ID unik pengguna dari laporan
            const userIds = [...new Set(reportsData.map(report => report.user_id))];

            // 5. Ambil profil pengguna (Kueri Kedua)
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, business_name')
                .in('id', userIds);

            if (profilesError) throw profilesError;

            // 6. Buat map untuk gampang dicari
            const profilesMap = new Map(profilesData.map(p => [p.id, p.business_name]));

            // 7. Gabungkan data di JavaScript (bukan di SQL)
            const combinedReports = reportsData.map(report => ({
                ...report,
                business_name: profilesMap.get(report.user_id) || 'Nama Usaha T/A'
            }));

            setReports(combinedReports);

        } catch (err) {
            // Error {} akan hilang, karena RLS (dengan get_user_role) 
            // akan bekerja dengan benar pada 2 kueri sederhana ini.
            console.error("Gagal mengambil data laporan:", err);
            setError(err.message || "Gagal memuat data.");
        } finally {
            setLoading(false);
        }
    }, [supabase, currentPage, pageSize]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]); 

    // (Fungsi paginasi tidak berubah)
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    const handlePageSizeChange = (size) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    // Fungsi Unduh PDF
    const handleDownloadPdf = async (report) => {
        setDownloadingId(report.id);
        setError(null);
        try {
            await generateActivityReportPdf(report);
        } catch (error) {
            console.error("Gagal membuat PDF:", error);
            setError('Gagal membuat file PDF.');
        }
        setDownloadingId(null);
    };

    // Fungsi Hapus Laporan
    const handleDeleteReport = async (reportId) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus laporan ini secara permanen?")) {
            setDeletingId(reportId);
            setError(null);
            try {
                const { error } = await supabase
                    .from('sustainability_reports')
                    .delete()
                    .eq('id', reportId);

                if (error) throw error;
                fetchReports(); // Refresh data
                
            } catch (error) {
                console.error("Gagal menghapus laporan:", error);
                setError(`Gagal menghapus laporan: ${error.message}.`);
            }
            setDeletingId(null);
        }
    };

    // Fungsi Verifikasi Laporan
    const handleVerifyReport = async (reportId, currentStatus) => {
        setVerifyingId(reportId);
        setError(null);
        const newStatus = !currentStatus;

        try {
            const { error } = await supabase
                .from('sustainability_reports')
                .update({ is_verified: newStatus })
                .eq('id', reportId);
            
            if (error) throw error;

            // Update state lokal (UX lebih baik)
            setReports(reports.map(report =>
                report.id === reportId ? { ...report, is_verified: newStatus } : report
            ));

        } catch (error) {
            console.error("Gagal memverifikasi laporan:", error);
            setError(`Gagal memverifikasi: ${error.message}.`);
        }
        setVerifyingId(null);
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">
                Manajemen Laporan Keberlanjutan
            </h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {loading && reports.length === 0 ? (
                <div className="text-center py-10 text-slate-500">Memuat data...</div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Usaha</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Judul Laporan</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {reports.map((report) => (
                                <tr key={report.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {report.business_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowop text-sm text-slate-500 max-w-xs truncate" title={report.title}>
                                        {report.title}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(report.activity_date)}</td>
                                    
                                    {/* Sel Status (Verifikasi) */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleVerifyReport(report.id, report.is_verified)}
                                            disabled={verifyingId === report.id}
                                            className={`p-1.5 rounded-full disabled:opacity-50
                                                ${report.is_verified 
                                                    ? 'text-green-600' 
                                                    : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
                                                }`}
                                            title={report.is_verified ? "Terverifikasi" : "Klik untuk Verifikasi"}
                                        >
                                            {verifyingId === report.id ? <SmallSpinner /> : <CheckBadgeIcon />}
                                        </button>
                                    </td>
                                    
                                    {/* Sel Aksi (Unduh & Hapus) */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                                        <button
                                            onClick={() => handleDownloadPdf(report)}
                                            disabled={downloadingId === report.id}
                                            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-full disabled:opacity-50"
                                            title="Unduh laporan (PDF)"
                                        >
                                            {downloadingId === report.id ? <SmallSpinner /> : <ArrowDownTrayIcon />}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteReport(report.id)}
                                            disabled={deletingId === report.id}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full disabled:opacity-50"
                                            title="Hapus laporan"
                                        >
                                            {deletingId === report.id ? <SmallSpinner /> : <TrashIcon />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            
                            {reports.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-slate-500">
                                        Belum ada laporan keberlanjutan yang dikirimkan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
                totalUsers={totalReports}
            />
        </div>
    );
}