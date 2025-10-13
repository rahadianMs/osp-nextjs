"use client";

import { useState, useEffect } from 'react';

// Data provinsi kita ambil langsung di sini
const provinces = [
    { id: '11', name: 'ACEH' }, { id: '12', name: 'SUMATERA UTARA' },
    { id: '13', name: 'SUMATERA BARAT' }, { id: '14', name: 'RIAU' },
    { id: '15', name: 'JAMBI' }, { id: '16', name: 'SUMATERA SELATAN' },
    { id: '17', name: 'BENGKULU' }, { id: '18', name: 'LAMPUNG' },
    { id: '19', name: 'KEPULAUAN BANGKA BELITUNG' }, { id: '21', name: 'KEPULAUAN RIAU' },
    { id: '31', name: 'DKI JAKARTA' }, { id: '32', name: 'JAWA BARAT' },
    { id: '33', name: 'JAWA TENGAH' }, { id: '34', name: 'DI YOGYAKARTA' },
    { id: '35', name: 'JAWA TIMUR' }, { id: '36', name: 'BANTEN' },
    { id: '51', name: 'BALI' }, { id: '52', name: 'NUSA TENGGARA BARAT' },
    { id: '53', name: 'NUSA TENGGARA TIMUR' }, { id: '61', name: 'KALIMANTAN BARAT' },
    { id: '62', name: 'KALIMANTAN TENGAH' }, { id: '63', name: 'KALIMANTAN SELATAN' },
    { id: '64', name: 'KALIMANTAN TIMUR' }, { id: '65', name: 'KALIMANTAN UTARA' },
    { id: '71', name: 'SULAWESI UTARA' }, { id: '72', name: 'SULAWESI TENGAH' },
    { id: '73', name: 'SULAWESI SELATAN' }, { id: '74', name: 'SULAWESI TENGGARA' },
    { id: '75', name: 'GORONTALO' }, { id: '76', name: 'SULAWESI BARAT' },
    { id: '81', name: 'MALUKU' }, { id: '82', name: 'MALUKU UTARA' },
    { id: '91', name: 'PAPUA BARAT' }, { id: '92', name: 'PAPUA' },
    { id: '93', name: 'PAPUA TENGAH' }, { id: '94', name: 'PAPUA PEGUNUNGAN' },
    { id: '95', name: 'PAPUA SELATAN' }, { id: '96', name: 'PAPUA BARAT DAYA' },
];

