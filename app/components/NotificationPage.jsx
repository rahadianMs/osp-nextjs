"use client";

import React, { useState, useEffect } from 'react';
// MODIFIKASI: Hapus import EnvelopeIcon, EnvelopeOpenIcon yang tidak ada
// Ganti dengan ikon yang tersedia
import { TrashIcon, BellIcon, BookOpenIcon } from './Icons.jsx';

// Komponen Notifikasi (Halaman User - Inbox Style)
export default function NotificationPage({ supabase, user }) {

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State untuk "Selected Message" (Fitur ala Email: Klik untuk baca detail)
    const [selectedMessage, setSelectedMessage] = useState(null);

    // Fungsi fetch notifikasi (Logika Backend TETAP SAMA)
    const fetchNotifications = async () => {
        if (!user || !supabase) return;
        try {
            setLoading(true);
            setError(null);

            // 1. Ambil semua notifikasi
            const { data: allNotifs, error: notifError } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false });
            if (notifError) throw notifError;

            if (!allNotifs || allNotifs.length === 0) {
                setNotifications([]);
                setLoading(false);
                return;
            }

            // 2. Cek status baca broadcast
            const broadcastIdsToCheck = allNotifs
                .filter(n => n.recipient_id === null && !n.is_read)
                .map(n => n.id);

            let readBroadcastIds = new Set();
            if (broadcastIdsToCheck.length > 0) {
                const { data: readStatuses, error: readStatusError } = await supabase
                    .from('user_read_broadcasts')
                    .select('notification_id')
                    .eq('user_id', user.id)
                    .in('notification_id', broadcastIdsToCheck);

                if (readStatusError) throw readStatusError;
                readBroadcastIds = new Set(readStatuses.map(r => r.notification_id));
            }

            // 3. Gabungkan status baca
            const finalNotifications = allNotifs.map(notif => {
                const isBroadcastRead = notif.recipient_id === null && readBroadcastIds.has(notif.id);
                // Prioritaskan status lokal 'isBroadcastRead' jika itu broadcast
                const isRead = notif.recipient_id ? notif.is_read : isBroadcastRead;
                
                return { ...notif, is_read: isRead };
            });

            setNotifications(finalNotifications);

        } catch (err) {
            console.error("Error fetching notifications:", err.message);
            setError("Gagal memuat notifikasi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supabase, user]);

    // Fungsi tandai sudah dibaca (Dipanggil saat pesan diklik)
    const handleSelectMessage = async (notif) => {
        setSelectedMessage(notif);

        // Hanya tandai baca jika belum dibaca
        if (!notif.is_read) {
            try {
                const isBroadcast = !notif.recipient_id;
                let error;

                if (isBroadcast) {
                    const { error: insertError } = await supabase
                        .from('user_read_broadcasts')
                        .insert({ user_id: user.id, notification_id: notif.id });
                    error = insertError;
                } else {
                    const { error: updateError } = await supabase
                        .from('notifications')
                        .update({ is_read: true })
                        .eq('id', notif.id)
                        .eq('recipient_id', user.id);
                    error = updateError;
                }

                if (error) throw error;

                // Update state lokal
                setNotifications(currentNotifs =>
                    currentNotifs.map(n =>
                        n.id === notif.id ? { ...n, is_read: true } : n
                    )
                );
            } catch (err) {
                console.error("Error marking as read:", err.message);
            }
        }
    };

    // Fungsi Hapus
    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Mencegah trigger klik baris (select message)
        if (!confirm("Hapus pesan ini?")) return;
        
        try {
            const { error } = await supabase.rpc('delete_notification_for_user', { notification_id: id });
            if (error) throw error;
            
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (selectedMessage?.id === id) setSelectedMessage(null);
            
        } catch (err) {
            console.error("Error deleting notification:", err.message);
            alert("Gagal menghapus notifikasi.");
        }
    };

    // Helper Format Tanggal
    const formatDateList = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const formatDateDetail = (dateString) => new Date(dateString).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header Inbox */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    {/* Ganti EnvelopeIcon dengan BellIcon */}
                    <BellIcon /> 
                    Kotak Masuk
                </h2>
                <span className="text-sm text-slate-500">
                    {notifications.filter(n => !n.is_read).length} Belum Dibaca
                </span>
            </div>

            {/* Konten Utama: Split View (List Kiri, Detail Kanan) */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* --- LIST PESAN (KIRI) --- */}
                <div className={`${selectedMessage ? 'hidden md:block md:w-1/3 lg:w-2/5' : 'w-full'} border-r border-slate-200 overflow-y-auto`}>
                    {loading && <div className="p-8 text-center text-slate-400 animate-pulse">Memuat pesan...</div>}
                    
                    {!loading && notifications.length === 0 && (
                        <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                            {/* Ganti EnvelopeOpenIcon dengan BookOpenIcon */}
                            <div className="text-slate-300 mb-2">
                                <BookOpenIcon />
                            </div>
                            <p>Tidak ada pesan.</p>
                        </div>
                    )}

                    <ul className="divide-y divide-slate-100">
                        {notifications.map(notif => (
                            <li 
                                key={notif.id} 
                                onClick={() => handleSelectMessage(notif)}
                                className={`
                                    group relative p-4 cursor-pointer transition-all hover:bg-slate-50
                                    ${selectedMessage?.id === notif.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}
                                    ${!notif.is_read ? 'bg-white' : 'bg-slate-50/50'}
                                `}
                            >
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className={`text-sm truncate max-w-[70%] ${!notif.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>
                                        {notif.sender_name || 'Admin'}
                                    </span>
                                    <span className={`text-xs ${!notif.is_read ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
                                        {formatDateList(notif.created_at)}
                                    </span>
                                </div>
                                
                                <h4 className={`text-sm mb-1 truncate ${!notif.is_read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                                    {notif.title}
                                </h4>
                                
                                <p className="text-xs text-slate-500 line-clamp-2">
                                    {notif.message}
                                </p>

                                {/* Indikator Belum Dibaca (Dot Biru) */}
                                {!notif.is_read && (
                                    <span className="absolute top-5 right-4 w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm"></span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* --- DETAIL PESAN (KANAN) --- */}
                <div className={`${selectedMessage ? 'block' : 'hidden md:block'} flex-1 bg-white overflow-y-auto relative`}>
                    {selectedMessage ? (
                        <div className="p-6 md:p-8 h-full flex flex-col">
                            {/* Tombol Back (Mobile Only) */}
                            <button 
                                onClick={() => setSelectedMessage(null)}
                                className="md:hidden mb-4 flex items-center text-slate-500 hover:text-slate-800 text-sm font-medium"
                            >
                                ← Kembali
                            </button>

                            <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-100">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{selectedMessage.title}</h3>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                            {selectedMessage.sender_name || 'Admin'}
                                        </span>
                                        <span className="text-slate-400">•</span>
                                        <span className="text-slate-500">
                                            {formatDateDetail(selectedMessage.created_at)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full h-fit ${selectedMessage.recipient_id ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {selectedMessage.recipient_id ? 'Personal' : 'Broadcast'}
                                    </span>
                                    <button 
                                        onClick={(e) => handleDelete(e, selectedMessage.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                        title="Hapus Pesan"
                                    >
                                        {/* Gunakan TrashIcon yang sudah ada */}
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>

                            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {selectedMessage.message}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50/30">
                            {/* Ganti EnvelopeIcon dengan BellIcon besar */}
                            <div className="opacity-20 transform scale-150 mb-4">
                                <BellIcon />
                            </div>
                            <p className="text-lg">Pilih pesan untuk membaca</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}