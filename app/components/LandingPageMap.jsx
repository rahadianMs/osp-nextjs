"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// --- 1. DATA DUMMY PESERTA (SEBARAN DI KOTA BESAR) ---
const PARTICIPANT_DATA = [
    // Kategori: Akomodasi (Biru)
    { id: 1, name: "Hotel Indonesia Kempinski", type: "accommodation", lat: -6.1972, lng: 106.8215, city: "Jakarta" },
    { id: 2, name: "The Apurva Kempinski", type: "accommodation", lat: -8.8105, lng: 115.2163, city: "Bali" },
    { id: 3, name: "JW Marriott Medan", type: "accommodation", lat: 3.5929, lng: 98.6760, city: "Medan" },
    { id: 4, name: "Plataran Komodo Resort", type: "accommodation", lat: -8.4905, lng: 119.8773, city: "Labuan Bajo" },
    { id: 5, name: "Hyatt Regency Yogyakarta", type: "accommodation", lat: -7.7399, lng: 110.3725, city: "Yogyakarta" },
    { id: 6, name: "Raja Ampat Dive Lodge", type: "accommodation", lat: -0.5636, lng: 130.6430, city: "Raja Ampat" },
    { id: 7, name: "Sheraton Makassar", type: "accommodation", lat: -5.1477, lng: 119.4328, city: "Makassar" },

    // Kategori: Operator Jasa Perjalanan (Kuning/Oranye)
    { id: 8, name: "Panorama JTB Tours", type: "travel", lat: -6.1751, lng: 106.8650, city: "Jakarta" },
    { id: 9, name: "Bali Res Centre", type: "travel", lat: -8.6705, lng: 115.2126, city: "Bali" },
    { id: 10, name: "Flores Adventure Tours", type: "travel", lat: -8.5069, lng: 119.8835, city: "Labuan Bajo" },
    { id: 11, name: "Java Tourism Yogyakarta", type: "travel", lat: -7.8014, lng: 110.3647, city: "Yogyakarta" },
    { id: 12, name: "Sumatra EcoTravel", type: "travel", lat: 3.5852, lng: 98.6722, city: "Medan" },

    // Kategori: Pengelola Atraksi Wisata (Hijau)
    { id: 13, name: "Taman Mini Indonesia Indah", type: "attraction", lat: -6.3024, lng: 106.8952, city: "Jakarta" },
    { id: 14, name: "Candi Borobudur Park", type: "attraction", lat: -7.6079, lng: 110.2038, city: "Magelang" },
    { id: 15, name: "Bali Safari & Marine Park", type: "attraction", lat: -8.5873, lng: 115.3413, city: "Bali" },
    { id: 16, name: "Taman Nasional Komodo", type: "attraction", lat: -8.5286, lng: 119.4870, city: "Labuan Bajo" },
    { id: 17, name: "Jatim Park Group", type: "attraction", lat: -7.8836, lng: 112.5254, city: "Batu, Malang" },
    { id: 18, name: "Garuda Wisnu Kencana", type: "attraction", lat: -8.8104, lng: 115.1676, city: "Bali" }
];

// Konfigurasi Warna & Label
const CATEGORY_CONFIG = {
    accommodation: { color: '#3b82f6', label: 'Akomodasi' },                // Biru Terang
    travel: { color: '#f59e0b', label: 'Operator Jasa Perjalanan' },         // Amber/Oranye
    attraction: { color: '#10b981', label: 'Pengelola Atraksi Wisata' }      // Hijau Emerald
};

