"use client";

import { 
    BookOpenIcon, 
    DocumentChartBarIcon, 
} from './Icons'; 

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
        </div>
    );
}