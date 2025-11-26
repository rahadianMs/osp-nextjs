"use client";

import { useState } from 'react';
import { 
    BookOpenIcon, 
    ChartPieIcon, 
    DocumentChartBarIcon, 
    QuestionMarkCircleIcon 
} from './Icons'; // Pastikan path import icon sesuai

// Komponen Ikon Nomor
const NumberCircle = ({ number }) => (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#22543d] text-white flex items-center justify-center font-bold shadow-sm">
        {number}
    </div>
);

// Komponen Section
const GuideSection = ({ title, children, icon }) => (
    <section className="mb-12 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            {icon && <div className="text-[#22543d]">{icon}</div>}
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        </div>
        <div className="space-y-5 text-slate-600 leading-relaxed">
            {children}
        </div>
    </section>
);

// Komponen Kartu Rumus Sederhana
const FormulaCard = ({ title, formula, description }) => (
    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-4">
        <h5 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wider">{title}</h5>
        <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-sm text-[#22543d] mb-2 overflow-x-auto">
            {formula}
        </div>
        <p className="text-xs text-slate-500">{description}</p>
    </div>
);

export default function PanduanPage() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-16">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Panduan Pengguna <span className="text-[#22543d]">WIDI Hub</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Pusat bantuan lengkap untuk memahami cara penggunaan platform Wonderful Indonesia Decarbonization Initiative.
                </p>
            </div>

            {/* 1. Intro Section */}
            <GuideSection title="Selamat Datang di WIDI Hub" icon={<BookOpenIcon className="w-8 h-8"/>}>
                <p>
                    <strong>Wonderful Indonesia Decarbonization Initiative Hub (WIDI Hub)</strong> adalah platform nasional yang dirancang khusus untuk pelaku industri pariwisata Indonesia—termasuk hotel, operator tur, dan pengelola atraksi wisata.
                </p>
                <p>
                    Platform ini berfungsi sebagai kalkulator jejak karbon terpadu yang membantu Anda mengukur, melaporkan, dan memantau emisi dari aktivitas operasional bisnis Anda sesuai dengan standar global (IPCC) dan nasional.
                </p>
            </GuideSection>

            {/* 2. Tutorial Input Data */}
            <GuideSection title="Cara Mengisi Laporan Emisi" icon={<DocumentChartBarIcon className="w-8 h-8"/>}>
                <div className="space-y-8">
                    <div className="flex items-start gap-4">
                        <NumberCircle number="1" />
                        <div>
                            <h4 className="font-bold text-lg text-slate-800 mb-2">Tentukan Periode Laporan</h4>
                            <p>
                                Masuk ke menu <strong>"Laporan Emisi"</strong>. Pilih bulan dan tahun periode operasional yang ingin Anda laporkan. Kami menyarankan pengisian dilakukan secara rutin setiap bulan (berdasarkan tagihan utilitas bulanan).
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <NumberCircle number="2" />
                        <div>
                            <h4 className="font-bold text-lg text-slate-800 mb-2">Input Data Aktivitas (4 Kategori)</h4>
                            <p className="mb-4">Sistem membagi sumber emisi ke dalam empat tab kategori. Pastikan Anda mengisi data dengan satuan yang diminta:</p>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 border rounded-lg bg-blue-50/50 border-blue-100">
                                    <strong className="block text-blue-800 mb-1">⚡ Listrik (Scope 2)</strong>
                                    <ul className="text-sm text-blue-700 list-disc list-inside">
                                        <li>Input: Total konsumsi dalam <strong>kWh</strong>.</li>
                                        <li>Data pendukung: Luas bangunan & jumlah kamar terisi.</li>
                                    </ul>
                                </div>
                                <div className="p-4 border rounded-lg bg-orange-50/50 border-orange-100">
                                    <strong className="block text-orange-800 mb-1">🔥 Energi Non-Listrik (Scope 1)</strong>
                                    <ul className="text-sm text-orange-700 list-disc list-inside">
                                        <li>Input: Jumlah bahan bakar dalam <strong>Liter</strong> (atau m³ untuk Gas Alam).</li>
                                        <li>Contoh: Solar Genset, LPG Dapur.</li>
                                    </ul>
                                </div>
                                <div className="p-4 border rounded-lg bg-purple-50/50 border-purple-100">
                                    <strong className="block text-purple-800 mb-1">🚗 Transportasi (Scope 1)</strong>
                                    <ul className="text-sm text-purple-700 list-disc list-inside">
                                        <li>Input: Konsumsi BBM kendaraan operasional dalam <strong>Liter</strong>.</li>
                                        <li>Pilih jenis bahan bakar yang spesifik (misal: Bensin RON 92).</li>
                                    </ul>
                                </div>
                                <div className="p-4 border rounded-lg bg-green-50/50 border-green-100">
                                    <strong className="block text-green-800 mb-1">🗑️ Limbah (Scope 3)</strong>
                                    <ul className="text-sm text-green-700 list-disc list-inside">
                                        <li><strong>PENTING:</strong> Input berat limbah dalam satuan <strong>Kilogram (kg)</strong>.</li>
                                        <li>Sistem akan otomatis mengonversi hasil akhirnya menjadi <strong>Ton CO₂e</strong>.</li>
                                        <li>Pilih metode pengolahan yang sesuai (TPA, Kompos, Daur Ulang, dll).</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <NumberCircle number="3" />
                        <div>
                            <h4 className="font-bold text-lg text-slate-800 mb-2">Simpan & Verifikasi</h4>
                            <p>
                                Klik tombol <strong>"Simpan Laporan"</strong> di setiap tab. Laporan Anda akan berstatus <em>"Menunggu Verifikasi"</em> hingga diperiksa oleh admin. Anda dapat melampirkan bukti pendukung (foto tagihan/struk) melalui kolom tautan bukti.
                            </p>
                        </div>
                    </div>
                </div>
            </GuideSection>

            {/* 3. Transparansi Metodologi */}
            <GuideSection title="Transparansi Metodologi Perhitungan" icon={<ChartPieIcon className="w-8 h-8"/>}>
                <p className="mb-6">
                    WIDI Hub menggunakan standar perhitungan berbasis sains (IPCC) yang disesuaikan dengan faktor emisi lokal Indonesia. Berikut adalah logika perhitungan di balik layar kalkulator ini:
                </p>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Kiri */}
                    <div>
                        <FormulaCard 
                            title="Listrik (Grid)" 
                            formula="kWh × Faktor Emisi Grid Wilayah"
                            description="Faktor emisi berbeda tiap provinsi (misal: Jawa-Bali ~0.8 kg CO₂e/kWh) tergantung pembangkit listrik setempat."
                        />
                        <FormulaCard 
                            title="Pembakaran BBM (Genset & Kendaraan)" 
                            formula="(Liter × Faktor Emisi BBM) ÷ 1000"
                            description="Menghitung total emisi CO₂, CH₄, dan N₂O dari pembakaran bahan bakar. Hasil dibagi 1.000 untuk konversi kg ke Ton."
                        />
                    </div>

                    {/* Kanan - Limbah Detail */}
                    <div>
                        <h5 className="font-bold text-slate-800 mb-3 text-sm">Perhitungan Limbah (Kompleks)</h5>
                        <div className="space-y-3">
                            <div className="p-3 bg-red-50 rounded border border-red-100 text-sm">
                                <strong className="block text-red-700">1. Dibuang ke TPA (Landfill)</strong>
                                <span className="text-red-600">Menggunakan metode <em>IPCC First Order Decay</em> untuk menghitung potensi gas Metana (CH₄) yang dihasilkan dari pembusukan sampah organik.</span>
                            </div>
                            <div className="p-3 bg-orange-50 rounded border border-orange-100 text-sm">
                                <strong className="block text-orange-700">2. Dibakar (Insinerasi / Terbuka)</strong>
                                <span className="text-orange-600">Menghitung total emisi dari gas Nitrogen Oksida (N₂O), Metana (CH₄), dan Karbon Fosil (CO₂) khusus untuk sampah plastik/tekstil.</span>
                            </div>
                            <div className="p-3 bg-green-50 rounded border border-green-100 text-sm">
                                <strong className="block text-green-700">3. Pengomposan & Biogas</strong>
                                <span className="text-green-600">Hanya menghitung emisi kebocoran gas (CH₄ & N₂O) yang sangat kecil selama proses penguraian biologis.</span>
                            </div>
                            <div className="p-3 bg-blue-50 rounded border border-blue-100 text-sm">
                                <strong className="block text-blue-700">4. Daur Ulang (Recycle)</strong>
                                <span className="text-blue-600">Dianggap <strong>0 Emisi</strong> dalam batasan pelaporan ini, karena material dipulihkan kembali menjadi bahan baku.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </GuideSection>

            {/* 4. FAQ Singkat */}
            <GuideSection title="Pertanyaan Umum" icon={<QuestionMarkCircleIcon className="w-8 h-8"/>}>
                <ul className="space-y-4 list-disc list-inside text-slate-700">
                    <li>
                        <strong>Apakah data saya aman?</strong>
                        <br/>Ya, data spesifik perusahaan Anda bersifat privat. Data yang ditampilkan ke publik di halaman depan hanyalah data agregat nasional (total gabungan) atau data resmi pemerintah (SIPONGI).
                    </li>
                    <li>
                        <strong>Mengapa input limbah harus dalam Kilogram (kg)?</strong>
                        <br/>Standar perhitungan IPCC menggunakan berat massa dalam kilogram untuk presisi faktor emisi gas metana. Sistem kami yang akan mengonversinya menjadi Ton di laporan akhir untuk kemudahan pembacaan.
                    </li>
                    <li>
                        <strong>Apa itu CO₂e?</strong>
                        <br/><em>Carbon Dioxide Equivalent</em>. Ini adalah satuan standar untuk menyetarakan dampak berbagai gas rumah kaca (seperti Metana yang 28x lebih kuat dari CO₂) menjadi satu satuan setara CO₂ agar mudah dijumlahkan.
                    </li>
                </ul>
            </GuideSection>
        </div>
    );
}