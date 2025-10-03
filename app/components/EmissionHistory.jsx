// Komponen ini tidak lagi mengambil datanya sendiri.
// Sekarang hanya bertugas menampilkan data yang diterima via props.

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
  </svg>
  );
  
  export default function EmissionHistory({
  entries,
  loading,
  error,
  onDeleteClick,
  showDeleteConfirm,
  onCancelDelete,
  onConfirmDelete,
  selectedEntry
  }) {
  
  if (loading) {
      return (
          <div>
              <h2 className="text-2xl font-bold mb-6">Riwayat Laporan</h2>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm border">Memuat riwayat...</div>
          </div>
      );
  }
  
  if (error) {
      return (
          <div>
              <h2 className="text-2xl font-bold mb-6">Riwayat Laporan</h2>
              <div className="text-center p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>
          </div>
      );
  }
  
  return (
      <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Riwayat Laporan</h2>
          {entries.length === 0 ? (
              <p className="text-slate-500 bg-white p-6 rounded-lg shadow-sm border">Anda belum memiliki laporan. Buat laporan baru di atas untuk melihat riwayat di sini.</p>
          ) : (
              <div className="space-y-4">
                  {entries.map(entry => (
                      <div key={entry.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center transition-all hover:shadow-md">
                          <div>
                              <h3 className="font-bold text-lg text-slate-800">{entry.calculation_title || 'Laporan Tanpa Judul'}</h3>
                              <p className="text-sm text-slate-500">
                                  Disimpan pada: {new Date(entry.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                          </div>
                          <div className="flex items-center gap-4">
                              <div className="text-right">
                                  <p className="text-xl font-bold text-[#348567]">{entry.total_co2e_kg.toFixed(2)}</p>
                                  <p className="text-sm text-slate-500">kg CO2e</p>
                              </div>
                              <button
                                  onClick={() => onDeleteClick(entry)}
                                  className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                                  aria-label="Hapus entri"
                              >
                                  <TrashIcon />
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          )}
  
          {/* Modal Konfirmasi Hapus */}
          {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
                      <h2 className="text-xl font-bold mb-4">Konfirmasi Hapus</h2>
                      <p className="text-slate-600 mb-6">Apakah Anda yakin ingin menghapus laporan <span className="font-semibold">"{selectedEntry?.calculation_title}"</span>? Tindakan ini tidak dapat dibatalkan.</p>
                      <div className="flex justify-end gap-4">
                          <button
                              onClick={onCancelDelete}
                              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                          >
                              Batal
                          </button>
                          <button
                              onClick={onConfirmDelete}
                              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                          >
                              Ya, Hapus
                          </button>
                      </div>
                  </div>
              </div>
          )}
      </div>
  );
  
  }