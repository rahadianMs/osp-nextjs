"use client";

import { BookOpenIcon, DashboardIcon, HandshakeIcon, IncentiveIcon } from './Icons.jsx';

// Komponen untuk Halaman Tentang
export default function AboutPage() {
    const features = [
        { 
            icon: <DashboardIcon />, 
            title: "Kalkulator & Pemantauan Emisi", 
            description: "Alat pengukuran jejak karbon standar industri yang mengacu pada metodologi IPCC. Pantau emisi Scope 1, 2, dan 3 dari operasional bisnis Anda secara akurat dan transparan." 
        },
        { 
            icon: <BookOpenIcon />, 
            title: "Pusat Edukasi & Kapabilitas", 
            description: "Akses kurikulum pembelajaran komprehensif tentang dekarbonisasi pariwisata. Dari panduan teknis efisiensi energi hingga strategi manajemen limbah berkelanjutan." 
        },
        { 
            icon: <HandshakeIcon />, 
            title: "Ekosistem Rantai Pasok Hijau", 
            description: "Terhubung langsung dengan direktori penyedia solusi hijau terverifikasi. Temukan vendor energi terbarukan, pengelolaan sampah, dan produk ramah lingkungan." 
        },
        { 
            icon: <IncentiveIcon />, 
            title: "Apresiasi & Pengakuan Nasional", 
            description: "Dapatkan validasi resmi atas upaya dekarbonisasi Anda. Bisnis yang aktif melaporkan dan mengurangi emisi berhak mendapatkan sertifikat apresiasi dan eksposur sebagai 'Climate Champion'." 
        },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Section Header */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 text-center">
                <h1 className="text-3xl font-extrabold text-slate-800 mb-4">
                    Tentang <span className="text-[#22543d]">WIDI Hub</span>
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
                    <strong>Wonderful Indonesia Decarbonization Initiative Hub</strong> adalah platform nasional terintegrasi yang diprakarsai untuk memimpin transformasi sektor pariwisata Indonesia menuju masa depan rendah karbon dan berkelanjutan.
                </p>
            </div>

            {/* Section Visi & Misi (Dengan h-full agar tinggi sama rata) */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
                    <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="w-2 h-8 bg-[#22543d] rounded-full"></span>
                        Visi Kami
                    </h3>
                    <p className="text-slate-600 leading-relaxed flex-grow">
                        Mewujudkan sektor pariwisata Indonesia yang tangguh iklim dan mencapai target <strong>Net Zero Emissions pada tahun 2060</strong> atau lebih cepat, selaras dengan komitmen nasional dan global.
                    </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
                    <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="w-2 h-8 bg-[#c89c49] rounded-full"></span>
                        Misi Utama
                    </h3>
                    <ul className="space-y-2 text-slate-600 list-disc list-inside flex-grow">
                        <li>Menyediakan standar pengukuran karbon yang seragam.</li>
                        <li>Meningkatkan kapasitas pelaku usaha melalui edukasi.</li>
                        <li>Membangun kolaborasi lintas sektor untuk aksi iklim.</li>
                    </ul>
                </div>
            </div>

            {/* Section Fitur Utama */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
                <h2 className="text-2xl font-bold mb-8 text-slate-800 border-b pb-4">
                    Ekosistem Layanan WIDI
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                    {features.map((feature, index) => (
                        <div 
                            key={index} 
                            // MODIFIKASI: 
                            // 1. h-full: Memaksa tinggi mengikuti grid row tertinggi
                            // 2. bg-slate-50 & border-slate-100: Memberikan warna dasar agar bentuk kotak terlihat jelas ukurannya
                            className="flex gap-5 items-start p-5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:border-emerald-100 transition-all duration-300 h-full"
                        >
                            <div className="flex-shrink-0 text-white rounded-xl p-3 shadow-sm" style={{backgroundColor: '#22543d'}}>
                                {feature.icon}
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-700 mb-2">{feature.title}</h4>
                                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Section Call to Action Kecil */}
            <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-300 text-center">
                <p className="text-slate-500 text-sm">
                    Program ini merupakan bagian dari implementasi <strong>Glasgow Declaration on Climate Action in Tourism</strong> di Indonesia.
                </p>
            </div>
        </div>
    );
};