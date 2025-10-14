"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const EmissionMap = () => {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2025');
  const availableYears = ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];

  // Fungsi untuk menentukan warna provinsi berdasarkan nilai emisi
  const getColor = (value) => {
    if (value === null || value === undefined) return '#d1d5db'; // Abu-abu
    return value > 10000000 ? '#085839'  // Sangat Tinggi
         : value > 5000000  ? '#1a7553'
         : value > 1000000  ? '#2b926d'
         : value > 500000   ? '#43b089'
         : value > 100000   ? '#62cea5'
         : value > 10000    ? '#89e0b9'  // Rendah
         : '#b8f2d5';       // Sangat Rendah
  };
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Ambil data GeoJSON asli Anda
        const geoResponse = await fetch('/data/indonesia-provinces.json');
        const geoJsonData = await geoResponse.json();

        // 2. Ambil data emisi dari file JSON yang sudah kita buat
        const emissionResponse = await fetch('/data/emisiCO2.json');
        const emissionData = await emissionResponse.json();
        
        // 3. Gabungkan data emisi ke dalam GeoJSON
        const combinedFeatures = geoJsonData.features.map(feature => {
            // [FIX] Kunci properti di file asli adalah "PROVINSI" (huruf besar)
            // Normalisasi nama: ubah ke huruf besar dan hilangkan spasi ekstra
            const geoProvinceName = feature.properties.PROVINSI?.toUpperCase().trim();
            
            // Cari data emisi yang cocok dengan nama yang sudah dinormalisasi
            const emissionsForProvince = emissionData[geoProvinceName];

            // Buat properti 'emissions' baru di dalam GeoJSON
            return {
                ...feature,
                properties: { 
                    ...feature.properties, 
                    emissions: emissionsForProvince || {} // Beri objek kosong jika tidak ada data
                },
            };
        });

        // Simpan data GeoJSON yang sudah digabung ke dalam state
        setGeoData({ ...geoJsonData, features: combinedFeatures });

      } catch (error) {
        console.error("Gagal memuat atau memproses data peta:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fungsi untuk styling GeoJSON berdasarkan nilai emisi tahun yang dipilih
  const style = (feature) => {
    const emissionValue = feature.properties.emissions?.[selectedYear];
    return {
      fillColor: getColor(emissionValue),
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.8,
    };
  };

  // Fungsi untuk interaksi pada setiap provinsi (popup & hover)
  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
        // [FIX] Gunakan "PROVINSI" sesuai file asli
        const { PROVINSI, emissions } = feature.properties;
        const emissionValue = emissions?.[selectedYear];
        
        const emissionText = emissionValue !== null && emissionValue !== undefined 
            ? `${emissionValue.toLocaleString('id-ID')} ton CO₂e` 
            : 'Data tidak tersedia';
        
        // Popup saat di-klik
        layer.bindPopup(`<strong>${PROVINSI}</strong><br/>Emisi ${selectedYear}: ${emissionText}`);
        
        // Efek hover
        layer.on({
            mouseover: (e) => e.target.setStyle({ weight: 2.5, color: '#333', fillOpacity: 1 }),
            mouseout: (e) => layer.setStyle(style(feature)),
        });
    }
  };

  if (loading) {
    return <div className="h-[550px] bg-zinc-200 rounded-lg animate-pulse flex items-center justify-center"><p className="text-zinc-500">Memuat Peta Emisi...</p></div>;
  }

  return (
    <div className="relative">
        <MapContainer center={[-2.5, 118]} zoom={5} style={{ height: '550px', width: '100%' }} className="rounded-lg shadow-lg z-0" zoomControl={false}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {geoData && <GeoJSON key={selectedYear} data={geoData} style={style} onEachFeature={onEachFeature} />}
        </MapContainer>
        
        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-md z-10 flex items-center gap-2">
            <label htmlFor="year-select" className="text-sm font-semibold text-zinc-700">Tahun:</label>
            <select 
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-white border border-zinc-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#22543d]"
            >
                {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
        </div>

        <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-md z-10 w-48">
            <h4 className="font-bold text-sm mb-2">Legenda Emisi (ton CO₂e)</h4>
            <div className="space-y-1 text-xs">
                <div className="flex items-center"><div className="w-4 h-4 mr-2" style={{backgroundColor: getColor(15000000)}}></div>{'>'} 10 jt</div>
                <div className="flex items-center"><div className="w-4 h-4 mr-2" style={{backgroundColor: getColor(7000000)}}></div>5 jt - 10 jt</div>
                <div className="flex items-center"><div className="w-4 h-4 mr-2" style={{backgroundColor: getColor(2000000)}}></div>1 jt - 5 jt</div>
                <div className="flex items-center"><div className="w-4 h-4 mr-2" style={{backgroundColor: getColor(700000)}}></div>500 rb - 1 jt</div>
                <div className="flex items-center"><div className="w-4 h-4 mr-2" style={{backgroundColor: getColor(200000)}}></div>100 rb - 500 rb</div>
                <div className="flex items-center"><div className="w-4 h-4 mr-2" style={{backgroundColor: getColor(50000)}}></div>{'<'} 100 rb</div>
                <div className="flex items-center"><div className="w-4 h-4 mr-2" style={{backgroundColor: getColor(undefined)}}></div>Tidak Ada Data</div>
            </div>
        </div>
    </div>
  );
};

export default EmissionMap;