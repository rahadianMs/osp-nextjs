"use client";

import { useState, useEffect } from 'react';
import { DocumentChartBarIcon, QuestionMarkCircleIcon, BellIcon, BoltIcon, TransportIcon, TrashCanIcon, FireIcon } from './Icons';

// Komponen Kartu Rincian kecil
const DetailCard = ({ icon, consumptionValue, consumptionUnit, emissionValue, emissionUnit, colorClass }) => (
    <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col justify-between h-full">
        <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${colorClass.bg}`}>
                <div className={colorClass.text}>{icon}</div>
            </div>
            <div>
                <p className="text-xl font-bold text-slate-800">{consumptionValue} <span className="text-base font-normal">{consumptionUnit}</span></p>
                <p className="text-sm text-slate-500 -mt-1">Total Konsumsi Bulan Ini</p>
            </div>
        </div>
        <div className="text-right mt-4">
            <p className="text-lg font-bold text-slate-700">{emissionValue.toFixed(2)} <span className="text-sm font-medium">{emissionUnit}</span></p>
        </div>
    </div>
);

// Komponen Pengingat Progres
const ProgressReminder = ({ percentageChange }) => {
    if (percentageChange === null || isNaN(percentageChange)) {
        return (
            <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-4 rounded-r-lg">
                <p className="font-bold">Laporan Pertama Dibuat!</p>
                <p className="text-sm">Terus laporkan data emisi setiap bulan untuk melihat progres keberlanjutan Anda.</p>
            </div>
        );
    }

    const isIncrease = percentageChange > 0;
    const isStable = percentageChange === 0;
    const colorClass = isIncrease ? "border-red-400 bg-red-50 text-red-700" : "border-green-400 bg-green-50 text-green-700";
    const text = isIncrease ? `meningkat ${percentageChange.toFixed(1)}%` : `berhasil turun ${Math.abs(percentageChange.toFixed(1))}%`;

    if (isStable) {
        return (
            <div className="bg-gray-50 border-l-4 border-gray-400 text-gray-700 p-4 rounded-r-lg">
                <p className="font-bold">Emisi Anda Stabil</p>
                <p className="text-sm">Tidak ada perubahan emisi dari bulan lalu. Pertahankan usaha Anda!</p>
            </div>
        )
    }

    return (
        <div className={`${colorClass} border-l-4 p-4 rounded-r-lg`}>
            <p className="font-bold">Progres Bulan Ini</p>
            <p className="text-sm">Total emisi Anda {text} dari bulan sebelumnya. Terus tingkatkan!</p>
        </div>
    );
};

// Komponen Utama Halaman Beranda
// --- PERUBAHAN 1: Terima 'initialBusinessName' ---
export default function BerandaPage({ user, supabase, setActiveDashboardPage, dataVersion, initialBusinessName }) {
    
    // --- PERUBAHAN 2: Gunakan prop untuk inisialisasi state ---
    const [businessName, setBusinessName] = useState(initialBusinessName || 'Rekan');
    // --- AKHIR PERUBAHAN 2 ---

    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true); // State loading ini sekarang HANYA untuk chart
    const [percentageChange, setPercentageChange] = useState(null);
    const [latestConsumption, setLatestConsumption] = useState({ kwh: 0, nonElectric: 0, km: 0, waste: 0 });
    
    useEffect(() => {
        const fetchPageData = async () => {
            if (!user) { 
                setLoading(false); 
                return; 
            }
            
            setLoading(true); 
            
            try {
                // --- PERUBAHAN 3: Logika pengambilan nama dihapus dari sini ---
                // Nama sudah disediakan melalui prop 'initialBusinessName'
                // --- AKHIR PERUBAHAN 3 ---

                // Ambil sisa data (yang mungkin lambat)
                const twoMonthsAgo = new Date();
                twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
                const firstDayOfTwoMonthsAgo = new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth(), 1).toISOString().slice(0, 7);

                const { data: entries, error } = await supabase
                    .from('carbon_entries')
                    .select('*') 
                    .eq('user_id', user.id)
                    .gte('report_month', firstDayOfTwoMonthsAgo)
                    .order('report_month', { ascending: false });

                if (error) throw error;
                
                if (entries && entries.length > 0) {
                    const latestMonthEntry = entries[0];
                    const previousMonthEntry = entries.find(e => e.report_month !== latestMonthEntry.report_month);

                    if (previousMonthEntry && previousMonthEntry.total_co2e_kg > 0) {
                        const change = ((latestMonthEntry.total_co2e_kg - previousMonthEntry.total_co2e_kg) / previousMonthEntry.total_co2e_kg) * 100;
                        setPercentageChange(change);
                    } else {
                        setPercentageChange(null);
                    }

                    let totalKwh = latestMonthEntry.electricity_details?.kwh || 0;
                    let totalNonElectric = (latestMonthEntry.non_electricity_details?.items || []).reduce((acc, v) => acc + ((v.usage || 0) * (v.frequency || 0)), 0);
                    let totalKm = (latestMonthEntry.transport_details || []).reduce((acc, v) => acc + ((v.km || 0) * (v.frequency || 0)), 0);
                    let totalWaste = (latestMonthEntry.waste_details?.items || []).reduce((acc, i) => acc + (i.weight || 0), 0);
                    
                    setLatestConsumption({ kwh: totalKwh, nonElectric: totalNonElectric, km: totalKm, waste: totalWaste });
                    
                    setSummary({
                        total_electricity: latestMonthEntry.electricity_co2e || 0,
                        total_non_electricity: latestMonthEntry.non_electricity_co2e || 0,
                        total_transport: latestMonthEntry.transport_co2e || 0,
                        total_waste: latestMonthEntry.waste_co2e || 0,
                        total_all: latestMonthEntry.total_co2e_kg || 0,
                        report_count: entries.length,
                    });
                } else {
                     setSummary({ total_all: 0, report_count: 0, total_electricity: 0, total_non_electricity: 0, total_transport: 0, total_waste: 0 });
                     setPercentageChange(null);
                     setLatestConsumption({ kwh: 0, nonElectric: 0, km: 0, waste: 0 });
                }

            } catch (err) {
                console.error('Error fetching data for Beranda:', err);
                setSummary({ total_all: 0, report_count: 0, total_electricity: 0, total_non_electricity: 0, total_transport: 0, total_waste: 0 });
            } finally {
                setLoading(false);
            }
        };
    
        fetchPageData();
    // --- PERUBAHAN 4: Hapus 'initialBusinessName' dari dependencies ---
    }, [user, supabase, dataVersion]);
    // --- AKHIR PERUBAHAN 4 ---

    const userBgImage = "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?fm=jpg&q=60&w=3000&ixlib=rb-4-1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YmFsaSUyMGhvdGVsfGVufDB8fDB8fHww";

    return (
        <div className="space-y-8">
            <div 
                className="relative p-8 rounded-2xl text-white bg-cover bg-center min-h-[180px] flex flex-col justify-between"
                style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.1)), url('${userBgImage}')` }}
            >
                <button onClick={() => setActiveDashboardPage('notifikasi')} className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10">
                    <BellIcon />
                </button>
                
                <div className="relative z-0">
                    {/* --- PERUBAHAN 5: Hapus ternary 'loading ?' --- */}
                    <h1 className="text-4xl font-extrabold drop-shadow-md">
                        Selamat Datang, {businessName}!
                    </h1>
                    {/* --- AKHIR PERUBAHAN 5 --- */}
                    <p className="mt-1 text-lg opacity-90 drop-shadow">Ini adalah pusat kendali Anda untuk pariwisata berkelanjutan.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    {/* State 'loading' sekarang hanya mengontrol bagian ini */}
                    {loading ? (
                        <div className="animate-pulse h-28 bg-slate-200 rounded-xl"></div>
                    ) : (
                        <div className="bg-[#22543d] text-white p-6 rounded-xl shadow-lg">
                            <p className="text-white/80">Total Emisi Bulan Ini</p>
                            <p className="text-3xl font-extrabold">{(summary?.total_all || 0).toFixed(2)} <span className="text-xl font-medium">ton CO₂e</span></p>
                            {(summary?.report_count || 0) > 0 && (
                                <div className="mt-4">
                                    <ProgressReminder percentageChange={percentageChange} />
                                </div>
                            )}
                        </div>
                    )}
                    
                    {loading ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                            <div className="h-40 bg-slate-200 rounded-xl"></div>
                            <div className="h-40 bg-slate-200 rounded-xl"></div>
                            <div className="h-40 bg-slate-200 rounded-xl"></div>
                            <div className="h-40 bg-slate-200 rounded-xl"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <DetailCard icon={<BoltIcon className="w-5 h-5"/>} consumptionValue={latestConsumption.kwh.toLocaleString('id-ID')} consumptionUnit="kWh" emissionValue={summary?.total_electricity || 0} emissionUnit="ton CO₂e" colorClass={{bg: 'bg-amber-100', text: 'text-amber-600'}} />
                            <DetailCard icon={<FireIcon />} consumptionValue={latestConsumption.nonElectric.toLocaleString('id-ID')} consumptionUnit="L/m³" emissionValue={summary?.total_non_electricity || 0} emissionUnit="ton CO₂e" colorClass={{bg: 'bg-orange-100', text: 'text-orange-600'}} />
                            <DetailCard icon={<TransportIcon className="w-6 h-6"/>} consumptionValue={latestConsumption.km.toLocaleString('id-ID')} consumptionUnit="km" emissionValue={summary?.total_transport || 0} emissionUnit="ton CO₂e" colorClass={{bg: 'bg-blue-100', text: 'text-blue-600'}} />
                            <DetailCard icon={<TrashCanIcon className="w-5 h-5"/>} consumptionValue={latestConsumption.waste.toFixed(2)} consumptionUnit="ton" emissionValue={summary?.total_waste || 0} emissionUnit="ton CO₂e" colorClass={{bg: 'bg-red-100', text: 'text-red-600'}} />
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 bg-white p-6 rounded-xl border shadow-sm flex flex-col justify-between">
                     <div>
                        <h3 className="text-xl font-bold text-slate-800">Siap Melaporkan Emisi?</h3>
                        <p className="text-slate-500 mt-2">Mulai langkah Anda dengan melaporkan data emisi untuk periode ini.</p>
                    </div>
                    <div className="mt-4">
                        <button onClick={() => setActiveDashboardPage('laporan-emisi')} className="w-full py-3 text-base font-semibold text-white bg-[#22543d] rounded-lg transition-colors hover:bg-[#1c4532] flex items-center justify-center gap-2">
                            <DocumentChartBarIcon />
                            Lapor Emisi Sekarang
                        </button>
                        <button onClick={() => setActiveDashboardPage('panduan')} className="w-full mt-3 text-sm font-medium text-slate-500 hover:text-[#22543d] flex items-center justify-center gap-2 transition-colors">
                            <QuestionMarkCircleIcon />
                            Baca Panduan Penggunaan
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-800">Mengapa harus Pariwisata Berkelanjutan?</h3>
                    <div className="bg-white p-2 rounded-xl border shadow-sm aspect-video w-full overflow-hidden">
                         <iframe className="w-full h-full rounded-lg" src="https://www.youtube.com/embed/WNMdYppVF4U" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
}