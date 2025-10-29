"use client";

import React, { useState, useEffect } from 'react';

// Komponen kontrol paginasi (Tidak berubah)
const PaginationControls = ({ currentPage, totalPages, onPageChange, pageSize, onPageSizeChange, totalUsers }) => {
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
                        className="px-3 py-1 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-slate-300 hover:bg-slate-50"
                    >
                        Sebelumnya
                    </button>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || totalUsers === 0}
                        className="px-3 py-1 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-slate-300 hover:bg-slate-50"
                    >
                        Berikutnya
                    </button>
                </div>
            </div>
        </div>
    );
};


// Halaman Admin untuk Laporan Keberlanjutan
export default function AdminSustainabilityPage({ supabase }) {
    
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageSize, setPageSize] = useState(5); 
    const [currentPage, setCurrentPage] = useState(1);
    const [totalReports, setTotalReports] = useState(0);

    // --- TAMBAHAN: State untuk menyimpan mapping Profile ---
    const [profileMap, setProfileMap] = useState(new Map());
    const [loadingProfiles, setLoadingProfiles] = useState(true);

    // --- TAMBAHAN: useEffect baru untuk mengambil data profile SEKALI ---
    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                setLoadingProfiles(true);
                // Ambil semua profil (id adalah user_id)
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, business_name'); // 'id' di sini adalah user_id

                if (error) throw error;
                
                // Buat Map untuk pencarian cepat
                const newMap = new Map();
                data.forEach(profile => {
                    newMap.set(profile.id, profile);
                });
                setProfileMap(newMap);
            } catch (error) {
                console.error("Error fetching profiles:", error.message);
            } finally {
                setLoadingProfiles(false);
            }
        };
        fetchProfiles();
    }, [supabase]);


    // --- MODIFIKASI: useEffect utama untuk mengambil Laporan ---
    useEffect(() => {
        // Jangan jalankan fetch laporan jika mapping profile belum siap
        if (loadingProfiles) return;

        const fetchReports = async () => {
            try {
                setLoading(true);
                const from = (currentPage - 1) * pageSize;
                const to = from + pageSize - 1;

                // Query ini (sebagai admin) akan mengambil SEMUA laporan berkat RLS
                // MODIFIKASI: Hapus join 'profiles', tambahkan 'user_id'
                const { data, error, count } = await supabase
                    .from('sustainability_reports')
                    .select(`
                        id, 
                        created_at, 
                        title, 
                        category, 
                        activity_date, 
                        user_id 
                    `, {
                        count: 'exact'
                    })
                    .order('activity_date', { ascending: false })
                    .range(from, to); 

                if (error) throw error;
                
                // --- MODIFIKASI: Gabungkan data secara manual ---
                const combinedData = data.map(report => ({
                    ...report,
                    // Cari business_name dari profileMap menggunakan user_id
                    business_name: profileMap.get(report.user_id)?.business_name || 'N/A'
                }));

                setReports(combinedData || []);
                setTotalReports(count || 0); 
            } catch (error) {
                // Error "relationship" seharusnya tidak terjadi lagi
                console.error('Error fetching ALL sustainability reports:', error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    // Tambahkan dependency loadingProfiles dan profileMap
    }, [supabase, currentPage, pageSize, loadingProfiles, profileMap]); 
    // --- AKHIR MODIFIKASI ---


    // Handler untuk paginasi (Tidak berubah)
    const handlePageChange = (newPage) => setCurrentPage(newPage);
    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setCurrentPage(1);
    };
    const totalPages = Math.ceil(totalReports / pageSize);

    // Helper format tanggal (Tidak berubah)
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-md border">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Laporan Keberlanjutan (Admin View)</h3>
            <p className="text-slate-500 mb-4">
                Daftar semua laporan aktivitas keberlanjutan yang telah dikirimkan oleh pengguna.
            </p>
            
            {/* MODIFIKASI: Tampilkan loading jika salah satu sedang loading */}
            {(loading || loadingProfiles) ? (
                <p className="text-slate-500 text-center py-20">Memuat laporan...</p>
            ) : (
                <div className="border rounded-lg overflow-x-auto shadow">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Bisnis</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Judul Laporan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kategori</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tgl. Aktivitas</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {reports.map((report) => (
                                <tr key={report.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {/* MODIFIKASI: Ambil dari 'business_name' yang sudah digabung */}
                                        {report.business_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{report.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{report.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(report.activity_date)}</td>
                                </tr>
                            ))}
                            
                            {reports.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-slate-500">
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