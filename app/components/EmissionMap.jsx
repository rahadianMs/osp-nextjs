// Ganti seluruh isi file app/components/EmissionMap.jsx dengan kode ini

"use client";

// [MODIFIKASI] Pastikan useState ada di sini
import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Impor Modal dan Popup
import AccommodationPopup from './AccommodationPopup';
import AccommodationDetailModal from './AccommodationDetailModal'; // Impor Modal

// Ikon Pin Peta (dari file baru Anda)
const accommodationIcon = new L.DivIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E31A1C" class="w-8 h-8 drop-shadow-lg">
           <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
         </svg>`,
  className: '', 
  iconSize: [32, 32], 
  iconAnchor: [16, 32] 
});

const EmissionMap = () => {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedDataSource, setSelectedDataSource] = useState('Akomodasi'); 
  const [accommodationData, setAccommodationData] = useState(null);

  // State untuk mengelola Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccommodationProps, setSelectedAccommodationProps] = useState(null);

  // [BARU - SOLUSI 2] State untuk menyimpan referensi ke map instance
  const [mapRef, setMapRef] = useState(null);

  const availableYears = ['2025', '2024', '2023', '2022'];
  const availableDataSources = ['Akomodasi', 'SIPONGI KEMENHUT', 'Operator Jasa Perjalanan', 'Pengelola Atraksi Wisata'];

  const getColor = (value) => {
    if (value === null || value === undefined) return '#d1d5db'; 
    return value > 10000000 ? '#085839'
         : value > 5000000  ? '#1a7553'
         : value > 1000000  ? '#2b926d'
         : value > 500000   ? '#43b089'
         : value > 100000   ? '#62cea5'
         : value > 10000    ? '#89e0b9'
         : '#b8f2d5';
  };
  
  // useEffect untuk memuat data (tidak berubah)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const geoResponse = await fetch('/data/indonesia-provinces.json');
        const geoJsonData = await geoResponse.json();

        const accomResponse = await fetch('/data/akomodasi.json');
        const accomData = await accomResponse.json();
        setAccommodationData(accomData);

        let combinedFeatures = geoJsonData.features;
        if (selectedDataSource === 'SIPONGI KEMENHUT') {
            const emissionResponse = await fetch('/data/emisiCO2.json');
            const emissionData = await emissionResponse.json();
            
            combinedFeatures = geoJsonData.features.map(feature => {
                const geoProvinceName = feature.properties.PROVINSI?.toUpperCase().trim();
                const emissionsForProvince = emissionData[geoProvinceName];
                return {
                    ...feature,
                    properties: { ...feature.properties, emissions: emissionsForProvince || {} },
                };
            });
        } else {
            combinedFeatures = geoJsonData.features.map(feature => ({
                ...feature,
                properties: { ...feature.properties, emissions: {} }
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
  }, [selectedDataSource]);

  // [BARU - SOLUSI 2] useEffect untuk menambahkan event listener pada map
  useEffect(() => {
    // Pastikan mapRef sudah ada (map sudah di-render)
    if (mapRef) {
      // Definisikan fungsi yang akan dipanggil saat zoom dimulai
      const handleZoomStart = () => {
        mapRef.closePopup(); // Ini akan menutup popup apapun yang sedang terbuka
      };

      // Tambahkan listener ke map instance
      mapRef.on('zoomstart', handleZoomStart);

      // Fungsi cleanup: Hapus listener saat komponen di-unmount
      return () => {
        mapRef.off('zoomstart', handleZoomStart);
      };
    }
  }, [mapRef]); // Efek ini hanya akan berjalan ketika mapRef sudah di-set


  // Handler untuk membuka dan menutup Modal (tidak berubah)
  const handleOpenDetailModal = (properties) => {
    setSelectedAccommodationProps(properties); // Simpan properties dari feature
    setIsModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsModalOpen(false);
    setSelectedAccommodationProps(null);
  };

  // Fungsi style (tidak berubah)
  const style = (feature) => {
    if (selectedDataSource === 'Akomodasi') {
      return { 
        opacity: 0, 
        fillOpacity: 0, 
        weight: 0, 
        interactive: false 
      };
    }
    const emissionValue = feature.properties.emissions?.[selectedYear];
    return {
      fillColor: getColor(emissionValue),
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.8,
      interactive: true 
    };
  };

  // Fungsi onEachFeature (tidak berubah)
  const onEachFeature = (feature, layer) => {
    if (selectedDataSource !== 'Akomodasi' && feature.properties) {
        const { PROVINSI, emissions } = feature.properties;
        const emissionValue = emissions?.[selectedYear];
        
        let contentText = 'Data tidak tersedia';
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

  // Bungkus dengan div 'relative'
  return (
    <div className="relative">
        <MapContainer 
          // [BARU - SOLUSI 2] Tambahkan prop 'ref' di sini
          ref={setMapRef} 
          center={[-8.409518, 115.188919]} 
          zoom={9} 
          style={{ height: '550px', width: '100%' }} 
          className="rounded-lg shadow-lg z-0" 
          zoomControl={false}
        >
          
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Layer 1: Peta Provinsi */}
          {geoData && (
            <GeoJSON 
              key={`${selectedYear}-${selectedDataSource}-provinces`}
              data={geoData} 
              style={style} 
              onEachFeature={onEachFeature} 
            />
          )}

          {/* Layer 2: Titik Marker (HANYA tampil jika Akomodasi) */}
          {accommodationData && selectedDataSource === 'Akomodasi' && (
            accommodationData.features.map(feature => {
              const coords = feature.geometry.coordinates;
              const position = [coords[1], coords[0]]; 
              
              const properties = feature.properties;
              const dataForYear = properties.data ? properties.data[selectedYear] : null;

              return (
                <Marker 
                  key={properties.Name} 
                  position={position}
                  icon={accommodationIcon}
                >
                  <Popup>
                    <div className="custom-leaflet-popup">
                      <AccommodationPopup 
                        nama={properties.Name} 
                        dataForYear={dataForYear}
                        properties={properties} 
                        onDetailClick={handleOpenDetailModal}
                      />
                    </div>
                  </Popup>
                </Marker>
              );
            })
          )}
        </MapContainer>
        
        {/* Kontrol Filter (tidak berubah) */}
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-md z-10 flex items-center gap-4">
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

        {/* Legenda (tidak berubah) */}
        {selectedDataSource !== 'Akomodasi' && (
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
        )}

        {/* Render Modal (tidak berubah) */}
        {isModalOpen && selectedAccommodationProps && (
          <AccommodationDetailModal
            properties={selectedAccommodationProps}
            selectedYear={selectedYear}
            onClose={handleCloseDetailModal}
          />
        )}
    </div>
  );
};

export default EmissionMap;