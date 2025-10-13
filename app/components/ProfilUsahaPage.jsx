"use client";

import { useState, useEffect } from 'react';
import { HandshakeIcon } from './Icons'; 

// Ikon sederhana untuk informasi
const InfoIcon = ({ icon, label, value }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 text-slate-500">{icon}</div>
        <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="font-semibold text-slate-800">{value || '-'}</p>
        </div>
    </div>
);

// Komponen untuk Halaman Profil Usaha
export default function ProfilUsahaPage({ user, supabase, setActiveDashboardPage }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const { data, error: dbError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                
                if (dbError && dbError.code !== 'PGRST116') throw dbError;
                setProfile(data); 
            } catch (err) {
                setError("Gagal memuat data profil.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user, supabase]);

    if (loading) {
        return <div className="text-center">Memuat profil usaha...</div>;
    }

    if (error) {
        return <div className="text-center p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>;
    }

    if (!profile) {
        return (
            <div className="text-center p-6 bg-white rounded-xl shadow-md border">
                <h2 className="text-xl font-semibold">Profil Usaha Belum Lengkap</h2>
                <p className="text-slate-600 mt-2">Data profil Anda tidak ditemukan.</p>
                <button 
                    onClick={() => setActiveDashboardPage('akun')} 
                    className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                    Lengkapi Profil di Halaman Akun
                </button>
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md border relative">
            <button 
                onClick={() => setActiveDashboardPage('akun')} 
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
                title="Edit Profil"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
            </button>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <img 
                    src={profile.logo_url || 'https://via.placeholder.com/150'} 
                    alt={`Logo ${profile.business_name}`}
                    className="w-40 h-40 rounded-full object-contain border-4 border-slate-200 bg-slate-50"
                />
                <div className="flex-grow text-center md:text-left pt-4">
                    <p className="text-sm font-semibold text-emerald-600">{profile.business_type || "Tipe Usaha Belum Diatur"}</p>
                    <h1 className="text-4xl font-bold text-slate-800 mt-1">{profile.business_name || "Nama Usaha Belum Diatur"}</h1>
                    <p className="text-slate-500 mt-2">
                        {profile.address_regency && profile.address_province 
                            ? `${profile.address_regency}, ${profile.address_province}`
                            : "Alamat belum diatur"
                        }
                    </p>
                    {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline mt-2 inline-block">{profile.website}</a>}
                </div>
            </div>
            
            <div className="border-t my-8"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-700 border-b pb-2">Informasi Usaha</h2>
                     <InfoIcon label="NIB" value={profile.nib} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>} />
                    <InfoIcon label="Tahun Berdiri" value={profile.year_established} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" /></svg>} />
                    {/* --- PERBAIKAN IKON DI SINI --- */}
                    <InfoIcon label="Skala Usaha" value={profile.business_scale} icon={<HandshakeIcon />} />
                    <InfoIcon label="Alamat" value={profile.address_street} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>} />
                </div>
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-700 border-b pb-2">Kontak Utama</h2>
                    <InfoIcon label="Nama PIC" value={profile.pic_name} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>} />
                    <InfoIcon label="Jabatan" value={profile.pic_position} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>} />
                    <InfoIcon label="Email" value={profile.pic_email} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>} />
                    <InfoIcon label="Telepon" value={profile.pic_phone} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>} />
                </div>
            </div>
        </div>
    );
}