// Komponen untuk Halaman Akun
export default function AccountPage({ user, supabase }) {
    const [loading, setLoading] = useState(true);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [profile, setProfile] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    throw error;
                }
                
                setProfile(data || {});
                if (data?.logo_url) {
                    setLogoPreview(data.logo_url);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                setProfileMessage({ type: 'error', text: 'Gagal memuat profil.' });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user, supabase]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setProfileMessage({ type: '', text: '' });
        try {
            let logoUrl = profile.logo_url;

            if (logoFile) {
                if (profile.logo_url) {
                    const oldLogoPath = profile.logo_url.split('/logos/')[1];
                    await supabase.storage.from('logos').remove([oldLogoPath]);
                }

                const fileExt = logoFile.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;
                const { data: uploadData, error: uploadError } = await supabase.storage.from('logos').upload(fileName, logoFile);

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage.from('logos').getPublicUrl(uploadData.path);
                logoUrl = urlData.publicUrl;
            }

            // PERBAIKAN UTAMA: Gunakan 'upsert' untuk membuat atau memperbarui
            const { error } = await supabase
                .from('profiles')
                .upsert({ ...profile, id: user.id, logo_url: logoUrl, updated_at: new Date() });

            if (error) throw error;

            setProfileMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });

        } catch (error) {
            setProfileMessage({ type: 'error', text: `Gagal memperbarui profil: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            setPasswordMessage({ type: 'error', text: 'Password minimal harus 6 karakter.' });
            return;
        }
        if (password !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
            return;
        }

        setLoading(true);
        setPasswordMessage({ type: '', text: '' });
        try {
            const { error } = await supabase.auth.updateUser({ password: password });
            if (error) throw error;
            setPasswordMessage({ type: 'success', text: 'Password berhasil diubah!' });
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            setPasswordMessage({ type: 'error', text: `Gagal mengubah password: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center">Memuat data akun...</div>;
    }

    if (!profile) {
        return <div className="text-center text-red-500">Gagal memuat data profil. Silakan coba lagi.</div>
    }
    
    const inputClass = "w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22543d]";

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-md border">
                <h3 className="text-2xl font-bold mb-6 text-slate-800">Profil Usaha</h3>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                    {/* Bagian Profil Usaha */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Usaha</label>
                                <input name="business_name" type="text" value={profile.business_name || ''} onChange={handleProfileChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">NIB</label>
                                <input name="nib" type="text" value={profile.nib || ''} onChange={handleProfileChange} className={inputClass} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tahun Berdiri</label>
                                <input name="year_established" type="number" value={profile.year_established || ''} onChange={handleProfileChange} className={inputClass} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Skala Usaha</label>
                                <select name="business_scale" value={profile.business_scale || ''} onChange={handleProfileChange} className={`${inputClass} bg-white`}>
                                    <option value="Mikro (<10 karyawan)">Mikro (&lt;10 karyawan)</option>
                                    <option value="Kecil (10-49 karyawan)">Kecil (10-49 karyawan)</option>
                                    <option value="Menengah (50-249 karyawan)">Menengah (50-249 karyawan)</option>
                                    <option value="Besar (≥250 karyawan)">Besar (≥250 karyawan)</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Logo Usaha</label>
                                <div className="flex items-center gap-4">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo preview" className="w-20 h-20 object-contain rounded-lg border p-1" />
                                    ) : (
                                        <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-500">No Logo</div>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Lengkap</label>
                                <input name="address_street" type="text" value={profile.address_street || ''} onChange={handleProfileChange} className={`${inputClass} mb-2`}/>
                                <div className="grid grid-cols-2 gap-2">
                                    <select name="address_province" value={profile.address_province || ''} onChange={handleProfileChange} className={`${inputClass} bg-white`}>
                                        <option value="">Pilih Provinsi</option>
                                        {provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                    </select>
                                    <input name="address_regency" type="text" value={profile.address_regency || ''} onChange={handleProfileChange} placeholder="Kabupaten/Kota" className={inputClass} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bagian Kontak PIC */}
                    <div className="border-t pt-6">
                        <h4 className="text-lg font-semibold text-slate-700 mb-4">Kontak Utama (PIC)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nama PIC</label>
                                <input name="pic_name" type="text" value={profile.pic_name || ''} onChange={handleProfileChange} className={inputClass} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Jabatan</label>
                                <input name="pic_position" type="text" value={profile.pic_position || ''} onChange={handleProfileChange} className={inputClass} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email PIC</label>
                                <input name="pic_email" type="email" value={profile.pic_email || ''} onChange={handleProfileChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Telepon</label>
                                <input name="pic_phone" type="tel" value={profile.pic_phone || ''} onChange={handleProfileChange} className={inputClass} />
                            </div>
                        </div>
                    </div>
                    
                     {/* Bagian Informasi Tambahan */}
                    <div className="border-t pt-6">
                        <h4 className="text-lg font-semibold text-slate-700 mb-4">Informasi Tambahan (Opsional)</h4>
                        <div className="space-y-4">
                           <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Website / Media Sosial</label>
                                <input name="website" type="text" value={profile.website || ''} onChange={handleProfileChange} placeholder="https://" className={inputClass}/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Sertifikasi Keberlanjutan</label>
                                <textarea name="sustainability_certifications" value={profile.sustainability_certifications || ''} onChange={handleProfileChange} placeholder="Sebutkan jika ada, pisahkan dengan koma" className={inputClass} rows="2"></textarea>
                            </div>
                        </div>
                    </div>


                    <button type="submit" disabled={loading} className="w-full py-3 text-base font-semibold text-white rounded-lg transition-colors disabled:bg-slate-400" style={{backgroundColor: '#22543d'}}>
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
                    </button>
                    {profileMessage.text && <p className={`mt-4 text-sm text-center p-2 rounded-lg ${profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{profileMessage.text}</p>}
                </form>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border">
                <h3 className="text-2xl font-bold mb-6 text-slate-800">Ubah Password</h3>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                     <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password Baru</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password Baru</label>
                        <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi password baru" className={inputClass} />
                    </div>
                     <button type="submit" disabled={loading} className="w-full py-3 text-base font-semibold text-white rounded-lg transition-colors disabled:bg-slate-400" style={{backgroundColor: '#22543d'}}>
                        {loading ? 'Menyimpan...' : 'Ubah Password'}
                    </button>
                    {passwordMessage.text && <p className={`mt-4 text-sm text-center p-2 rounded-lg ${passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{passwordMessage.text}</p>}
                </form>
            </div>
        </div>
    );
};