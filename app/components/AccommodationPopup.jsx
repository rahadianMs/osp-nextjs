// Ganti seluruh isi file app/components/AccommodationPopup.jsx dengan kode ini

"use client";
import React from "react";
// Impor ikon yang kita butuhkan
import {
  BoltIcon,
  TrashCanIcon,
  FireIcon,
  DocumentChartBarIcon,
} from "./Icons";

/**
 * [BARU] Komponen 1: Kartu Utama untuk TOTAL
 * Desain "clean" dengan latar belakang terang dan aksen warna.
 */
const TotalStatCard = ({ value }) => (
  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
    {/* [MODIFIKASI] space-x-3 diubah menjadi space-x-4 */}
    <div className="flex items-center space-x-4 mb-1">
      <div className="flex-shrink-0 w-5 h-5 text-green-700">
        <DocumentChartBarIcon />
      </div>
      <span className="text-sm font-semibold text-green-800">
        Total Emisi
      </span>
    </div>
    <p className="text-2xl font-bold text-green-700">
      {value.toLocaleString("id-ID")}
      <span className="text-sm font-normal text-green-600 ml-1">kgCO₂e</span>
    </p>
  </div>
);

/**
 * [BARU] Komponen 2: Baris Sederhana untuk SCOPES
 * Ini menggantikan kotak-kotak persegi untuk tampilan yang lebih bersih.
 */
const ScopeStatRow = ({ title, value, icon, colorClass }) => (
  <div className={`flex justify-between items-center ${colorClass}`}>
    {/* Kiri: Ikon dan Judul */}
    {/* [MODIFIKASI] space-x-3 diubah menjadi space-x-4 */}
    <div className="flex items-center space-x-5">
      <div className="flex-shrink-0 w-5 h-5">{icon}</div>
      <span className="text-sm font-medium text-slate-600">{title}</span>
    </div>
    {/* Kanan: Nilai (dengan unit) */}
    <p className="text-sm font-semibold text-slate-800">
      {value.toLocaleString("id-ID")}
      <span className="text-xs font-normal text-slate-500 ml-1">kgCO₂e</span>
    </p>
  </div>
);

/**
 * Ini adalah komponen Popup utama dengan layout "clean" dan "professional".
 */
function AccommodationPopup({ nama, dataForYear, properties, onDetailClick }) {
  const handleDetailClick = (e) => {
    e.stopPropagation();
    onDetailClick(properties);
  };

  return (
    // Lebar 240px untuk memberi ruang bernapas
    <div className="flex flex-col space-y-3 p-2" style={{ width: "240px" }}>
      {/* Nama Akomodasi */}
      <h3 className="font-bold text-base text-slate-800">{nama}</h3>

      {/* Tampilkan data HANYA jika dataForYear tidak null */}
      {dataForYear ? (
        <>
          {/* 1. Total Emisi (Kartu Utama) */}
          <TotalStatCard value={dataForYear.totalEmisi} />

          {/* 2. Daftar Rincian Scopes */}
          <div className="flex flex-col space-y-2 pt-1">
            <ScopeStatRow
              title="Scope 1"
              value={dataForYear.scope1.total}
              icon={<FireIcon />}
              colorClass="text-orange-500" // Warna hanya pada ikon/teks
            />
            <ScopeStatRow
              title="Scope 2"
              value={dataForYear.scope2.total}
              icon={<BoltIcon />}
              colorClass="text-amber-500"
            />
            <ScopeStatRow
              title="Scope 3"
              value={dataForYear.scope3.total}
              icon={<TrashCanIcon />}
              colorClass="text-red-500"
            />
          </div>

          {/* 3. Tombol Aksi (sekarang lebih menonjol) */}
          <button
            onClick={handleDetailClick}
            className="w-full text-center px-2 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs font-medium"
          >
            Lihat Detail
          </button>
        </>
      ) : (
        // Tampilan jika data null
        <p className="text-xs text-slate-500 italic mt-1">
          Data emisi untuk tahun ini tidak tersedia.
        </p>
      )}
    </div>
  );
}

export default AccommodationPopup;