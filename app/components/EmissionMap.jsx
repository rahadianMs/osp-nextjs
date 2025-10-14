"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const EmissionMap = () => {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2025');
  // [BARU] State untuk menyimpan sumber data yang dipilih
  const [selectedDataSource, setSelectedDataSource] = useState('SIPONGI KEMENHUT'); 

  const availableYears = ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];
  // [BARU] Daftar sumber data yang tersedia
  const availableDataSources = ['SIPONGI KEMENHUT', 'Akomodasi', 'Operator Jasa Perjalanan', 'Pengelola Atraksi Wisata'];

  // Fungsi untuk menentukan warna provinsi berdasarkan nilai emisi
  const getColor = (value) => {
    if (value === null || value === undefined) return '#d1d5db'; // Abu-abu (Tidak ada data)
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
        // 1. Selalu ambil data GeoJSON dasar (peta provinsi)
        const geoResponse = await fetch('/data/indonesia-provinces.json');
        const geoJsonData = await geoResponse.json();

        let combinedFeatures = geoJsonData.features;

        // 2. [MODIFIKASI] Hanya ambil dan gabungkan data emisi jika sumbernya SIPONGI
        if (selectedDataSource === 'SIPONGI KEMENHUT') {
            const emissionResponse = await fetch('/data/emisiCO2.json');
            const emissionData = await emissionResponse.json();
            
            combinedFeatures = geoJsonData.features.map(feature => {
                const geoProvinceName = feature.properties.PROVINSI?.toUpperCase().trim();
                const emissionsForProvince = emissionData[geoProvinceName];
                return {
                    ...feature,
                    properties: { 
                        ...feature.properties, 
                        emissions: emissionsForProvince || {}
                    },
                };
            });
        } else {
            // 3. [BARU] Jika sumber data lain dipilih, kosongkan data emisi
            // Ini akan membuat semua provinsi berwarna abu-abu (tidak ada data)
            combinedFeatures = geoJsonData.features.map(feature => ({
                ...feature,
                properties: {
                    ...feature.properties,
                    emissions: {} // Objek emisi kosong
                }
            }));
        }

        setGeoData({ ...geoJsonData, features: combinedFeatures });

      } catch (error) {
        console.error("Gagal memuat atau memproses data peta:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  // [MODIFIKASI] Tambahkan selectedDataSource sebagai dependency
  }, [selectedDataSource]); 

  // Fungsi untuk styling GeoJSON
  const style = (feature) => {
    // Logika ini tetap sama, karena akan otomatis menangani data kosong
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
        const { PROVINSI, emissions } = feature.properties;
        const emissionValue = emissions?.[selectedYear];
        
        let contentText = 'Data tidak tersedia';

        // [MODIFIKASI] Tampilkan data emisi hanya jika sumbernya SIPONGI
        if (selectedDataSource === 'SIPONGI KEMENHUT' && emissionValue !== null && emissionValue !== undefined) {
            contentText = `Emisi ${selectedYear}: ${emissionValue.toLocaleString('id-ID')} ton CO₂e`;
        }
        
        layer.bindPopup(`<strong>${PROVINSI}</strong><br/>${contentText}`);
        
        layer.on({
            mouseover: (e) => e.target.setStyle({ weight: 2.5, color: '#333', fillOpacity: 1 }),
            mouseout: (e) => layer.setStyle(style(feature)),
        });
    }
  };

  if (loading) {
    return <div className="h-[550px] bg-zinc-200 rounded-lg animate-pulse flex items-center justify-center"><p className="text-zinc-500">Memuat Peta...</p></div>;
  }

  return (
    <div className="relative">
        <MapContainer center={[-2.5, 118]} zoom={5} style={{ height: '550px', width: '100%' }} className="rounded-lg shadow-lg z-0" zoomControl={false}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {/* [MODIFIKASI] Tambahkan selectedDataSource ke key untuk memicu render ulang */}
          {geoData && <GeoJSON key={`${selectedYear}-${selectedDataSource}`} data={geoData} style={style} onEachFeature={onEachFeature} />}
        </MapContainer>
        
        {/* [MODIFIKASI] Wrapper untuk filter tahun dan sumber data */}
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-md z-10 flex items-center gap-4">
            {/* Filter Tahun */}
            <div className="flex items-center gap-2">
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
            
            {/* [BARU] Filter Sumber Data */}
            <div className="flex items-center gap-2">
                <label htmlFor="source-select" className="text-sm font-semibold text-zinc-700">Sumber Data:</label>
                <select 
                    id="source-select"
                    value={selectedDataSource}
                    onChange={(e) => setSelectedDataSource(e.target.value)}
                    className="bg-white border border-zinc-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#22543d]"
                >
                    {availableDataSources.map(source => <option key={source} value={source}>{source}</option>)}
                </select>
            </div>
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