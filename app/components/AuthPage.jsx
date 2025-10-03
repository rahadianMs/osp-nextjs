"use client";

import { useState } from 'react';

export default function AuthPage({ supabase, setActivePage, isLogin, setIsLogin }) {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [businessName, setBusinessName] = useState('');
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState({ type: '', content: '' });

const handleAuthAction = async (e) => {
e.preventDefault();
setLoading(true);
setMessage({ type: '', content: '' });

if (isLogin) {
  // Logic untuk Login
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    setMessage({ type: 'error', content: error.message });
  }
  // Jika berhasil, onAuthStateChange di page.jsx akan menangani navigasi
} else {
  // Logic untuk Registrasi
  if (businessName.trim() === '') {
    setMessage({ type: 'error', content: 'Nama bisnis tidak boleh kosong.' });
    setLoading(false);
    return;
  }
  const { error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        business_name: businessName
      }
    }
  });
  if (error) {
    setMessage({ type: 'error', content: error.message });
  } else {
    setMessage({ type: 'success', content: 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi.' });
  }
}
setLoading(false);

};

return (
<div id="auth-page" className="flex items-center justify-center min-h-screen bg-slate-100">
<div className="w-full max-w-md p-4">
<div className="relative bg-white p-10 rounded-2xl shadow-lg">
<button onClick={() => setActivePage('landing')} className="absolute top-6 left-6 text-slate-500 hover:text-[#348567] font-medium text-sm transition-colors">← Kembali</button>

      {isLogin ? (
        // Form Login
        <div id="login-form-container">
          <h2 className="text-center text-3xl font-bold mb-2 pt-8">Selamat Datang Kembali</h2>
          <p className="text-center text-slate-500 mb-8">Masuk untuk melanjutkan ke dasbor Anda.</p>
          <form onSubmit={handleAuthAction}>
            <div className="mb-5">
              <label htmlFor="login-email" className="block mb-2 text-sm font-medium">Email</label>
              <input type="email" id="login-email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567] focus:border-transparent" />
            </div>
            <div className="mb-5">
              <label htmlFor="login-password" className="block mb-2 text-sm font-medium">Password</label>
              <input type="password" id="login-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567] focus:border-transparent" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 text-base font-semibold text-white bg-[#348567] rounded-lg hover:bg-[#2A6A52] transition-colors disabled:bg-slate-400">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
          <p className="mt-6 text-sm text-center text-slate-500">Belum punya akun? <button onClick={() => setIsLogin(false)} className="font-semibold text-[#348567] hover:underline">Daftar di sini</button></p>
        </div>
      ) : (
        // Form Registrasi
        <div id="register-form-container">
           <h2 className="text-center text-3xl font-bold mb-2 pt-8">Buat Akun Baru</h2>
          <p className="text-center text-slate-500 mb-8">Daftarkan bisnis Anda untuk memulai.</p>
          <form onSubmit={handleAuthAction}>
              <div className="mb-5">
                <label htmlFor="register-name" className="block mb-2 text-sm font-medium">Nama Bisnis</label>
                <input type="text" id="register-name" placeholder="Pesona Alam Resort" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567] focus:border-transparent" />
              </div>
               <div className="mb-5">
                <label htmlFor="register-email" className="block mb-2 text-sm font-medium">Email</label>
                <input type="email" id="register-email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567] focus:border-transparent" />
              </div>
              <div className="mb-5">
                <label htmlFor="register-password" className="block mb-2 text-sm font-medium">Password</label>
                <input type="password" id="register-password" placeholder="Minimal 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567] focus:border-transparent" />
              </div>
            <button type="submit" disabled={loading} className="w-full py-3 text-base font-semibold text-white bg-[#348567] rounded-lg hover:bg-[#2A6A52] transition-colors disabled:bg-slate-400">
              {loading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>
          <p className="mt-6 text-sm text-center text-slate-500">Sudah punya akun? <button onClick={() => setIsLogin(true)} className="font-semibold text-[#348567] hover:underline">Masuk di sini</button></p>
        </div>
      )}
      {message.content && (
        <p className={`mt-4 text-sm text-center p-3 rounded-lg ${
          message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
        }`}>
          {message.content}
        </p>
      )}
    </div>
  </div>
</div>

);
}