const LandingPageMap = () => {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const YEAR = '2024';

  // Fungsi Warna Choropleth (Emisi)
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
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const geoResponse = await fetch('/data/indonesia-provinces.json');
        const geoJsonData = await geoResponse.json();

        const emissionResponse = await fetch('/data/emisiCO2.json');
        const emissionData = await emissionResponse.json();
        
        const combinedFeatures = geoJsonData.features.map(feature => {
            const geoProvinceName = feature.properties.PROVINSI?.toUpperCase().trim();
            const emissionsForProvince = emissionData[geoProvinceName];
            return {
                ...feature,
                properties: { ...feature.properties, emissions: emissionsForProvince || {} },
            };
        });

        setGeoData({ ...geoJsonData, features: combinedFeatures });

      } catch (error) {
        console.error("Gagal memuat data peta landing page:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Style GeoJSON (Provinsi)
  const style = (feature) => {
    const emissionValue = feature.properties.emissions?.[YEAR];
    return {
      fillColor: getColor(emissionValue),
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.6, 
      interactive: true 
    };
  };

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
        const { PROVINSI, emissions } = feature.properties;
        const emissionValue = emissions?.[YEAR];
        
        let contentText = 'Data tidak tersedia';
        if (emissionValue !== null && emissionValue !== undefined) {
            contentText = `Emisi 2024: <strong>${emissionValue.toLocaleString('id-ID')}</strong> ton CO₂e`;
        }
        
        // Tooltip sederhana saat hover di provinsi
        layer.bindTooltip(`${PROVINSI}`, {
            permanent: false,
            direction: "center",
            className: "bg-transparent border-0 font-bold text-slate-700 text-xs shadow-none"
        });
        
        layer.on({
            mouseover: (e) => {
                e.target.setStyle({ weight: 2, color: '#333', fillOpacity: 0.8 });
            },
            mouseout: (e) => {
                layer.setStyle(style(feature));
            },
        });
    }
  };

  if (loading) {
    return <div className="h-[500px] bg-zinc-100 rounded-xl animate-pulse flex items-center justify-center text-zinc-400 text-sm">Memuat Peta Sebaran...</div>;
  }

  return (
    <div className="relative h-[550px] w-full rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-slate-50 outline-none focus:outline-none">
        <style jsx global>{`
            .leaflet-container {
                background: #f8fafc; 
                outline: none !important;
            }
            .leaflet-interactive:focus {
                outline: none !important;
            }
        `}</style>
        <MapContainer 
          center={[-2.5, 118]} 
          zoom={5} 
          scrollWheelZoom={false} 
          doubleClickZoom={true}
          dragging={true} 
          zoomControl={true} 
          // MODIFIKASI: Menambahkan outline: 'none' di style
          style={{ height: '100%', width: '100%', outline: 'none' }} 
          className="outline-none focus:outline-none"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" 
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Layer Provinsi (Latar Belakang Emisi) */}
          {geoData && (
            <GeoJSON 
              data={geoData} 
              style={style} 
              onEachFeature={onEachFeature} 
            />
          )}

          {/* --- 2. LAYER POIN PESERTA --- */}
          {PARTICIPANT_DATA.map((item) => (
            <CircleMarker 
                key={item.id}
                center={[item.lat, item.lng]}
                pathOptions={{ 
                    color: 'white', 
                    weight: 2, 
                    fillColor: CATEGORY_CONFIG[item.type].color, 
                    fillOpacity: 0.9 
                }}
                radius={6} // Ukuran titik
            >
                <Popup>
                    <div className="text-center min-w-[150px]">
                        <strong className="block text-sm text-slate-800 mb-1">{item.name}</strong>
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded-full text-white mb-1" style={{backgroundColor: CATEGORY_CONFIG[item.type].color}}>
                            {CATEGORY_CONFIG[item.type].label}
                        </span>
                        <p className="text-xs text-slate-500">{item.city}</p>
                    </div>
                </Popup>
                <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                    {item.name}
                </Tooltip>
            </CircleMarker>
          ))}

        </MapContainer>

        {/* --- 3. LEGENDA (DIPERBARUI) --- */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-md border border-slate-100 z-[400] max-w-[220px]">
            {/* Legenda Emisi */}
            <div className="mb-4">
                <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-500 mb-2">Emisi Provinsi (Ton CO₂e)</h4>
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{backgroundColor: getColor(15000000)}}></div>
                        <span className="text-[10px] text-slate-600">Tinggi ({'>'} 10jt)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{backgroundColor: getColor(5000000)}}></div>
                        <span className="text-[10px] text-slate-600">Sedang (1jt - 10jt)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{backgroundColor: getColor(100000)}}></div>
                        <span className="text-[10px] text-slate-600">Rendah ({'<'} 1jt)</span>
                    </div>
                </div>
            </div>

            {/* Legenda Peserta (BARU) */}
            <div className="pt-3 border-t border-slate-200">
                <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-500 mb-2">Kategori Peserta</h4>
                <div className="space-y-1.5">
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                        <div key={key} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border border-slate-200 shadow-sm" style={{backgroundColor: config.color}}></div>
                            <span className="text-[10px] text-slate-600">{config.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default LandingPageMap;