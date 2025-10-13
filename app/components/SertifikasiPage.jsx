"use client";
import { useState, useEffect } from 'react';
import { generateCertificatePdf } from '../lib/generateCertificatePdf';

// Komponen Halaman Sertifikasi
export default function SertifikasiPage({ supabase, user }) {
    const [isEligible, setIsEligible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [businessName, setBusinessName] = useState("Nama Bisnis Anda");

    // Cek kelayakan dan ambil nama bisnis
    useEffect(() => {
        const checkData = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }
            
            setIsLoading(true);
            try {
                // 1. Ambil nama bisnis dari tabel profiles
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('business_name')
                    .eq('id', user.id)
                    .single();

                if (profileError && profileError.code !== 'PGRST116') throw profileError;
                
                if (profileData?.business_name) {
                    setBusinessName(profileData.business_name);
                } else if (user.user_metadata?.business_name) {
                    // Fallback ke metadata lama jika ada
                    setBusinessName(user.user_metadata.business_name);
                }

                // 2. Cek kelayakan untuk sertifikat
                const { data: entries, error: entriesError } = await supabase
                    .from('carbon_entries')
                    .select('electricity_co2e, waste_co2e, transport_co2e')
                    .eq('user_id', user.id)
                    .gt('electricity_co2e', 0)
                    .gt('waste_co2e', 0)
                    .gt('transport_co2e', 0)
                    .limit(1);

                if (entriesError) throw entriesError;

                // Jika ada setidaknya satu laporan yang memenuhi syarat, pengguna berhak
                if (entries && entries.length > 0) {
                    setIsEligible(true);
                } else {
                    setIsEligible(false);
                }

            } catch (error) {
                console.error("Error checking eligibility:", error);
                setIsEligible(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkData();
    }, [supabase, user]);

    // Fungsi untuk memanggil pembuatan PDF
    const handleDownload = async () => {
        if (!isEligible || isDownloading) return;
        setIsDownloading(true);
        await generateCertificatePdf(businessName);
        setIsDownloading(false);
    };

    // Fungsi untuk membuat nomor sertifikat dinamis (hanya untuk pratinjau)
    const generateCertNumber = () => {
        const date = new Date();
        const ddmmyyyy = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear()}`;
        const randomChars = "BVGFHRY";
        return `${randomChars}-${ddmmyyyy}`;
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-12">
                <h1 className="text-4xl font-bold text-slate-800">Sertifikat Apresiasi</h1>
                <p className="mt-2 text-lg text-slate-600">Dapatkan pengakuan atas komitmen Anda terhadap pariwisata ramah lingkungan.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                {/* Kolom Kiri: Pratinjau Sertifikat */}
                <div className="bg-white p-4 aspect-[1/1.414] shadow-lg flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-12 bg-[#00A79D]"></div>
                    <div className="absolute top-0 right-0 h-16 w-full bg-[#E0F2F1]"></div>
                    
                    <div className="relative z-10 p-8 flex-grow flex flex-col">
                        <img 
                            src="https://upload.wikimedia.org/wikipedia/commons/f/fc/Lambang_Kementerian_Pariwisata_Republik_Indonesia_%282024%29.png" 
                            alt="Logo Kemenparekraf"
                            className="h-20 w-auto self-end"
                        />

                        <div className="mt-8">
                            <p className="text-sm text-slate-500">Nomor Sertifikat: {generateCertNumber()}</p>
                            <h2 className="text-2xl font-bold text-[#00695C] mt-4">DEKARBONISASI PARIWISATA</h2>
                            <h1 className="text-4xl font-extrabold text-slate-800">SERTIFIKAT APRESIASI</h1>
                        </div>

                        <div className="mt-8">
                            <p className="text-slate-600">Sertifikat ini dengan bangga diberikan kepada</p>
                            <p className="text-3xl font-bold text-slate-900 my-4">{businessName}</p>
                            <p className="text-sm max-w-md text-slate-600">
                                atas komitmennya terhadap keberlanjutan dengan mengukur jejak karbonnya. Dedikasi Anda berkontribusi untuk masa depan yang lebih hijau dan mendukung perjalanan Indonesia menuju Pariwisata Net Zero.
                            </p>
                        </div>
                        
                        <div className="mt-auto text-sm text-slate-500">
                             <p>Terima kasih telah menjadi bagian yang bertanggung jawab dari pariwisata berkelanjutan.</p>
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan: Informasi dan Tombol Aksi */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-slate-800">Unduh Sertifikat Anda</h2>
                    <p className="text-slate-600">
                        Sertifikat ini adalah bukti nyata dari partisipasi dan komitmen Anda dalam program dekarbonisasi pariwisata. Untuk dapat mengunduh, Anda harus terlebih dahulu memiliki setidaknya satu laporan emisi yang sudah mencakup ketiga kategori: Listrik, Transportasi, dan Limbah.
                    </p>
                    
                    <div className="relative w-full group">
                        <button 
                            onClick={handleDownload}
                            disabled={!isEligible || isLoading || isDownloading}
                            className={`w-full py-4 text-lg font-semibold text-white rounded-lg transition-colors ${isEligible ? 'bg-[#22543d] hover:bg-[#1c4532]' : 'bg-slate-400 cursor-not-allowed'}`}
                        >
                            {isLoading ? 'Memeriksa Kelayakan...' : (isDownloading ? 'Membuat PDF...' : 'Unduh Sertifikat (.pdf)')}
                        </button>
                        
                        {!isEligible && !isLoading && (
                            <div className="absolute bottom-full mb-2 w-full px-4 py-2 bg-slate-800 text-white text-sm rounded-lg text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                Harap lengkapi laporan emisi (Listrik, Transportasi, dan Limbah) terlebih dahulu.
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}