"use client";

import { useState, useEffect } from 'react';

// Komponen untuk Halaman Laporan Keberlanjutan
export default function SustainabilityPage({ supabase, user }) {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State untuk form
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Listrik');
    const [activityDate, setActivityDate] = useState(new Date().toISOString().slice(0, 10)); // State baru untuk tanggal

    // State untuk konfirmasi hapus
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    const fetchReports = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('sustainability_reports')
            .select('*')
            .eq('user_id', user.id)
            .order('activity_date', { ascending: false }); // Urutkan berdasarkan tanggal kegiatan

        if (error) {
            console.error('Error fetching reports:', error);
            setError('Gagal memuat laporan.');
        } else {
            setReports(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReports();
    }, [user, supabase]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error: insertError } = await supabase
            .from('sustainability_reports')
            .insert({ user_id: user.id, title, description, category, activity_date: activityDate });

        if (insertError) {
            setError('Gagal menyimpan laporan. Coba lagi.');
        } else {
            setTitle('');
            setDescription('');
            setCategory('Listrik');
            setActivityDate(new Date().toISOString().slice(0, 10));
            await fetchReports();
        }
        setLoading(false);
    };

    const handleDeleteRequest = (report) => {
        setSelectedReport(report);
        setShowDeleteConfirm(true);
    };

    const handleCancelDelete = () => {
        setSelectedReport(null);
        setShowDeleteConfirm(false);
    };

    const handleConfirmDelete = async () => {
        if (!selectedReport) return;
        setLoading(true);
        const { error: deleteError } = await supabase
            .from('sustainability_reports')
            .delete()
            .match({ id: selectedReport.id });
        
        if (deleteError) {
            setError('Gagal menghapus laporan. Coba lagi.');
        } else {
            await fetchReports();
        }
        handleCancelDelete();
        setLoading(false);
    };

    const groupedReports = reports.reduce((acc, report) => {
        (acc[report.category] = acc[report.category] || []).push(report);
        return acc;
    }, {});

    const categories = ['Listrik', 'Transportasi', 'Limbah'];

    return (
        <div className="space-y-10">
            <div className="bg-white p-8 rounded-xl shadow-md border">
                <h3 className="text-2xl font-bold mb-6">Buat Laporan Keberlanjutan Baru</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Judul Kegiatan</label>
                            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Pemasangan Panel Surya" required className="w-full p-2 border border-slate-300 rounded-lg"/>
                        </div>
                        <div>
                            <label htmlFor="activityDate" className="block text-sm font-medium text-slate-700 mb-1">Tanggal Kegiatan</label>
                            <input id="activityDate" type="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} required className="w-full p-2 border border-slate-300 rounded-lg"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Kegiatan</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Jelaskan secara singkat kegiatan yang telah dilakukan..." required className="w-full p-2 border border-slate-300 rounded-lg" rows="4"></textarea>
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                            <option>Listrik</option>
                            <option>Transportasi</option>
                            <option>Limbah</option>
                        </select>
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3 text-base font-semibold text-white bg-[#348567] rounded-lg hover:bg-[#2A6A52] transition-colors disabled:bg-slate-400">
                        {loading ? 'Menyimpan...' : 'Simpan Laporan'}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </form>
            </div>

            <div>
                <h3 className="text-2xl font-bold mb-6">Riwayat Laporan Keberlanjutan</h3>
                {loading && <p>Memuat laporan...</p>}
                {!loading && reports.length === 0 && (
                    <p className="text-slate-500 bg-white p-6 rounded-lg shadow-sm border">Anda belum memiliki laporan keberlanjutan.</p>
                )}
                <div className="space-y-6">
                    {categories.map(cat => (
                        groupedReports[cat] && groupedReports[cat].length > 0 && (
                            <div key={cat}>
                                <h4 className="text-xl font-semibold mb-3 text-slate-600">{cat}</h4>
                                <div className="space-y-3">
                                    {groupedReports[cat].map(report => (
                                        <div key={report.id} className="bg-white p-4 rounded-lg border shadow-sm flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-slate-800">{report.title}</p>
                                                <p className="text-slate-600 text-sm">{report.description}</p>
                                                <p className="text-xs text-slate-400 mt-2">
                                                    Tanggal Kegiatan: {new Date(report.activity_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <button onClick={() => handleDeleteRequest(report)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full" title="Hapus Laporan">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </div>

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-4">Konfirmasi Hapus</h2>
                        <p className="text-slate-600 mb-6">
                            Apakah Anda yakin ingin menghapus laporan <span className="font-semibold">"{selectedReport?.title}"</span>? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button onClick={handleCancelDelete} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">Batal</button>
                            <button onClick={handleConfirmDelete} disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-slate-400">
                                {loading ? 'Menghapus...' : 'Ya, Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}