import React from 'react';
import { ChartPieIcon, FireIcon, BoltIcon, TransportIcon } from './Icons';

function AccommodationPopup({ nama, data, selectedYear }) {
  
  const yearData = data ? data[selectedYear] : null;

  // [MODIFIKASI] Ubah div utama untuk menambahkan border, shadow, dan background
  return (
    <div className="w-72 font-sans bg-white rounded-lg border border-zinc-200 p-3 shadow-lg">
      {!yearData ? (
        <>
          <h3 className="text-lg font-bold mb-2">{nama}</h3>
          <p className="text-gray-600">Data emisi tidak tersedia untuk tahun {selectedYear}.</p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-bold mb-3 text-gray-800">{nama}</h3>
          
          {/* Total Emisi */}
          <div className="flex items-center p-2 bg-gray-50 rounded-lg mb-3 shadow-sm">
            <div className="flex-shrink-0 p-2 bg-blue-100 text-blue-600 rounded-lg">
              <ChartPieIcon />
            </div>
            <div className="ml-3">
              <div className="text-xs text-gray-500">Total Emisi ({selectedYear})</div>
              <div className="text-lg font-bold text-blue-700">
                {yearData.totalEmisi.toLocaleString('id-ID')} kgCO2e
              </div>
            </div>
          </div>

          {/* Detail Scope */}
          <div className="space-y-2 text-sm">
            {/* Scope 1 */}
            <div className="flex items-start p-1">
              <div className="flex-shrink-0 w-8 h-8 text-red-600 pt-1">
                <FireIcon />
              </div>
              <div className="ml-2 w-full">
                <div className="font-semibold text-gray-700">Scope (Cakupan) 1: {yearData.scope1.total.toLocaleString('id-ID')} kgCO2e</div>
                <div className="pl-2 border-l-2 border-gray-200 mt-1 space-y-1">
                  <div className="flex justify-between">
                    <span>Transportasi:</span>
                    <span>{yearData.scope1.transportasi.toLocaleString('id-ID')} kgCO2e</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Energi non-listrik:</span>
                    <span>{yearData.scope1.energiNonListrik.toLocaleString('id-ID')} kgCO2e</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Scope 2 */}
            <div className="flex items-start p-1">
              <div className="flex-shrink-0 w-8 h-8 text-yellow-500 pt-1">
                <BoltIcon />
              </div>
              <div className="ml-2 w-full">
                <div className="font-semibold text-gray-700">Scope (Cakupan) 2: {yearData.scope2.total.toLocaleString('id-ID')} kgCO2e</div>
                <div className="pl-2 border-l-2 border-gray-200 mt-1 space-y-1">
                  <div className="flex justify-between">
                    <span>Listrik (PLN):</span>
                    <span>{yearData.scope2.total.toLocaleString('id-ID')} kgCO2e</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Scope 3 */}
            <div className="flex items-start p-1">
              <div className="flex-shrink-0 w-8 h-8 text-gray-600 pt-1">
                <TransportIcon className="w-8 h-8" />
              </div>
              <div className="ml-2 w-full">
                <div className="font-semibold text-gray-700">Scope (Cakupan) 3: {yearData.scope3.total.toLocaleString('id-ID')} kgCO2e</div>
                <div className="pl-2 border-l-2 border-gray-200 mt-1 space-y-1">
                  <div className="flex justify-between">
                    <span>Limbah, dll:</span>
                    <span>{yearData.scope3.total.toLocaleString('id-ID')} kgCO2e</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AccommodationPopup;