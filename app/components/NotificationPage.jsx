"use client";

import React, { useState, useEffect } from 'react';

// Komponen Notifikasi (Halaman User)
export default function NotificationPage({ supabase, user }) {

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fungsi fetch notifikasi (MODIFIKASI: Ambil juga status baca broadcast)
    const fetchNotifications = async () => {
        if (!user || !supabase) return;
        try {
            setLoading(true);
            setError(null);

            // 1. Ambil semua notifikasi yang relevan (personal + broadcast)
            const { data: allNotifs, error: notifError } = await supabase
                .from('notifications')
                .select('*')
                // RLS sudah memfilter pesan yang dihapus user
                .order('created_at', { ascending: false });
            if (notifError) throw notifError;

            if (!allNotifs || allNotifs.length === 0) {
                setNotifications([]);
                setLoading(false);
                return;
            }

            // 2. Ambil ID broadcast yang belum ditandai is_read=true di tabel utama
            const broadcastIdsToCheck = allNotifs
                .filter(n => n.recipient_id === null && !n.is_read) // Hanya broadcast yg belum dibaca (secara global, jika ada)
                .map(n => n.id);

            let readBroadcastIds = new Set();
            if (broadcastIdsToCheck.length > 0) {
                // 3. Cek tabel user_read_broadcasts untuk user ini
                const { data: readStatuses, error: readStatusError } = await supabase
                    .from('user_read_broadcasts')
                    .select('notification_id')
                    .eq('user_id', user.id)
                    .in('notification_id', broadcastIdsToCheck); // Hanya cek ID yang relevan

                if (readStatusError) throw readStatusError;
                
                // Masukkan ID broadcast yang sudah dibaca user ini ke Set
                readBroadcastIds = new Set(readStatuses.map(r => r.notification_id));
            }

            // 4. Gabungkan data: update 'is_read' untuk broadcast
            const finalNotifications = allNotifs.map(notif => {
                // Jika ini broadcast DAN ada di set readBroadcastIds, tandai is_read=true
                if (notif.recipient_id === null && readBroadcastIds.has(notif.id)) {
                    return { ...notif, is_read: true };
                }
                // Jika tidak, kembalikan notif asli
                return notif;
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

    // Fungsi tandai sudah dibaca (MODIFIKASI: Logika berbeda untuk broadcast)
    const markAsRead = async (id, isBroadcast) => {
        try {
            let error;
            if (isBroadcast) {
                // --- Jika BROADCAST: INSERT ke tabel user_read_broadcasts ---
                const { error: insertError } = await supabase
                    .from('user_read_broadcasts')
                    .insert({ user_id: user.id, notification_id: id });
                error = insertError;
            } else {
                // --- Jika PERSONAL: UPDATE tabel notifications ---
                const { error: updateError } = await supabase
                    .from('notifications')
                    .update({ is_read: true })
                    .eq('id', id)
                    .eq('recipient_id', user.id); // Pastikan update pesan sendiri
                error = updateError;
            }

            if (error) throw error;

            // Update state lokal (logika ini tetap sama)
            setNotifications(currentNotifs =>
                currentNotifs.map(notif =>
                    notif.id === id ? { ...notif, is_read: true } : notif
                )
            );
        } catch (err) {
            console.error("Error marking as read:", err.message);
            // Jangan tampilkan alert agar tidak mengganggu jika user klik cepat
        }
    };

    // Fungsi Hapus (POV User) (tetap sama)
    const handleDelete = async (id) => {
        if (!confirm("Apakah Anda yakin ingin menghapus notifikasi ini?")) return;
        try {
            const { error } = await supabase.rpc('delete_notification_for_user', { notification_id: id });
            if (error) throw error;
            setNotifications(currentNotifs => currentNotifs.filter(notif => notif.id !== id));
        } catch (err) {
            console.error("Error deleting notification:", err.message);
            alert("Gagal menghapus notifikasi.");
        }
    };

    // Helper format tanggal (tetap sama)
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Kotak Masuk Notifikasi</h2>
            {loading && <p className="text-slate-500 text-center py-10">Memuat notifikasi...</p>}
            {error && <p className="text-red-500 text-center py-10">{error}</p>}
            {!loading && notifications.length === 0 && (
                <div className="bg-white p-8 rounded-xl shadow-md border text-center">
                    <h4 className="text-lg font-medium text-slate-700">Tidak Ada Notifikasi</h4>
                    <p className="text-slate-500 mt-2">Kotak masuk Anda kosong.</p>
                </div>
            )}
            {!loading && notifications.length > 0 && (
                <div className="bg-white rounded-xl shadow-md border overflow-hidden">
                    <ul className="divide-y divide-slate-200">
                        {notifications.map(notif => (
                            <li key={notif.id} className={`p-4 sm:p-6 hover:bg-slate-50 transition-colors ${!notif.is_read ? 'bg-green-50' : ''}`}>
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            {!notif.is_read && (<span className="flex-shrink-0 w-2.5 h-2.5 bg-green-500 rounded-full" title="Belum dibaca"></span>)}
                                            <p className="text-sm font-semibold text-slate-800 truncate">{notif.sender_name}</p>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${notif.recipient_id ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {notif.recipient_id ? 'Personal' : 'Broadcast'}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-lg font-bold text-slate-900">{notif.title}</p>
                                        <p className="mt-2 text-sm text-slate-600 line-clamp-2">{notif.message}</p>
                                    </div>
                                    <div className="flex-shrink-0 flex flex-col items-end space-y-2">
                                        <p className="text-xs text-slate-500 whitespace-nowrap">{formatDate(notif.created_at)}</p>
                                        <div className="flex items-center gap-2">
                                            {!notif.is_read && (
                                                <button
                                                    // --- MODIFIKASI: Kirim tipe pesan ke handler ---
                                                    onClick={() => markAsRead(notif.id, !notif.recipient_id)}
                                                    title="Tandai sudah dibaca"
                                                    className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-md"
                                                >
                                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(notif.id)} title="Hapus notifikasi" className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}