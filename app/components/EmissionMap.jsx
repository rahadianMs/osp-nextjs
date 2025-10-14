"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const EmissionMap = () => {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2025');
  const availableYears = ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];

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

        const emissionResponse = await fetch('/data/emisiCO2.csv');
        const csvText = await emissionResponse.text();
        
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const emissionDataByYear = {};

        for (let i = 1; i < lines.length; i++) {
          const currentline = lines[i].split(',');
          let provinceName = currentline[0].replace(/"/g, '').toUpperCase().trim();
          
          headers.forEach((year, index) => {
            if (availableYears.includes(year)) {
              if (!emissionDataByYear[year]) emissionDataByYear[year] = {};
              const emissionValue = parseFloat(currentline[index] || "0");
              emissionDataByYear[year][provinceName] = isNaN(emissionValue) ? 0 : emissionValue;
            }
          });
        }

        const combinedFeatures = geoJsonData.features.map(feature => {
            let geoProvinceName = feature.properties.Propinsi?.toUpperCase().trim();
            
            let emissionsByYear = {};
            availableYears.forEach(year => {
                emissionsByYear[year] = emissionDataByYear[year]?.[geoProvinceName];
            });

            return {
                ...feature,
                properties: { ...feature.properties, emissions: emissionsByYear },
            };
        });

        setGeoData({ ...geoJsonData, features: combinedFeatures });

      } catch (error) {
        console.error("Gagal memuat atau memproses data peta:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
        const { Propinsi, emissions } = feature.properties;
        const emissionValue = emissions?.[selectedYear];
        const emissionText = emissionValue !== null && emissionValue !== undefined 
            ? `${emissionValue.toLocaleString('id-ID')} ton CO₂e` 
            : 'Data tidak tersedia';
        layer.bindPopup(`<strong>${Propinsi}</strong><br/>Emisi ${selectedYear}: ${emissionText}`);
        
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
