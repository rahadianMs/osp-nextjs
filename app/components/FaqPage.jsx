"use client";

import { useState } from 'react';
import { QuestionMarkCircleIcon } from './Icons.jsx';

// Komponen untuk Halaman FAQ
export default function FaqPage() {
    // State untuk mengontrol accordion (opsional, agar bisa buka tutup satu per satu)
    // Saat ini dibiarkan default HTML <details> behavior agar simpel

    const faqs = [
        { 
            q: "Apa itu WIDI Hub?", 
            a: "Wonderful Indonesia Decarbonization Initiative Hub (WIDI Hub) adalah platform nasional terintegrasi yang dikembangkan oleh Kemenparekraf. Platform ini berfungsi sebagai pusat data dan alat bantu bagi pelaku industri pariwisata (Hotel, Operator Tur, Atraksi) untuk mengukur, memantau, dan melaporkan emisi karbon dari aktivitas operasional mereka menuju target Net Zero." 
        },
        { 
            q: "Mengapa bisnis saya wajib menghitung jejak karbon?", 
            a: "Selain sebagai bentuk kepatuhan terhadap regulasi lingkungan masa depan, menghitung jejak karbon membantu Anda mengidentifikasi inefisiensi energi yang boros biaya. Bisnis yang terverifikasi 'hijau' juga mendapatkan akses pasar lebih luas ke wisatawan global yang semakin sadar lingkungan, serta berkesempatan mendapatkan insentif dari pemerintah." 
        },
        { 
            q: "Standar perhitungan apa yang digunakan kalkulator ini?", 
            a: "Kalkulator WIDI Hub dikembangkan berdasarkan standar internasional IPCC (Intergovernmental Panel on Climate Change) yang disesuaikan dengan faktor emisi lokal Indonesia (seperti faktor grid listrik Jawa-Bali vs luar Jawa, dan data kehutanan SIPONGI). Ini memastikan akurasi laporan Anda diakui secara global." 
        },
        { 
            q: "Apa perbedaan Scope 1, Scope 2, dan Scope 3?", 
            a: "Scope 1 adalah emisi langsung dari sumber yang Anda miliki (misal: bensin kendaraan operasional, solar genset). Scope 2 adalah emisi tidak langsung dari energi yang Anda beli (misal: tagihan listrik PLN). Scope 3 adalah emisi tidak langsung lainnya dalam rantai nilai, seperti limbah yang dihasilkan dan perjalanan dinas." 
        },
        { 
            q: "Mengapa input limbah dalam Kilogram (kg) tapi hasil akhirnya Ton?", 
            a: "Kami meminta input dalam Kilogram (kg) untuk menjaga presisi perhitungan ilmiah, terutama untuk rumus pembusukan metana pada sampah organik yang sangat sensitif terhadap berat massa. Sistem secara otomatis mengonversi hasil akhir ke satuan Ton CO₂e agar lebih mudah dibaca dan dilaporkan dalam standar industri." 
        },
        { 
            q: "Apakah data perusahaan saya aman dan bersifat publik?", 
            a: "Data spesifik perusahaan Anda (seperti tagihan listrik detail atau volume bahan bakar) bersifat PRIVAT dan dilindungi enkripsi. Data yang dipublikasikan di halaman depan hanyalah data agregat (total gabungan nasional) atau data yang sudah disetujui untuk transparansi publik (seperti status sertifikasi)." 
        },
        { 
            q: "Apa yang terjadi setelah saya mengirim laporan?", 
            a: "Laporan Anda akan berstatus 'Menunggu Verifikasi'. Tim admin/verifikator WIDI Hub akan memeriksa kelengkapan data dan bukti pendukung. Jika disetujui, status berubah menjadi 'Terverifikasi' dan data tersebut akan dihitung ke dalam pencapaian pengurangan emisi nasional. Jika ditolak, Anda akan mendapat catatan perbaikan." 
        },
        { 
            q: "Apakah saya bisa mengedit data yang sudah tersimpan?", 
            a: "Anda dapat mengedit data laporan selama statusnya masih 'Draft' atau 'Menunggu Verifikasi'. Namun, laporan yang sudah berstatus 'Terverifikasi' akan dikunci untuk menjaga integritas data sejarah. Jika ada kesalahan fatal pada data terverifikasi, silakan hubungi admin untuk prosedur reset." 
        },
    ];

    return (
        <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-slate-800 flex items-center justify-center gap-3">
                    <QuestionMarkCircleIcon className="w-10 h-10 text-[#22543d]" />
                    Pusat Bantuan & FAQ
                </h2>
                <p className="text-slate-600 mt-3">
                    Jawaban atas pertanyaan umum mengenai penggunaan platform WIDI Hub.
                </p>
            </div>

            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <details 
                        key={index} 
                        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 group transition-all duration-300 hover:shadow-md open:ring-1 open:ring-[#22543d]/20"
                    >
                        <summary className="font-bold text-lg cursor-pointer list-none flex justify-between items-center text-slate-800">
                            <span className="pr-8">{faq.q}</span>
                            <span className="flex-shrink-0 transition-transform duration-300 group-open:rotate-180 text-[#22543d]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </summary>
                        <div className="mt-4 text-slate-600 leading-relaxed border-t border-slate-100 pt-4 animate-fadeIn">
                            {faq.a}
                        </div>
                    </details>
                ))}
            </div>

            {/* Contact Support Section */}
            <div className="mt-12 p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center">
                <h4 className="font-bold text-slate-800 mb-2">Masih memiliki pertanyaan?</h4>
                <p className="text-slate-600 mb-6 text-sm">
                    Tim teknis kami siap membantu Anda memahami platform ini lebih dalam.
                </p>
                <a 
                    href="mailto:support@widihub.id" 
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white rounded-lg transition-colors hover:bg-[#1c4532]"
                    style={{backgroundColor: '#22543d'}}
                >
                    Hubungi Layanan Bantuan
                </a>
            </div>
        </div>
    );
};