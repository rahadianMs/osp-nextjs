// Ganti seluruh isi file app/components/AccommodationPopup.jsx dengan kode ini

"use client";
import React from "react";
// Impor ikon yang kita butuhkan (sudah benar)
import { BoltIcon, TrashCanIcon, FireIcon, ChartPieIcon } from "./Icons";

/**
 * [BARU] Komponen kartu persegi panjang berwarna solid.
 * Didesain untuk layout list vertikal yang ringkas.
 */
const ColorStripeCard = ({ title, value, icon, bgColor }) => (
  <div
    className={`rounded-lg p-2.5 text-white shadow ${bgColor} flex items-center justify-between`}
  >
    {/* Kiri: Ikon dan Judul */}
    <div className="flex items-center space-x-2">
      <div className="flex-shrink-0">{icon}</div>
      <span className="text-sm font-medium">{title}</span>
    </div>
    {/* Kanan: Nilai */}
    <p className="text-sm font-bold">
      {value.toLocaleString("id-ID")} kgCO₂e
    </p>
  </div>
);

/**
 * Ini adalah komponen Popup yang telah diperbarui dengan UI Card persegi panjang.
 */
function AccommodationPopup({ nama, dataForYear, properties, onDetailClick }) {
  const handleDetailClick = (e) => {
    e.stopPropagation();
    onDetailClick(properties);
  };

  return (
    // [MODIFIKASI] Kita sesuaikan lebar agar pas untuk kartu persegi panjang
    <div className="flex flex-col space-y-2 p-1" style={{ width: "240px" }}>
      {/* Nama Akomodasi */}
      <h3 className="font-bold text-base text-slate-800 mb-1">{nama}</h3>

      {/* Tampilkan data HANYA jika dataForYear tidak null */}
      {dataForYear ? (
        <>
          {/* [BARU] Layout list vertikal untuk 4 kartu */}
          <div className="flex flex-col space-y-1.5">
            <ColorStripeCard
              title="Total Emisi"
              value={dataForYear.totalEmisi}
              icon={<ChartPieIcon className="w-4 h-4" />}
              bgColor="bg-green-600" // Warna Total
            />
            <ColorStripeCard
              title="Scope 1"
              value={dataForYear.scope1.total}
              icon={<FireIcon className="w-4 h-4" />}
              bgColor="bg-orange-500" // Warna Scope 1
            />
            <ColorStripeCard
              title="Scope 2"
              value={dataForYear.scope2.total}
              icon={<BoltIcon className="w-4 h-4" />}
              bgColor="bg-amber-500" // Warna Scope 2
            />
            <ColorStripeCard
              title="Scope 3"
              value={dataForYear.scope3.total}
              icon={<TrashCanIcon className="w-4 h-4" />}
              bgColor="bg-red-500" // Warna Scope 3
            />
          </div>

          {/* Tombol Lihat Detail (Tetap sama) */}
          <button
            onClick={handleDetailClick}
            className="w-full text-center px-2 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs font-medium mt-2"
          >
            Lihat Detail
          </button>
        </>
      ) : (
        // Tampilan jika data null (Tetap sama)
        <p className="text-xs text-slate-500 italic">
          Data emisi untuk tahun ini tidak tersedia.
        </p>
      )}
    </div>
  );
}

export default AccommodationPopup;