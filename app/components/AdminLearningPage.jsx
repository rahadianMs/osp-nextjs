// app/components/AdminLearningPage.jsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Impor ikon yang ada
import { 
    PlayCircleIcon, DocumentTextIcon, VideoCameraIcon, BookOpenIcon, 
    ArrowLeftIcon, PlusCircleIcon, PencilIcon, 
    TrashCanIcon, UserCircleIcon // <-- 1. TAMBAHKAN UserCircleIcon
} from './Icons';

// --- KATEGORI BARU DITERAPKAN DI SINI ---
// Kategori ini sekarang sinkron dengan PembelajaranPage.jsx
const CATEGORIES = [
    { id: 'dasar', name: 'Dasar & pemahaman umum' },
    { id: 'metodologi', name: 'Metodologi dan Panduan Teknis' },
    { id: 'strategi', name: 'Strategi & Tindakan Pengurangan Emisi' },
    { id: 'kebijakan', name: 'Kebijakan & Kerangka Nasional / Global' },
    { id: 'glosarium', name: 'Glosarium & Tanya Jawab Teknis' }
];
// --- AKHIR BLOK KATEGORI BARU ---

// Thumbnail default (tidak diubah)
const DEFAULT_VIDEO_THUMBNAIL = "https://images.unsplash.com/photo-1610484826967-09c5720778c7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170";
const DEFAULT_DOCUMENT_THUMBNAIL = "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1198";


