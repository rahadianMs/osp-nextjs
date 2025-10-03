import { useState, useEffect } from 'react';

// Komponen untuk menampilkan riwayat entri karbon
export default function EmissionHistory({ supabase, user }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('carbon_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching carbon entries:', error);
      } else {
        setEntries(data);
      }
      setLoading(false);
    };

    fetchEntries();
  }, [user, supabase]);

  if (loading) {
    return <div className="text-center p-4">Memuat riwayat...</div>;
  }
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Riwayat Laporan Emisi</h2>
      {entries.length === 0 ? (
        <p className="text-slate-500 bg-white p-6 rounded-lg shadow-sm">Anda belum memiliki laporan. Buat laporan pertama Anda di halaman "Laporan Emisi".</p>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <div key={entry.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{entry.calculation_title || 'Laporan Tanpa Judul'}</h3>
                <p className="text-sm text-slate-500">
                  {new Date(entry.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-[#348567]">{entry.total_co2e_kg.toFixed(2)}</p>
                <p className="text-sm text-slate-500">kg CO2e</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}