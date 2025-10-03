"use client";

import { useState, useEffect, useCallback } from 'react';
import CarbonCalculator from './CarbonCalculator';
import EmissionHistory from './EmissionHistory';

// Komponen baru ini berfungsi sebagai "wadah" untuk halaman Laporan Emisi,
// yang berisi kalkulator dan riwayat laporan.
export default function EmissionReportPage({ supabase, user }) {
const [entries, setEntries] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [selectedEntry, setSelectedEntry] = useState(null);

// Mengambil data riwayat dari Supabase.
// useCallback digunakan untuk mencegah fungsi ini dibuat ulang pada setiap render.
const fetchEntries = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
        .from('carbon_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('report_month', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching carbon entries:', error);
        setError('Gagal memuat data laporan.');
    } else {
        setEntries(data);
        setError(''); // Hapus error sebelumnya jika berhasil
    }
    setLoading(false);
}, [user, supabase]);

// Jalankan fetchEntries saat komponen pertama kali dimuat.
useEffect(() => {
    fetchEntries();
}, [fetchEntries]);

// Fungsi untuk menampilkan modal konfirmasi saat tombol hapus diklik.
const handleDeleteClick = (entry) => {
    setSelectedEntry(entry);
    setShowDeleteConfirm(true);
};

// Fungsi untuk menghapus data dari Supabase.
const confirmDelete = async () => {
    if (!selectedEntry) return;

    const { error: deleteError } = await supabase
        .from('carbon_entries')
        .delete()
        .match({ id: selectedEntry.id });

    if (deleteError) {
        setError(`Gagal menghapus: ${deleteError.message}`);
    } else {
        // Ambil ulang data setelah berhasil menghapus untuk memastikan daftar selalu update.
        await fetchEntries();
    }
    setShowDeleteConfirm(false);
    setSelectedEntry(null);
};

return (
    <div className="space-y-10">
        {/* Komponen Kalkulator, dengan prop onReportSaved untuk refresh data */}
        <CarbonCalculator
            supabase={supabase}
            user={user}
            onReportSaved={fetchEntries}
        />
        {/* Komponen Riwayat, sekarang menerima semua data dan fungsi sebagai props */}
        <EmissionHistory
            entries={entries}
            loading={loading}
            error={error}
            onDeleteClick={handleDeleteClick}
            showDeleteConfirm={showDeleteConfirm}
            onCancelDelete={() => setShowDeleteConfirm(false)}
            onConfirmDelete={confirmDelete}
            selectedEntry={selectedEntry}
        />
    </div>
);

}