// --- Komponen Form (Modal) ---
const MaterialForm = ({ supabase, onSave, onCancel, initialData }) => {
    const [formData, setFormData] = useState(
        initialData || {
            title: '',
            description: '',
            type: 'video',
            content_url: '',
            thumbnail_url: '',
            category: CATEGORIES[0].id, // Default ke kategori pertama yang baru
        }
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        let query;
        const dataToSubmit = {
            ...formData,
            // Jika thumbnail kosong, gunakan default berdasarkan tipe
            thumbnail_url: formData.thumbnail_url || (formData.type === 'video' ? DEFAULT_VIDEO_THUMBNAIL : DEFAULT_DOCUMENT_THUMBNAIL),
        };

        if (initialData && initialData.id) {
            // Update
            query = supabase.from('learning_materials').update(dataToSubmit).eq('id', initialData.id);
        } else {
            // Insert
            query = supabase.from('learning_materials').insert(dataToSubmit);
        }

        const { error: dbError } = await query;

        if (dbError) {
            console.error('Error saving material:', dbError.message);
            setError(dbError.message);
        } else {
            onSave(); // Sukses, panggil callback
        }
        setIsSubmitting(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8"
            >
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    {initialData ? 'Edit Materi' : 'Tambah Materi Baru'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-600 mb-1">Judul</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleFormChange}
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22543d]"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-600 mb-1">Deskripsi Singkat</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleFormChange}
                            rows="3"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22543d]"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-slate-600 mb-1">Tipe</label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleFormChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22543d]"
                            >
                                <option value="video">Video</option>
                                <option value="document">Dokumen</option>
                            </select>
                        </div>
                        
                        <div className="md:col-span-2">
                            <label htmlFor="category" className="block text-sm font-medium text-slate-600 mb-1">Kategori</label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleFormChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22543d]"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="content_url" className="block text-sm font-medium text-slate-600 mb-1">URL Konten</label>
                        <p className="text-xs text-slate-500 mb-1">
                            {formData.type === 'video' 
                                ? 'Link Youtube (misal: https://www.youtube.com/watch?v=XXXXXXXXXXX)' 
                                : 'Link Google Drive/PDF (pastikan publik)'
                            }
                        </p>
                        <input
                            type="url"
                            id="content_url"
                            name="content_url"
                            value={formData.content_url}
                            onChange={handleFormChange}
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22543d]"
                        />
                    </div>

                    <div>
                        <label htmlFor="thumbnail_url" className="block text-sm font-medium text-slate-600 mb-1">URL Thumbnail (Opsional)</label>
                        <input
                            type="url"
                            id="thumbnail_url"
                            name="thumbnail_url"
                            value={formData.thumbnail_url}
                            onChange={handleFormChange}
                            placeholder="Kosongkan untuk pakai default"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22543d]"
                        />
                    </div>
                    
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                            Error: {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="px-6 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 text-sm font-semibold text-white bg-[#22543d] rounded-lg hover:bg-[#1c4532] transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};


// --- Komponen List Materi ---
const MaterialList = ({ resources, onEdit, onDelete, activeTab }) => {
    const getFilteredResources = () => {
        return resources.filter(r => r.category === activeTab);
    };

    const filtered = getFilteredResources();

    const getIconForType = (type) => {
        if (type === 'video') return <VideoCameraIcon className="w-4 h-4 text-blue-500" />;
        return <DocumentTextIcon className="w-4 h-4 text-green-500" />;
    };

    return (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Judul</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipe</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {filtered.length > 0 ? (
                        filtered.map(resource => (
                            <tr key={resource.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900">{resource.title}</div>
                                    <div className="text-sm text-slate-500 line-clamp-1">{resource.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                        {getIconForType(resource.type)}
                                        {resource.type === 'video' ? 'Video' : 'Dokumen'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button 
                                        onClick={() => onEdit(resource)}
                                        className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-md transition-colors"
                                        aria-label="Edit"
                                    >
                                        <PencilIcon />
                                    </button>
                                    <button 
                                        onClick={() => onDelete(resource.id)}
                                        className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-md transition-colors"
                                        aria-label="Hapus"
                                    >
                                        <TrashCanIcon /> 
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="px-6 py-10 text-center text-sm text-slate-500">
                                Belum ada materi untuk kategori ini.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};


// --- Komponen Utama Halaman Admin ---
export default function AdminLearningPage({ supabase, setActiveDashboardPage }) {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [activeTab, setActiveTab] = useState(CATEGORIES[0].id); // Default ke tab pertama yang baru
    const [showConfirmDelete, setShowConfirmDelete] = useState(null); // Menyimpan ID

    const fetchResources = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('learning_materials')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching resources:', error.message);
        } else {
            setResources(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchResources();
    }, [supabase]);

    const handleSave = () => {
        setShowModal(false);
        setEditingMaterial(null);
        fetchResources(); // Ambil ulang data setelah menyimpan
    };

    const handleCancel = () => {
        setShowModal(false);
        setEditingMaterial(null);
    };

    const handleAddNew = () => {
        setEditingMaterial(null);
        setShowModal(true);
    };

    const handleEdit = (resource) => {
        setEditingMaterial(resource);
        setShowModal(true);
    };

    const handleDelete = async () => {
        if (!showConfirmDelete) return;
        
        const { error } = await supabase
            .from('learning_materials')
            .delete()
            .eq('id', showConfirmDelete);

        if (error) {
            console.error('Error deleting material:', error.message);
            alert('Gagal menghapus materi.');
        } else {
            fetchResources(); // Ambil ulang data
        }
        setShowConfirmDelete(null); // Tutup modal konfirmasi
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <button
                onClick={() => setActiveDashboardPage('admin-dashboard')}
                className="flex items-center gap-2 text-sm font-semibold text-[#22543d] hover:text-[#1c4532] transition-colors"
            >
                <ArrowLeftIcon />
                Kembali ke Dasbor Admin
            </button>

            {/* --- 2. BLOK TOMBOL HEADER DIPERBARUI --- */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-extrabold text-slate-900">Kelola Materi Pembelajaran</h1>
                    <p className="text-lg text-slate-600 mt-2">Lihat, tambah, edit, atau hapus materi.</p>
                </div>
                
                <div className="flex-shrink-0 flex items-center gap-3"> 
                    {/* Tombol "Lihat Sisi User" BARU */}
                    <button
                        onClick={() => setActiveDashboardPage('pembelajaran')}
                        className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#22543d] bg-white border border-[#22543d] rounded-lg hover:bg-green-50 transition-colors shadow-sm"
                    >
                        <UserCircleIcon />
                        Lihat Sisi User
                    </button>
                    {/* Tombol "Tambah Materi Baru" yang sudah ada */}
                    <button
                        onClick={handleAddNew}
                        className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#22543d] rounded-lg hover:bg-[#1c4532] transition-colors shadow-lg"
                    >
                        <PlusCircleIcon />
                        Tambah Materi Baru
                    </button>
                </div>
            </div>
            {/* --- AKHIR BLOK TOMBOL HEADER --- */}
            
            {/* Navigasi Tab Kategori */}
            <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100 rounded-xl">
                {CATEGORIES.map(category => (
                    <button
                        key={category.id}
                        onClick={() => setActiveTab(category.id)}
                        className={`flex items-center gap-2.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                            activeTab === category.id
                                ? 'bg-white text-[#22543d] shadow'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        {/* Ikon sengaja tidak ditampilkan di admin untuk UI yang lebih bersih */}
                        <span>{category.name}</span>
                    </button>
                ))}
            </div>
            
            {/* List Materi */}
            {loading ? (
                <div className="text-center py-10 text-slate-500">Memuat materi...</div>
            ) : (
                <MaterialList
                    resources={resources}
                    onEdit={handleEdit}
                    onDelete={(id) => setShowConfirmDelete(id)} // Tampilkan konfirmasi
                    activeTab={activeTab}
                />
            )}
            
            {/* Modal Form */}
            <AnimatePresence>
                {showModal && (
                    <MaterialForm
                        supabase={supabase}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        initialData={editingMaterial}
                    />
                )}
            </AnimatePresence>

            {/* Modal Konfirmasi Hapus */}
            <AnimatePresence>
                {showConfirmDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8"
                        >
                            <h3 className="text-xl font-bold text-slate-800">Konfirmasi Hapus</h3>
                            <p className="text-slate-600 mt-4 mb-6">
                                Apakah Anda yakin ingin menghapus materi ini? Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmDelete(null)}
                                    className="px-6 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="px-6 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Ya, Hapus
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}