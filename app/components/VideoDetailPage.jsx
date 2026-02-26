// app/components/VideoDetailPage.jsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { ArrowLeftIcon } from './Icons';

// Fungsi untuk mengekstrak ID video YouTube dari URL
function getYouTubeEmbedUrl(url) {
    if (!url) return null;
    let embedUrl = null;

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

    return embedUrl;
}


export default function VideoDetailPage() {
    const params = useParams();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResource = async () => {
            if (!params.id) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('learning_materials')
                .select('*')
                .eq('id', params.id)
                .single();

            if (error) {
                console.error('Error fetching resource:', error.message);
            } else {
                setResource(data);
            }
            setLoading(false);
        };
        fetchResource();
    }, [params.id]);

    if (loading) {
        return <div className="text-center py-10 text-slate-500">Memuat materi...</div>;
    }

    if (!resource) {
        return (
            <div className="text-center text-slate-500">
                Materi tidak ditemukan.
                <Link
                    href="/dashboard/pembelajaran"
                    className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-[#22543d] hover:text-[#1c4532]"
                >
                    <ArrowLeftIcon />
                    Kembali ke Daftar
                </Link>
            </div>
        );
    }

    const embedUrl = getYouTubeEmbedUrl(resource.content_url);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link
                href="/dashboard/pembelajaran"
                className="flex items-center gap-2 text-sm font-semibold text-[#22543d] hover:text-[#1c4532] transition-colors"
            >
                <ArrowLeftIcon />
                Kembali ke Daftar Materi
            </Link>

            <div className="bg-white p-6 rounded-xl shadow-md border">
                {resource.type === 'video' && embedUrl ? (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                        <iframe
                            className="w-full h-full"
                            src={embedUrl}
                            title={resource.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    </div>
                ) : (
                    <p className="text-center text-slate-600 p-8">
                        {resource.type === 'video' ? 'Format video tidak didukung.' : 'Ini adalah dokumen.'}
                    </p>
                )}

                <h1 className="text-3xl font-bold text-slate-900">{resource.title}</h1>
                <p className="text-slate-600 mt-3 text-base">{resource.description}</p>
            </div>
        </div>
    );
}