"use client";

import React, { useState, useEffect } from 'react';

// --- MODIFIKASI: Komponen Riwayat Pesan dengan Lookup Manual ---
const MessageHistory = ({ supabase }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    // --- TAMBAHAN: State untuk profile map ---
    const [profileMap, setProfileMap] = useState(new Map());
    const [loadingProfiles, setLoadingProfiles] = useState(true);

    // --- TAMBAHAN: useEffect untuk fetch profiles sekali ---
    useEffect(() => {
        const fetchProfiles = async () => {
            setLoadingProfiles(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('id, business_name'); // id = user_id
            if (error) {
                console.error("Error fetching profiles for history:", error.message);
            } else {
                const newMap = new Map();
                data.forEach(profile => newMap.set(profile.id, profile));
                setProfileMap(newMap);
            }
            setLoadingProfiles(false);
        };
        fetchProfiles();
    }, [supabase]);

    // Fungsi fetch riwayat (MODIFIKASI: Tanpa join)
    const fetchHistory = async () => {
        // Tunggu profile map siap
        if (loadingProfiles) return;

        setLoading(true);
        // Ambil notifikasi tanpa join
        const { data, error } = await supabase
            .from('notifications')
            .select('id, created_at, title, message, recipient_id') // Ambil recipient_id
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching history:", error.message);
            setMessages([]);
        } else {
            // Gabungkan data secara manual
            const combinedData = data.map(msg => ({
                ...msg,
                // Cari nama bisnis dari map
                recipient_name: profileMap.get(msg.recipient_id)?.business_name || null
            }));
            setMessages(combinedData || []);
        }
        setLoading(false);
    };

    // Trigger fetch saat profile siap ATAU saat refresh
    useEffect(() => {
        fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supabase, refreshKey, loadingProfiles, profileMap]); // Tambahkan dependency

    // Fungsi Hapus (Admin) (tetap sama)
    const handleDelete = async (id) => {
        if (!confirm("Apakah Anda yakin ingin menghapus pesan ini secara permanen untuk SEMUA user?")) return;
        try {
            const { error } = await supabase.from('notifications').delete().eq('id', id);
            if (error) throw error;
            setRefreshKey(oldKey => oldKey + 1);
        } catch (err) {
            console.error("Error deleting message:", err.message);
            alert("Gagal menghapus pesan.");
        }
    };

    // Helper format tanggal (tetap sama)
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';

    return (
        <div className="bg-white p-8 rounded-xl shadow-md border">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Riwayat Pesan Terkirim</h3>

            {(loading || loadingProfiles) && <p className="text-slate-500">Memuat riwayat...</p>}

            {!(loading || loadingProfiles) && messages.length === 0 && (
                <p className="text-slate-500">Belum ada pesan yang terkirim.</p>
            )}

            {!(loading || loadingProfiles) && messages.length > 0 && (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {messages.map(msg => (
                        <div key={msg.id} className="p-4 border border-slate-200 rounded-lg relative group">
                            <button onClick={() => handleDelete(msg.id)} title="Hapus permanen" className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${msg.recipient_id ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {msg.recipient_id
                                    // --- MODIFIKASI: Gunakan recipient_name dari lookup ---
                                    ? `Personal: ${msg.recipient_name || 'User Tidak Ditemukan'}`
                                    : 'Broadcast'}
                            </span>
                            <h4 className="text-lg font-bold text-slate-800 mt-2">{msg.title}</h4>
                            <p className="text-sm text-slate-600 mt-1 break-words">{msg.message}</p>
                            <p className="text-xs text-slate-400 mt-2">{formatDate(msg.created_at)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
// --- AKHIR MODIFIKASI ---


// Komponen utama (Form Kirim Pesan - Tidak berubah signifikan)
export default function AdminNotificationPage({ supabase, user }) {
    const [messageType, setMessageType] = useState('broadcast');
    const [recipientId, setRecipientId] = useState('');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [historyRefreshKey, setHistoryRefreshKey] = useState(0); // State untuk refresh

    useEffect(() => {
        if (messageType === 'personal') {
            setLoadingUsers(true);
            const fetchUsers = async () => {
                const { data, error } = await supabase.from('profiles').select('id, business_name, pic_email').neq('role', 'admin');
                if (error) console.error("Error fetching users:", error);
                else setUsers(data || []);
                setLoadingUsers(false);
            };
            fetchUsers();
        }
    }, [messageType, supabase]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setStatus(''); setStatusMessage('');
        const targetRecipientId = messageType === 'broadcast' ? null : recipientId;
        if (messageType === 'personal' && !targetRecipientId) {
            setStatus('error'); setStatusMessage('Silakan pilih pengguna tujuan.'); setLoading(false); return;
        }
        const { data: adminProfile } = await supabase.from('profiles').select('business_name').eq('id', user.id).single();
        const senderName = adminProfile?.business_name || 'Admin';
        const { error } = await supabase.from('notifications').insert({ recipient_id: targetRecipientId, title: title, message: message, sender_name: senderName });
        if (error) {
            setStatus('error'); setStatusMessage('Gagal mengirim pesan: ' + error.message);
        } else {
            setStatus('success'); setStatusMessage('Pesan berhasil dikirim!');
            setTitle(''); setMessage(''); setRecipientId('');
            // Trigger refresh history
            setHistoryRefreshKey(key => key + 1);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Bagian 1: Form Kirim Pesan (Tidak berubah) */}
            <div className="bg-white p-8 rounded-xl shadow-md border">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">Kirim Notifikasi</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ... (isi form tidak berubah) ... */}
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Tipe Pesan</label>
                        <select value={messageType} onChange={(e) => setMessageType(e.target.value)} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" >
                            <option value="broadcast">Broadcast (Ke Semua User)</option>
                            <option value="personal">Personal (Ke User Spesifik)</option>
                        </select>
                    </div>
                    {messageType === 'personal' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Pilih Pengguna</label>
                            <select value={recipientId} onChange={(e) => setRecipientId(e.target.value)} required className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" >
                                <option value="">{loadingUsers ? 'Memuat user...' : '-- Pilih User --'}</option>
                                {users.map(u => (<option key={u.id} value={u.id}>{u.business_name} ({u.pic_email})</option>))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Judul</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Isi Pesan</label>
                        <textarea rows="5" value={message} onChange={(e) => setMessage(e.target.value)} required className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" ></textarea>
                    </div>
                    <div className="flex items-center gap-4">
                        <button type="submit" disabled={loading} className={`px-6 py-2 rounded-lg text-white font-medium ${loading ? 'bg-slate-400' : 'bg-green-700 hover:bg-green-800'}`} >
                            {loading ? 'Mengirim...' : 'Kirim Notifikasi'}
                        </button>
                        {statusMessage && (<span className={`text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>{statusMessage}</span>)}
                    </div>
                </form>
            </div>

            {/* Bagian 2: Riwayat Pesan */}
            {/* Berikan key agar bisa di-refresh */}
            <MessageHistory supabase={supabase} key={historyRefreshKey} />
        </div>
    );
}