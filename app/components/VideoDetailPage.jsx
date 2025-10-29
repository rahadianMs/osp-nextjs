// app/components/VideoDetailPage.jsx
"use client";

import { ArrowLeftIcon } from './Icons';

// Fungsi untuk mengekstrak ID video YouTube dari URL
function getYouTubeEmbedUrl(url) {
    if (!url) return null;
    let embedUrl = null;
    
    // Pola regex untuk berbagai format URL YouTube
    const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            embedUrl = `https://www.youtube.com/embed/${match[1]}`;
            break;
        }
    }
    
    // Jika bukan URL YouTube, kembalikan null (atau URL asli jika ingin mendukung platform lain)
    return embedUrl;
}


export default function VideoDetailPage({ selectedResource, setActiveDashboardPage }) {
    if (!selectedResource) {
        return (
            <div className="text-center text-slate-500">
                Materi tidak ditemukan.
                <button
                    onClick={() => setActiveDashboardPage('pembelajaran')}
                    className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-[#22543d] hover:text-[#1c4532]"
                >
                    <ArrowLeftIcon />
                    Kembali ke Daftar
                </button>
            </div>
        );
    }
    
    const embedUrl = getYouTubeEmbedUrl(selectedResource.content_url);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button
                onClick={() => setActiveDashboardPage('pembelajaran')}
                className="flex items-center gap-2 text-sm font-semibold text-[#22543d] hover:text-[#1c4532] transition-colors"
            >
                <ArrowLeftIcon />
                Kembali ke Daftar Materi
            </button>

            <div className="bg-white p-6 rounded-xl shadow-md border">
                {selectedResource.type === 'video' && embedUrl ? (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                        <iframe
                            className="w-full h-full"
                            src={embedUrl}
                            title={selectedResource.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    </div>
                ) : (
                    <p className="text-center text-slate-600 p-8">
                        {selectedResource.type === 'video' ? 'Format video tidak didukung.' : 'Ini adalah dokumen.'}
                    </p>
                )}

                <h1 className="text-3xl font-bold text-slate-900">{selectedResource.title}</h1>
                <p className="text-slate-600 mt-3 text-base">{selectedResource.description}</p>
            </div>
        </div>
    );
}