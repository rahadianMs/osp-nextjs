// app/components/AdminLearningPage.jsx
"use client";

import { useState, useEffect } from 'react';
import { EyeIcon } from './Icons'; // <-- Impor Ikon Baru

// Kategori yang di-hardcode, mirip dengan GSTC
const CATEGORIES = [
    { id: 'Umum', name: 'Umum' },
    { id: 'Onboarding', name: 'Onboarding' },
    { id: 'Kriteria', name: 'Kriteria' },
    { id: 'Lainnya', name: 'Lainnya' },
];

const INITIAL_FORM_STATE = {
    id: null,
    title: '',
    description: '',
    type: 'video',
    category: 'Umum', // Tambahkan category
    thumbnail_url: '',
    content_url: ''
};

// --- TERIMA PROPS 'setActiveDashboardPage' ---
export default function AdminLearningPage({ supabase, setActiveDashboardPage }) {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    // Fungsi untuk mengambil semua materi dari Supabase
    const fetchMaterials = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('learning_materials')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching materials:', error.message);
            setMessage({ type: 'error', text: 'Gagal memuat materi.' });
        } else {
            setMaterials(data || []);
        }
        setLoading(false);
    };

    // Ambil data saat komponen dimuat
    useEffect(() => {
        fetchMaterials();
    }, [supabase]);

    // Menangani perubahan input form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Menangani submit form (Create & Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const { id, ...dataToSubmit } = formData;

        // Pastikan URL thumbnail adalah null jika kosong
        if (!dataToSubmit.thumbnail_url) {
            dataToSubmit.thumbnail_url = null;
        }

        let error;
        if (id) {
            // --- LOGIKA UPDATE ---
            const { error: updateError } = await supabase
                .from('learning_materials')
                .update(dataToSubmit)
                .eq('id', id);
            error = updateError;
        } else {
            // --- LOGIKA CREATE ---
            const { error: insertError } = await supabase
                .from('learning_materials')
                .insert(dataToSubmit);
            error = insertError;
        }

        if (error) {
            setMessage({ type: 'error', text: `Gagal menyimpan: ${error.message}` });
        } else {
            setMessage({ type: 'success', text: `Materi "${formData.title}" berhasil disimpan.` });
            setShowForm(false);
            setFormData(INITIAL_FORM_STATE);
            await fetchMaterials(); // Refresh daftar
        }
        setLoading(false);
    };

    // Menangani Hapus Materi
    const handleDelete = async (materialId, materialTitle) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus materi "${materialTitle}"?`)) {
            return;
        }

        setLoading(true);
        const { error } = await supabase
            .from('learning_materials')
            .delete()
            .eq('id', materialId);

        if (error) {
            setMessage({ type: 'error', text: `Gagal menghapus: ${error.message}` });
        } else {
            setMessage({ type: 'success', text: `Materi "${materialTitle}" berhasil dihapus.` });
            await fetchMaterials(); // Refresh daftar
        }
        setLoading(false);
    };

    // --- Fungsi untuk tombol ---
    const handleAddNew = () => {
        setFormData(INITIAL_FORM_STATE);
        setShowForm(true);
        setMessage({ type: '', text: '' });
    };

    const handleEdit = (material) => {
        setFormData(material);
        setShowForm(true);
        setMessage({ type: '', text: '' });
    };

    const handleCancel = () => {
        setShowForm(false);
        setFormData(INITIAL_FORM_STATE);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-4">
                <h1 className="text-3xl font-bold">Kelola Materi Pembelajaran</h1>
                {/* --- MODIFIKASI: Tombol Admin --- */}
                {!showForm && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setActiveDashboardPage('pembelajaran')}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            <EyeIcon />
                            Lihat Tampilan User
                        </button>
                        <button
                            onClick={handleAddNew}
                            className="px-4 py-2 text-sm font-semibold text-white bg-[#22543d] rounded-lg hover:bg-[#1c4532] transition-colors"
                        >
                            + Tambah Materi Baru
                        </button>
                    </div>
                )}
                {/* --- AKHIR MODIFIKASI --- */}
            </div>

            {/* --- Form Tambah/Edit --- */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border shadow-md space-y-4">
                    <h2 className="text-xl font-semibold">{formData.id ? 'Edit Materi' : 'Tambah Materi Baru'}</h2>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Judul</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="w-full p-2 border border-slate-300 rounded-lg" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Singkat</label>
                        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="3" className="w-full p-2 border border-slate-300 rounded-lg"></textarea>
                    </div>
                    
                    {/* --- TAMBAHAN FORM KATEGORI & TIPE --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">Tipe Materi</label>
                            <select name="type" id="type" value={formData.type} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                                <option value="video">Video</option>
                                <option value="document">Dokumen (PDF)</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                            <select name="category" id="category" value={formData.category} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                                {CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="thumbnail_url" className="block text-sm font-medium text-slate-700 mb-1">URL Gambar Thumbnail</label>
                            <input type="text" name="thumbnail_url" id="thumbnail_url" value={formData.thumbnail_url || ''} onChange={handleChange} placeholder="https://... (Opsional)" className="w-full p-2 border border-slate-300 rounded-lg" />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="content_url" className="block text-sm font-medium text-slate-700 mb-1">URL Konten (Link YouTube / Link PDF)</label>
                        <input type="text" name="content_url" id="content_url" value={formData.content_url} onChange={handleChange} required placeholder="https://..." className="w-full p-2 border border-slate-300 rounded-lg" />
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={handleCancel} disabled={loading} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">
                            Batal
                        </button>
                        <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-semibold text-white bg-[#22543d] rounded-lg hover:bg-[#1c4532] transition-colors disabled:bg-slate-400">
                            {loading ? 'Menyimpan...' : 'Simpan Materi'}
                        </button>
                    </div>
                </form>
            )}
            
            {message.text && (
                <p className={`text-sm p-3 rounded-lg ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </p>
            )}

            {/* --- Daftar Materi yang Ada --- */}
            <div className="bg-white p-6 rounded-xl border shadow-md">
                <h3 className="text-xl font-semibold mb-4">Daftar Materi Saat Ini</h3>
                {loading && materials.length === 0 ? (
                    <p className="text-slate-500">Memuat materi...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b text-sm text-slate-500">
                                <tr>
                                    <th className="py-2 pr-4">Judul</th>
                                    <th className="py-2 px-4">Tipe</th>
                                    <th className="py-2 px-4">Kategori</th>
                                    <th className="py-2 pl-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.map(material => (
                                    <tr key={material.id} className="border-b hover:bg-slate-50">
                                        <td className="py-3 pr-4">
                                            <span className="font-semibold text-slate-800">{material.title}</span>
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${material.type === 'video' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                {material.type}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-600">
                                            {material.category}
                                        </td>
                                        <td className="py-3 pl-4 text-right space-x-2 whitespace-nowrap">
                                            <button 
                                                onClick={() => handleEdit(material)}
                                                className="px-3 py-1 text-sm font-medium text-[#22543d] hover:bg-emerald-50 rounded"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(material.id, material.title)}
                                                className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {!loading && materials.length === 0 && (
                    <p className="text-slate-500 text-center py-4">Belum ada materi yang ditambahkan.</p>
                )}
            </div>
        </div>
    );
}