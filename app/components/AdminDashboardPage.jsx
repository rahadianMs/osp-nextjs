"use client";

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
// Ikon yang kita gunakan (pastikan sudah ada di Icons.jsx)
import { DocumentChartBarIcon } from './Icons.jsx';


// Komponen baru untuk kontrol paginasi
const PaginationControls = ({ currentPage, totalPages, onPageChange, pageSize, onPageSizeChange, totalUsers }) => {
    const pageSizes = [5, 20, 25, 50, 100]; 

    const from = (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, totalUsers);

    // Jangan tampilkan apa-apa jika tidak ada data
    if (totalUsers === 0) return null;

    return (
        <div className="flex items-center justify-between mt-4"> {/* MODIFIKASI: Tambah mt-4 di sini */}
            {/* Kiri: Pilihan Page Size */}
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

            {/* Kanan: Info & Tombol Navigasi */}
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


// Komponen untuk daftar pengguna dan unduhan per-user
const UserList = ({ supabase }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingUserId, setLoadingUserId] = useState(null);
    const [pageSize, setPageSize] = useState(5); 
    const [currentPage, setCurrentPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const from = (currentPage - 1) * pageSize;
                const to = from + pageSize - 1;
                const { data, error, count } = await supabase
                    .from('profiles')
                    .select('id, business_name, pic_name, pic_email, role', {
                        count: 'exact' 
                    })
                    .order('business_name', { ascending: true }) 
                    .range(from, to); 
                if (error) throw error;
                setUsers(data || []);
                setTotalUsers(count || 0); 
            } catch (error) {
                console.error('Error fetching users:', error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [supabase, currentPage, pageSize]); 


    // (Fungsi unduh per user tidak berubah)
    const handleDownloadUserReport = async (userProfile) => {
        if (!userProfile) return;
        setLoadingUserId(userProfile.id);
        try {
            const { data: entries, error } = await supabase
                .from('carbon_entries')
                .select(`
                    report_month,
                    created_at,
                    calculation_title,
                    total_co2e_kg,
                    electricity_co2e,
                    transport_co2e,
                    waste_co2e,
                    non_electricity_co2e,
                    electricity_details,
                    waste_details,
                    transport_details
                `)
                .eq('user_id', userProfile.id) 
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!entries || entries.length === 0) {
                alert(`Tidak ada data emisi yang ditemukan untuk ${userProfile.business_name}.`);
                setLoadingUserId(null); 
                return;
            }
            const formattedData = entries.map(entry => {
                const listriKwh = entry.electricity_details?.kwh || 0;
                const totalWasteKg = entry.waste_details?.items?.reduce((acc, item) => {
                    return acc + (parseFloat(item.weight) || 0);
                }, 0) || 0;
                const totalTransportKm = entry.transport_details?.reduce((acc, item) => {
                    return acc + (parseFloat(item.km) || 0);
                }, 0) || 0;
                return {
                    'Nama Bisnis': userProfile.business_name,
                    'Bulan Laporan': entry.report_month,
                    'Tanggal Input': new Date(entry.created_at).toISOString().split('T')[0],
                    'Judul Kalkulasi': entry.calculation_title,
                    'Total Emisi (kg CO2e)': entry.total_co2e_kg,
                    'Emisi Listrik (kg CO2e)': entry.electricity_co2e,
                    'Listrik (kWh)': listriKwh,
                    'Emisi Transportasi (kg CO2e)': entry.transport_co2e,
                    'Transportasi (km)': totalTransportKm,
                    'Emisi Limbah (kg CO2e)': entry.waste_co2e,
                    'Limbah (kg)': totalWasteKg,
                    'Emisi Non-Listrik (kg CO2e)': entry.non_electricity_co2e
                };
            });
            const ws = XLSX.utils.json_to_sheet(formattedData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Detail Emisi User");
            const fileName = `Laporan_Emisi_Detail_${userProfile.business_name.replace(/[^a-z0-9]/gi, '_')}.xlsx`;
            XLSX.writeFile(wb, fileName);
        } catch (error) {
            console.error('Error downloading user report:', error.message);
            alert(`Gagal mengunduh laporan: ${error.message}`);
        } finally {
            setLoadingUserId(null);
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setCurrentPage(1); 
    };

    const totalPages = Math.ceil(totalUsers / pageSize);

    return (
        <div> {/* Div pembungkus utama */}
            
            {/* --- MODIFIKASI: Kontrol Paginasi (atas) DIHAPUS --- */}
            
            {/* Tampilkan loading di tengah */}
            {loading ? (
                <p className="text-slate-500 text-center py-20">Memuat daftar pengguna...</p>
            ) : (
                /* Tabel Pengguna */
                // --- MODIFIKASI: Hapus margin-top (mt-4) agar menempel ---
                <div className="border rounded-lg overflow-x-auto shadow">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Bisnis</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama PIC</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email PIC</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-16">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.business_name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.pic_name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.pic_email || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleDownloadUserReport(user)}
                                            disabled={loadingUserId === user.id} 
                                            className={`p-1 rounded-md transition-colors flex items-center justify-center
                                                ${loadingUserId === user.id
                                                    ? 'bg-slate-200 text-slate-500 cursor-wait'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                }`}
                                            title={`Unduh laporan emisi untuk ${user.business_name}`}
                                        >
                                            {loadingUserId === user.id ? (
                                                <svg className="animate-spin h-4 w-4 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <DocumentChartBarIcon className="h-5 w-5" />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {/* Kontrol Paginasi (bawah) - Ini tetap ada */}
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
                totalUsers={totalUsers}
            />
        </div>
    );
};


// (Komponen AllUsersReportDownload tidak berubah)
const AllUsersReportDownload = ({ supabase }) => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const handleDownloadAllData = async () => {
        setLoading(true);
        setStatus('Sedang mengambil data dari database...');
        try {
            setStatus('1/3: Mengambil data profil pengguna...');
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, business_name, pic_name, pic_email'); 
            if (profilesError) throw profilesError;
            const profileMap = new Map();
            profilesData.forEach(profile => {
                profileMap.set(profile.id, profile);
            });
            setStatus('2/3: Mengambil data emisi karbon...');
            const { data: carbonEntriesData, error: carbonError } = await supabase
                .from('carbon_entries')
                .select(`
                    user_id, 
                    calculation_title,
                    report_month,
                    created_at,
                    total_co2e_kg,
                    electricity_co2e,
                    transport_co2e,
                    waste_co2e,
                    non_electricity_co2e,
                    electricity_details,
                    waste_details,
                    transport_details
                `);
            if (carbonError) throw carbonError;
            if (!carbonEntriesData || carbonEntriesData.length === 0) {
                 setStatus('Tidak ada data emisi untuk diunduh.');
                 setLoading(false);
                 return;
            }
            setStatus('3/3: Memformat data untuk Excel...');
            const formattedData = carbonEntriesData.map(entry => {
                const profile = profileMap.get(entry.user_id);
                const listriKwh = entry.electricity_details?.kwh || 0;
                const totalWasteKg = entry.waste_details?.items?.reduce((acc, item) => {
                    return acc + (parseFloat(item.weight) || 0);
                }, 0) || 0;
                const totalTransportKm = entry.transport_details?.reduce((acc, item) => {
                    return acc + (parseFloat(item.km) || 0);
                }, 0) || 0;
                return {
                    'Nama Bisnis': profile?.business_name || 'N/A',
                    'Nama PIC': profile?.pic_name || 'N/A',
                    'Email PIC': profile?.pic_email || 'N/A',
                    'User ID': entry.user_id,
                    'Judul Kalkulasi': entry.calculation_title,
                    'Bulan Laporan': entry.report_month,
                    'Tanggal Dibuat': new Date(entry.created_at).toISOString().split('T')[0],
                    'Total Emisi (kg CO2e)': entry.total_co2e_kg,
                    'Emisi Listrik (kg CO2e)': entry.electricity_co2e,
                    'Listrik (kWh)': listriKwh,
                    'Emisi Transportasi (kg CO2e)': entry.transport_co2e,
                    'Transportasi (km)': totalTransportKm,
                    'Emisi Limbah (kg CO2e)': entry.waste_co2e,
                    'Limbah (kg)': totalWasteKg,
                    'Emisi Non-Listrik (kg CO2e)': entry.non_electricity_co2e,
                };
            });
            const ws = XLSX.utils.json_to_sheet(formattedData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Laporan Emisi Global");
            setStatus('Mengunduh file...');
            XLSX.writeFile(wb, "Laporan_Emisi_Semua_Akomodasi_Global.xlsx");
            setStatus('Berhasil diunduh!');
        } catch (error) {
            console.error('Error downloading all data:', error.message);
            setStatus(`Gagal mengunduh: ${error.message}`);
        } finally {
            setLoading(false);
            setTimeout(() => setStatus(''), 5000);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-md border mt-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Laporan Global (Semua Pengguna)</h3>
            <p className="text-slate-500 mb-6">
                Klik tombol di bawah untuk mengunduh laporan total emisi karbon dari **semua pengguna** dalam satu file Excel.
            </p>
            <button
                onClick={handleDownloadAllData}
                disabled={loading}
                className={`px-6 py-3 font-medium text-white rounded-lg transition-colors flex items-center gap-2
                    ${loading 
                        ? 'bg-slate-400 cursor-not-allowed' 
                        : 'bg-green-700 hover:bg-green-800'
                    }`}
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memproses...
                    </>
                ) : (
                    <>
                        <DocumentChartBarIcon className="h-5 w-5" />
                        Unduh Laporan Semua Pengguna
                    </>
                )}
            </button>
            {status && (
                <p className="text-sm text-slate-600 mt-4">
                    {status}
                </p>
            )}
        </div>
    );
};


// (Komponen utama AdminDashboardPage tidak berubah)
export default function AdminDashboardPage({ supabase, user }) {
    return (
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-md border">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Dasbor Admin</h2>
                <p className="text-slate-600">
                    Selamat datang, <span className="font-medium">{user.email}</span>.
                </p>
                <p className="text-slate-500 mt-1">
                    Halaman ini hanya dapat diakses oleh admin. Anda dapat melihat dan mengelola data pengguna di bawah.
                </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border">
                 <h3 className="text-2xl font-bold text-slate-800 mb-4">Manajemen Pengguna</h3>
                 <p className="text-slate-500 mb-4">
                    Berikut adalah daftar semua pengguna yang terdaftar di platform. Klik ikon unduh untuk mendapatkan laporan emisi terperinci per pengguna.
                 </p>
                 {/* UserList sekarang memiliki paginasi di dalamnya */}
                 <UserList supabase={supabase} />
            </div>

            <AllUsersReportDownload supabase={supabase} />
        </div>
    );
}