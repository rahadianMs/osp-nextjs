"use client";

import React, { useState } from 'react';
// 1. Impor library excel yang sudah Anda install
import * as XLSX from 'xlsx';

export default function AdminDownloadPage({ supabase }) {
    
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    // Fungsi untuk handle unduh data
    const handleDownloadAllData = async () => {
        setLoading(true);
        setStatus('Sedang mengambil data dari database...');
        
        try {
            // --- MODIFIKASI: Mengambil data secara terpisah dan join manual ---

            // 1. Fetch data PROFIL
            // Kita ambil semua profil dan simpan dalam format Map untuk pencarian cepat
            setStatus('1/3: Mengambil data profil pengguna...');
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, business_name, pic_name, pic_email'); // 'id' di sini adalah user_id

            if (profilesError) throw profilesError;

            // Buat 'lookup map' agar mudah mencari profil berdasarkan ID
            const profileMap = new Map();
            profilesData.forEach(profile => {
                profileMap.set(profile.id, profile);
            });

            // 2. Fetch data ENTRI KARBON
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
                    non_electricity_co2e
                `);

            if (carbonError) throw carbonError;

            if (!carbonEntriesData || carbonEntriesData.length === 0) {
                 setStatus('Tidak ada data emisi untuk diunduh.');
                 setLoading(false);
                 return;
            }

            setStatus('3/3: Memformat data untuk Excel...');
            
            // 3. Format data (Gabungkan/Join manual di JavaScript)
            const formattedData = carbonEntriesData.map(entry => {
                // Cari profil yang cocok menggunakan 'user_id' dari entri karbon
                const profile = profileMap.get(entry.user_id);

                // Kembalikan objek gabungan
                return {
                    'Nama Bisnis': profile?.business_name || 'N/A',
                    'Nama PIC': profile?.pic_name || 'N/A',
                    'Email PIC': profile?.pic_email || 'N/A',
                    'User ID': entry.user_id, // Tambahkan ini untuk debugging jika perlu
                    'Judul Kalkulasi': entry.calculation_title,
                    'Bulan Laporan': entry.report_month,
                    'Tanggal Dibuat': new Date(entry.created_at).toISOString().split('T')[0],
                    'Total Emisi (kg CO2e)': entry.total_co2e_kg,
                    'Emisi Listrik (kg CO2e)': entry.electricity_co2e,
                    'Emisi Transportasi (kg CO2e)': entry.transport_co2e,
                    'Emisi Limbah (kg CO2e)': entry.waste_co2e,
                    'Emisi Non-Listrik (kg CO2e)': entry.non_electricity_co2e,
                };
            });
            // --- AKHIR MODIFIKASI ---

            // 4. Buat worksheet dan workbook
            const ws = XLSX.utils.json_to_sheet(formattedData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Laporan Emisi Akomodasi");
            
            // 5. Trigger download
            setStatus('Mengunduh file...');
            XLSX.writeFile(wb, "Laporan_Emisi_Semua_Akomodasi.xlsx");
            
            setStatus('Berhasil diunduh!');

        } catch (error) {
            // Tangkap error dari kedua query
            console.error('Error downloading data:', error.message);
            // Tampilkan pesan error yang lebih jelas
            setStatus(`Gagal mengunduh: ${error.message}`);
        } finally {
            setLoading(false);
            // Hapus status setelah beberapa detik
            setTimeout(() => setStatus(''), 5000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md border">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Unduh Laporan Excel</h2>
            <p className="text-slate-500 mb-6">
                Klik tombol di bawah untuk mengunduh laporan total emisi karbon untuk semua akomodasi (user) dalam format `.xlsx`.
            </p>
            
            <button
                onClick={handleDownloadAllData}
                disabled={loading}
                className={`px-6 py-3 font-medium text-white rounded-lg transition-colors ${
                    loading 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-green-700 hover:bg-green-800'
                }`}
            >
                {loading ? 'Memproses...' : 'Unduh Laporan (Semua User)'}
            </button>

            {status && (
                <p className="text-sm text-slate-600 mt-4">
                    {/* Hapus 'animate-pulse' jika dirasa mengganggu */}
                    {status}
                </p>
            )}
        </div>
    );
}