// app/components/PetaEmisiPage.jsx
"use client";

import dynamic from 'next/dynamic';

// Import EmissionMap secara dinamis (karena butuh browser API)
const EmissionMap = dynamic(() => import('./EmissionMap'), { 
    ssr: false,
    loading: () => <div className="h-[500px] bg-zinc-200 rounded-lg animate-pulse flex items-center justify-center">Memuat Peta...</div>
});

export default function PetaEmisiPage() {
    return (
        <div className="bg-white p-8 rounded-xl shadow-md border">
            <h2 className="text-3xl font-bold mb-4 text-slate-800">Peta Sebaran Emisi Karbon</h2>
            <p className="text-slate-600 mb-8 max-w-4xl">
                Visualisasi data emisi CO2 dari sektor pariwisata di berbagai provinsi di Indonesia. 
                Data ini membantu memetakan dampak lingkungan dan mengidentifikasi area prioritas 
                untuk inisiatif pariwisata berkelanjutan.
            </p>
            {/* * Catatan: Ini adalah komponen peta yang sama dengan di Landing Page.
              * Di masa depan, Anda bisa menambahkan properti (props) baru ke EmissionMap
              * untuk menampilkan data yang lebih detail khusus untuk halaman dasbor ini.
            */}
            <div className="h-[600px] w-full rounded-lg overflow-hidden border">
                <EmissionMap />
            </div>
        </div>
    );
}