// app/components/PembelajaranPage.jsx
"use client";

import { useState, useEffect } from 'react';
import { PlayCircleIcon, DocumentTextIcon, VideoCameraIcon, BookOpenIcon, ArrowLeftIcon } from './Icons'; // Impor ArrowLeftIcon

// --- DEFINISIKAN THUMBNAIL DEFAULT DI SINI ---
const DEFAULT_VIDEO_THUMBNAIL = "https://images.unsplash.com/photo-1610484826967-09c5720778c7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170";
const DEFAULT_DOCUMENT_THUMBNAIL = "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1198";
// --- AKHIR DEFINISI ---

// Kategori yang sama dengan di halaman Admin
const CATEGORIES = [
    { id: 'Onboarding', name: 'Onboarding', icon: <VideoCameraIcon /> },
    { id: 'Kriteria', name: 'Kriteria', icon: <BookOpenIcon /> },
    { id: 'Umum', name: 'Umum', icon: <VideoCameraIcon /> },
    { id: 'Lainnya', name: 'Lainnya', icon: <BookOpenIcon /> },
];

// --- Komponen Card Materi ---
const ResourceCard = ({ resource, onResourceSelect }) => {
    const isVideo = resource.type === 'video';
    const Icon = isVideo ? PlayCircleIcon : DocumentTextIcon;

    // --- LOGIKA THUMBNAIL BARU ---
    let thumbnailUrl = resource.thumbnail_url; // 1. Coba pakai URL dari database
    if (!thumbnailUrl) {
        // 2. Jika tidak ada, pakai default berdasarkan tipe
        thumbnailUrl = isVideo ? DEFAULT_VIDEO_THUMBNAIL : DEFAULT_DOCUMENT_THUMBNAIL;
    }
    // --- AKHIR LOGIKA THUMBNAIL ---

    return (
        <div 
            className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col group cursor-pointer"
            onClick={() => onResourceSelect(resource)}
        >
            <div className="w-full h-40 bg-slate-100 flex items-center justify-center overflow-hidden relative">
                <img 
                    src={thumbnailUrl} 
                    alt={resource.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Icon className="w-12 h-12 text-white" />
                </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 flex-1">{resource.title}</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4 line-clamp-2">{resource.description}</p>
                <button 
                    onClick={() => onResourceSelect(resource)}
                    className="w-full px-4 py-2 text-sm font-semibold text-white bg-[#22543d] rounded-lg hover:bg-[#1c4532] transition-colors"
                >
                    {isVideo ? 'Tonton Video' : 'Baca Dokumen'}
                </button>
            </div>
        </div>
    );
};

// --- Komponen Utama Halaman Pembelajaran ---
// --- MODIFIKASI: Terima 'userRole' ---
export default function PembelajaranPage({ supabase, setActiveDashboardPage, setSelectedResource, userRole }) {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(CATEGORIES[0].id);

    // Ambil data dari Supabase
    useEffect(() => {
        const fetchResources = async () => {
            if (!supabase) return;
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
        fetchResources();
    }, [supabase]);

    // Fungsi untuk mem-filter materi berdasarkan tab yang aktif
    const getFilteredResources = () => {
        return resources.filter(r => r.category === activeTab);
    };

    // Fungsi untuk menangani klik pada materi
    const handleResourceSelect = (resource) => {
        if (resource.type === 'video') {
            setSelectedResource(resource); // Simpan resource yang dipilih
            setActiveDashboardPage('video-detail'); // Pindah ke halaman detail
        } else {
            // Untuk dokumen, buka di tab baru
            window.open(resource.content_url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            
            {/* --- TAMBAHAN TOMBOL KEMBALI UNTUK ADMIN --- */}
            {userRole === 'admin' && (
                <button
                    onClick={() => setActiveDashboardPage('admin-learning')}
                    className="flex items-center gap-2 text-sm font-semibold text-[#22543d] hover:text-[#1c4532] transition-colors"
                >
                    <ArrowLeftIcon />
                    Kembali ke Kelola Materi
                </button>
            )}
            {/* --- AKHIR TAMBAHAN --- */}

            <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-4xl font-extrabold text-slate-900">Pusat Pembelajaran</h1>
                <p className="text-lg text-slate-600 mt-3">
                    Perdalam pengetahuan Anda tentang pariwisata berkelanjutan melalui video dan dokumen panduan kami.
                </p>
            </div>

            {/* --- Navigasi Tab Kategori --- */}
            <div className="flex items-center justify-center gap-2 p-1.5 bg-slate-100 rounded-xl">
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
                        {category.icon}
                        <span>{category.name}</span>
                    </button>
                ))}
            </div>

            {/* --- Konten Materi --- */}
            {loading ? (
                <div className="text-center py-10 text-slate-500">Memuat materi...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {getFilteredResources().length > 0 ? (
                        getFilteredResources().map(resource => (
                            <ResourceCard 
                                key={resource.id} 
                                resource={resource} 
                                onResourceSelect={handleResourceSelect}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-16 bg-white rounded-xl border">
                            <h3 className="text-xl font-semibold text-slate-700">Belum Ada Materi</h3>
                            <p className="text-slate-500 mt-2">Belum ada materi yang tersedia untuk kategori ini.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}