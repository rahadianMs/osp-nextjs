import { useState } from 'react';

// Komponen untuk kalkulator karbon
export default function CarbonCalculator({ supabase, user, setActiveDashboardPage }) {
  const [title, setTitle] = useState('');
  const [electricity, setElectricity] = useState('');
  const [transport, setTransport] = useState('');
  const [waste, setWaste] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Faktor emisi (dalam kg CO2e per unit). Ini adalah contoh dan dapat disesuaikan.
  const EMISSION_FACTORS = {
    electricity: 0.85, // kg CO2e per kWh
    transport: 0.17,   // kg CO2e per km (mobil bensin rata-rata)
    waste: 0.55,       // kg CO2e per kg
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // Konversi input ke angka, default 0 jika kosong
    const electricity_kwh = parseFloat(electricity) || 0;
    const transport_km = parseFloat(transport) || 0;
    const waste_kg = parseFloat(waste) || 0;

    // Hitung total emisi
    const total_co2e_kg = 
      (electricity_kwh * EMISSION_FACTORS.electricity) +
      (transport_km * EMISSION_FACTORS.transport) +
      (waste_kg * EMISSION_FACTORS.waste);
      
    // Siapkan data untuk dikirim ke Supabase
    const newEntry = {
      user_id: user.id,
      calculation_title: title || `Laporan ${new Date().toLocaleDateString('id-ID')}`,
      electricity_kwh,
      transport_km,
      waste_kg,
      total_co2e_kg
    };

    const { error } = await supabase.from('carbon_entries').insert([newEntry]);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(`Sukses! Laporan Anda telah disimpan dengan total emisi ${total_co2e_kg.toFixed(2)} kg CO2e.`);
      // Reset form
      setTitle('');
      setElectricity('');
      setTransport('');
      setWaste('');
      // Arahkan kembali ke dasbor utama setelah 2 detik
      setTimeout(() => setActiveDashboardPage('dashboard-utama'), 2000);
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Kalkulator Jejak Karbon</h1>
      <div className="bg-white p-8 rounded-xl shadow-md border">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Judul Laporan (Opsional)</label>
            <input 
              type="text" 
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Laporan Bulan Oktober"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label htmlFor="electricity" className="block text-sm font-medium text-slate-700 mb-1">Konsumsi Listrik</label>
              <div className="relative">
                <input 
                  type="number"
                  id="electricity"
                  value={electricity}
                  onChange={(e) => setElectricity(e.target.value)}
                  placeholder="0"
                  className="w-full pl-4 pr-12 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567]"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-slate-500">kWh</span>
              </div>
            </div>
            <div>
              <label htmlFor="transport" className="block text-sm font-medium text-slate-700 mb-1">Jarak Transportasi Darat</label>
              <div className="relative">
                <input 
                  type="number" 
                  id="transport"
                  value={transport}
                  onChange={(e) => setTransport(e.target.value)}
                  placeholder="0"
                  className="w-full pl-4 pr-12 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567]"
                />
                 <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-slate-500">km</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="waste" className="block text-sm font-medium text-slate-700 mb-1">Produksi Sampah</label>
             <div className="relative">
              <input 
                type="number" 
                id="waste"
                value={waste}
                onChange={(e) => setWaste(e.target.value)}
                placeholder="0"
                className="w-full pl-4 pr-12 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348567]"
              />
               <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-slate-500">kg</span>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 text-base font-semibold text-white bg-[#348567] rounded-lg hover:bg-[#2A6A52] transition-colors disabled:bg-slate-400">
            {loading ? 'Menyimpan...' : 'Hitung & Simpan Laporan'}
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-center p-3 bg-emerald-50 text-emerald-700 rounded-lg">{message}</p>}
      </div>
    </div>
  );
}