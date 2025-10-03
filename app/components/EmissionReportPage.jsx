"use client";

import { useState, useEffect, useCallback } from 'react';
import CarbonCalculator from './CarbonCalculator';
import EmissionHistory from './EmissionHistory';

// Komponen "wadah" untuk halaman Laporan Emisi
export default function EmissionReportPage({ supabase, user }) {
const [entries, setEntries] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [refreshKey, setRefreshKey] = useState(Date.now()); // State untuk memicu refresh

// State untuk modal konfirmasi hapus
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [entryToDelete, setEntryToDelete] = useState(null);

// Memindahkan logika fetch ke dalam useEffect untuk stabilitas
useEffect(() => {
    const fetchEntries = async () => {
        if (!user) return;
        
        setLoading(true);
        setError('');
        const { data, error } = await supabase
            .from('carbon_entries')
            .select('*')
            .eq('user_id', user.id)
            .order('report_month', { ascending: false });

        if (error) {
            console.error('Error fetching carbon entries:', error);
            setError(`Gagal memuat riwayat: ${error.message}`);
        } else {
            setEntries(data);
        }
        setLoading(false);
    };

    fetchEntries();
}, [user, supabase, refreshKey]); // useEffect akan berjalan saat user, supabase, atau refreshKey berubah

const handleReportSubmitted = () => {
    setRefreshKey(Date.now()); // Ubah `key` untuk memicu useEffect dan refresh data
};

// --- Fungsi untuk mengelola modal hapus ---
const handleDeleteClick = (entry) => {
    setEntryToDelete(entry);
    setShowDeleteConfirm(true);
};

const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setEntryToDelete(null);
};

const handleConfirmDelete = async () => {
    if (!entryToDelete) return;

    const { error } = await supabase
        .from('carbon_entries')
        .delete()
        .match({ id: entryToDelete.id });

    if (error) {
        setError(`Gagal menghapus laporan: ${error.message}`);
    } else {
        // Hapus entri dari state secara lokal untuk UI update instan
        setEntries(entries.filter(e => e.id !== entryToDelete.id));
    }

    handleCancelDelete(); // Tutup modal setelah selesai
};

return (
    <div className="space-y-10">
        <CarbonCalculator 
            supabase={supabase} 
            user={user} 
            onReportSubmitted={handleReportSubmitted} 
        />
        
        <EmissionHistory
            entries={entries}
            loading={loading}
            error={error}
            onDeleteClick={handleDeleteClick}
        />

        {/* Modal Konfirmasi Hapus */}
        {showDeleteConfirm && entryToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
                    <h2 className="text-xl font-bold mb-4">Konfirmasi Hapus</h2>
                    <p className="text-slate-600 mb-6">
                        Apakah Anda yakin ingin menghapus laporan 
                        <span className="font-semibold"> "{entryToDelete.calculation_title || 'Laporan tanpa judul'}"</span>? 
                        Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={handleCancelDelete}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                        >
                            Ya, Hapus
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
);

}