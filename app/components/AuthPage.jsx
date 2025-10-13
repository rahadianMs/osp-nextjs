"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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


export default function AuthPage({ supabase, setActivePage, isLogin, setIsLogin }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });
    const [isExiting, setIsExiting] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    
    const [formData, setFormData] = useState({
        business_name: '', nib: '', year_established: '', address_street: '',
        address_province: '', address_regency: '', pic_name: '', pic_position: '',
        pic_email: '', pic_phone: '', business_scale: '', logo_file: null,
        website: '', sustainability_certifications: '', email: '', password: '',
        business_type: ''
    });

    const colors = { brand: '#22543d', brandHover: '#1c4532' };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'logo_file') {
            setFormData(prev => ({ ...prev, logo_file: files ? files[0] : null }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', content: '' });
        const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
        if (error) setMessage({ type: 'error', content: error.message });
        setLoading(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', content: '' });

        try {
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (signUpError) throw signUpError;
            if (!authData.user) throw new Error("Registrasi berhasil, namun data pengguna tidak ditemukan.");

            let logoUrl = null;
            if (formData.logo_file) {
                const fileExt = formData.logo_file.name.split('.').pop();
                const fileName = `${authData.user.id}/${Date.now()}.${fileExt}`;
                const { data: uploadData, error: uploadError } = await supabase.storage.from('logos').upload(fileName, formData.logo_file);
                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from('logos').getPublicUrl(uploadData.path);
                logoUrl = urlData.publicUrl;
            }
            
            // PERBAIKAN UTAMA: Gunakan 'upsert' untuk membuat atau memperbarui profil
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authData.user.id, // Pastikan ID disertakan
                    business_name: formData.business_name,
                    business_type: formData.business_type,
                    nib: formData.nib,
                    year_established: formData.year_established,
                    address_street: formData.address_street,
                    address_province: formData.address_province,
                    address_regency: formData.address_regency,
                    pic_name: formData.pic_name,
                    pic_position: formData.pic_position,
                    pic_email: formData.pic_email,
                    pic_phone: formData.pic_phone,
                    business_scale: formData.business_scale,
                    logo_url: logoUrl,
                    website: formData.website,
                    sustainability_certifications: formData.sustainability_certifications,
                    updated_at: new Date(),
                });

            if (profileError) throw profileError;

            setMessage({ type: 'success', content: 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi.' });
        } catch (error) {
            setMessage({ type: 'error', content: `Terjadi kesalahan: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };
    
    const formVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 }
    };

    const inputClass = "w-full p-2 border border-slate-300 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[#22543d]";

    return (
        <div 
            id="auth-page" 
            className="flex items-center justify-center min-h-screen bg-cover bg-center px-4"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1608387371413-f2566ac510e0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170')" }}
        >
            <motion.div 
                className="relative w-full max-w-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <motion.div 
                    layout 
                    className="relative bg-white/90 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-2xl overflow-hidden"
                >
                    <button onClick={() => setActivePage('landing')} className="absolute top-6 left-6 text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors z-10">
                        ← Kembali
                    </button>

                    <AnimatePresence mode="wait">
                        {isLogin ? (
                            <motion.div key="login" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                                <h2 className="text-center text-3xl font-bold mb-2 pt-8" style={{color: colors.brand}}>Selamat Datang</h2>
                                <p className="text-center text-zinc-500 mb-8">Masuk untuk melanjutkan ke dasbor Anda.</p>
                                <form onSubmit={handleLogin} className="space-y-5 max-w-sm mx-auto">
                                    <div>
                                        <label htmlFor="login-email" className="block mb-2 text-sm font-medium text-zinc-600">Email</label>
                                        <input type="email" id="login-email" placeholder="nama@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className={inputClass} />
                                    </div>
                                    <div>
                                        <label htmlFor="login-password" className="block mb-2 text-sm font-medium text-zinc-600">Password</label>
                                        <input type="password" id="login-password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className={inputClass} />
                                    </div>
                                    <button type="submit" disabled={loading} style={{backgroundColor: colors.brand}} className="w-full py-3 text-base font-semibold text-white rounded-lg hover:bg-[#1c4532] transition-colors disabled:bg-slate-400">
                                        {loading ? 'Memproses...' : 'Masuk'}
                                    </button>
                                </form>
                                <p className="mt-6 text-sm text-center text-zinc-500">Belum punya akun? <button onClick={() => setIsLogin(false)} className="font-semibold" style={{color: colors.brand}}>Daftar di sini</button></p>
                            </motion.div>
                        ) : (
                             <motion.div key="register" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                                <h2 className="text-center text-3xl font-bold mb-2 pt-8" style={{color: colors.brand}}>Buat Akun Baru</h2>
                                <p className="text-center text-zinc-500 mb-8">Mulai perjalanan bisnis berkelanjutan Anda.</p>
                                <form onSubmit={handleRegister} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                        <div className="md:col-span-2 font-bold text-lg border-b pb-2 mb-2" style={{color: colors.brand}}>Informasi Akun</div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium">Email</label>
                                            <input name="email" type="email" value={formData.email} onChange={handleInputChange} required className={inputClass}/>
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium">Password</label>
                                            <input name="password" type="password" placeholder="Minimal 6 karakter" value={formData.password} onChange={handleInputChange} required className={inputClass}/>
                                        </div>
                                        
                                        <div className="md:col-span-2 font-bold text-lg border-b pb-2 mt-4 mb-2" style={{color: colors.brand}}>Profil Usaha</div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium">Nama Usaha</label>
                                            <input name="business_name" type="text" value={formData.business_name} onChange={handleInputChange} required className={inputClass}/>
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium">Tipe Usaha</label>
                                            <select name="business_type" value={formData.business_type} onChange={handleInputChange} required className={inputClass}>
                                                <option value="" disabled>Pilih Tipe</option>
                                                <option>Akomodasi</option>
                                                <option>Operator Jasa Perjalanan</option>
                                                <option>Pengelola Atraksi Wisata</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium">NIB (Nomor Induk Berusaha)</label>
                                            <input name="nib" type="text" value={formData.nib} onChange={handleInputChange} required className={inputClass}/>
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium">Tahun Berdiri</label>
                                            <input name="year_established" type="number" placeholder="YYYY" value={formData.year_established} onChange={handleInputChange} required className={inputClass}/>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block mb-1 text-sm font-medium">Alamat Lengkap</label>
                                            <input name="address_street" type="text" placeholder="Nama Jalan, Gedung, No. Rumah" value={formData.address_street} onChange={handleInputChange} required className={inputClass}/>
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium">Provinsi</label>
                                            <select name="address_province" value={formData.address_province} onChange={handleInputChange} required className={inputClass}>
                                                <option value="">Pilih Provinsi</option>
                                                {provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium">Kabupaten/Kota</label>
                                            <input name="address_regency" type="text" value={formData.address_regency} onChange={handleInputChange} required className={inputClass}/>
                                        </div>
                                         <div>
                                            <label className="block mb-1 text-sm font-medium">Skala Usaha</label>
                                            <select name="business_scale" value={formData.business_scale} onChange={handleInputChange} required className={inputClass}>
                                                <option value="" disabled>Pilih Skala</option>
                                                <option value="Mikro (<10 karyawan)">Mikro (&lt;10 karyawan)</option>
                                                <option value="Kecil (10-49 karyawan)">Kecil (10-49 karyawan)</option>
                                                <option value="Menengah (50-249 karyawan)">Menengah (50-249 karyawan)</option>
                                                <option value="Besar (≥250 karyawan)">Besar (≥250 karyawan)</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block mb-1 text-sm font-medium">Logo Usaha</label>
                                            <input name="logo_file" type="file" onChange={handleInputChange} accept="image/*" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"/>
                                        </div>

                                        <div className="md:col-span-2 font-bold text-lg border-b pb-2 mt-4 mb-2" style={{color: colors.brand}}>Kontak Utama (PIC)</div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium">Nama PIC</label>
                                            <input name="pic_name" type="text" value={formData.pic_name} onChange={handleInputChange} required className={inputClass}/>
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium">Jabatan</label>
                                            <input name="pic_position" type="text" value={formData.pic_position} onChange={handleInputChange} required className={inputClass}/>
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium">Email PIC</label>
                                            <input name="pic_email" type="email" value={formData.pic_email} onChange={handleInputChange} required className={inputClass}/>
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium">Nomor Telepon</label>
                                            <input name="pic_phone" type="tel" value={formData.pic_phone} onChange={handleInputChange} required className={inputClass}/>
                                        </div>
                                        
                                         <div className="md:col-span-2 font-bold text-lg border-b pb-2 mt-4 mb-2" style={{color: colors.brand}}>Informasi Tambahan (Opsional)</div>
                                        <div className="md:col-span-2">
                                            <label className="block mb-1 text-sm font-medium">Website / Media Sosial</label>
                                            <input name="website" type="text" placeholder="https://" value={formData.website} onChange={handleInputChange} className={inputClass}/>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block mb-1 text-sm font-medium">Sertifikasi Keberlanjutan yang Dimiliki</label>
                                            <textarea name="sustainability_certifications" placeholder="Sebutkan jika ada, pisahkan dengan koma" value={formData.sustainability_certifications} onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-transparent" rows="2"></textarea>
                                        </div>
                                    </div>

                                    <button type="submit" disabled={loading} style={{backgroundColor: colors.brand}} className="w-full py-3 text-base font-semibold text-white rounded-lg hover:bg-[#1c4532] transition-colors disabled:bg-slate-400">
                                        {loading ? 'Mendaftarkan...' : 'Selesaikan Pendaftaran'}
                                    </button>
                                </form>
                                <p className="mt-6 text-sm text-center text-zinc-500">Sudah punya akun? <button onClick={() => setIsLogin(true)} className="font-semibold" style={{color: colors.brand}}>Masuk di sini</button></p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    {message.content && (
                        <p className={`mt-6 text-sm text-center p-3 rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                            {message.content}
                        </p>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}