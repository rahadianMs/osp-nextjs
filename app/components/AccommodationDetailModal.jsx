// Ganti seluruh isi file app/components/AccommodationDetailModal.jsx dengan ini

"use client";
// Impor useState dan useEffect untuk animasi
import React, { useState, useEffect } from "react";
import {
  BoltIcon,
  TransportIcon,
  TrashCanIcon,
  FireIcon,
} from "./Icons";

// Komponen Kartu Detail Emisi (Tidak berubah)
const DetailEmisiCard = ({ title, value, unit, icon, colorClass }) => (
  <div className="bg-white p-3 rounded-lg border shadow-sm flex items-center gap-3">
    <div
      className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${colorClass.bg}`}
    >
      <div className={colorClass.text}>{icon}</div>
    </div>
    <div>
      <p className="text-xs text-slate-500">{title}</p>
      <p className="text-base font-bold text-slate-800">
        {value} <span className="text-sm font-normal">{unit}</span>
      </p>
    </div>
  </div>
);

// Komponen Section per Scope (Tidak berubah)
const ScopeSection = ({ title, totalValue, children, layout = "grid" }) => {
  const layoutClass =
    layout === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 gap-3"
      : "flex flex-col space-y-3";

  return (
    <div className="bg-slate-50 p-4 rounded-lg border h-full">
      <h3 className="text-lg font-semibold text-slate-700 mb-3">
        {title}: {totalValue.toLocaleString("id-ID")} kgCO₂e
      </h3>
      <div className={layoutClass}>{children}</div>
    </div>
  );
};

export default function AccommodationDetailModal({
  properties,
  selectedYear,
  onClose,
}) {
  const yearData = properties.data ? properties.data[selectedYear] : null;
  const namaAkomodasi = properties.Name;

  // State untuk mengelola animasi fade-in/out
  const [show, setShow] = useState(false);

  // Efek untuk memicu animasi 'fade-in'
  useEffect(() => {
    setShow(true);
  }, []);

  // Fungsi kustom untuk 'fade-out' sebelum menutup
  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 200); // Durasi ini HARUS sama dengan 'duration-200'
  };

  return (
    // [MODIFIKASI] Latar Belakang (Overlay)
    // Kelas-kelas ini SEKARANG AKAN BERFUNGSI setelah perbaikan globals.css
    <div
      className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black backdrop-blur-md
        transition-opacity duration-200 ease-out
        ${show ? "bg-opacity-30" : "bg-opacity-0"}`} // <-- Transparan 30%
      onClick={handleClose}
    >
      {/* [MODIFIKASI] Konten Modal (Panel) */}
      <div
        className={`bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative
          transition-all duration-200 ease-out
          ${show ? "scale-100 opacity-100" : "scale-95 opacity-0"}`} // <-- Efek Pop-up
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex justify-between items-center pb-4 border-b mb-4">
          <h2 className="text-2xl font-bold text-slate-800">{namaAkomodasi}</h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600"
            title="Tutup"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Isi (Body) Modal (Layout sudah benar dari langkah sebelumnya) */}
        {yearData ? (
          <div className="flex flex-col space-y-4">
            <div className="bg-green-600 text-white p-4 rounded-lg text-center">
              <p className="text-sm uppercase tracking-wider">
                Total Emisi ({selectedYear})
              </p>
              <p className="text-3xl font-bold">
                {yearData.totalEmisi.toLocaleString("id-ID")} kgCO₂e
              </p>
            </div>

            <ScopeSection title="Scope 1" totalValue={yearData.scope1.total}>
              <DetailEmisiCard
                title="Transportasi"
                value={yearData.scope1.transportasi.toLocaleString("id-ID")}
                unit="kgCO₂e"
                icon={<TransportIcon className="w-6 h-6" />}
                colorClass={{ bg: "bg-blue-100", text: "text-blue-600" }}
              />
              <DetailEmisiCard
                title="Energi Non-Listrik"
                value={yearData.scope1.energiNonListrik.toLocaleString("id-ID")}
                unit="kgCO₂e"
                icon={<FireIcon className="w-6 h-6" />}
                colorClass={{ bg: "bg-orange-100", text: "text-orange-600" }}
              />
            </ScopeSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ScopeSection
                title="Scope 2"
                totalValue={yearData.scope2.total}
                layout="stack"
              >
                <DetailEmisiCard
                  title="Listrik (PLN)"
                  value={yearData.scope2.total.toLocaleString("id-ID")}
                  unit="kgCO₂e"
                  icon={<BoltIcon className="w-6 h-6" />}
                  colorClass={{ bg: "bg-amber-100", text: "text-amber-600" }}
                />
              </ScopeSection>

              <ScopeSection
                title="Scope 3"
                totalValue={yearData.scope3.total}
                layout="stack"
              >
                <DetailEmisiCard
                  title="Limbah, dll"
                  value={yearData.scope3.total.toLocaleString("id-ID")}
                  unit="kgCO₂e"
                  icon={<TrashCanIcon className="w-6 h-6" />}
                  colorClass={{ bg: "bg-red-100", text: "text-red-600" }}
                />
              </ScopeSection>
            </div>
          </div>
        ) : (
          <div className="text-center p-10">
            <p className="text-lg text-slate-500 italic">
              Data emisi untuk tahun {selectedYear} tidak tersedia.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}