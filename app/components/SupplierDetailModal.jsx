// app/components/SupplierDetailModal.jsx
"use client";

import { 
    DocumentTextIcon, 
    BookOpenIcon, 
    // MapIcon sudah dihapus karena tidak dipakai
    PencilIcon,
    EyeIcon // Menggunakan EyeIcon untuk "Cakupan Operasi"
} from './Icons.jsx';

// Komponen kecil untuk menampilkan baris info di modal
const InfoRow = ({ icon, label, children }) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-slate-500 flex items-center gap-2">
            {icon}
            {label}
        </dt>
        <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">
            {children}
        </dd>
    </div>
);

export default function SupplierDetailModal({ supplier, onClose }) {
    if (!supplier) return null;

    return (
        // Latar belakang overlay
        <div 
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity"
        >
            {/* Konten Modal */}
            <div
                onClick={(e) => e.stopPropagation()} // Mencegah modal tertutup saat diklik di dalam
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                {/* Header Modal */}
                <div className="p-6 border-b border-slate-200">
                    <h3 className="text-2xl font-bold text-slate-800">
                        {supplier.provider_name}
                    </h3>
                    <p className="text-base text-slate-600 mt-1">
                        {supplier.product_type}
                    </p>
                </div>

                {/* Body Modal - Daftar Detail */}
                <div className="p-6">
                    <dl className="divide-y divide-slate-200">
                        
                        {/* --- BARIS LOKASI PENYEDIA SUDAH DIHAPUS DARI SINI --- */}
                        
                        <InfoRow icon={<EyeIcon className="w-5 h-5" />} label="Cakupan Operasi">
                            {supplier.operation_scope || '-'}
                        </InfoRow>

                        <InfoRow icon={<BookOpenIcon className="w-5 h-5" />} label="Kontak / Website">
                            {supplier.contact_website ? (
                                <a 
                                    href={supplier.contact_website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-green-700 hover:text-green-900 hover:underline"
                                >
                                    Kunjungi Situs
                                </a>
                            ) : '-'}
                        </InfoRow>

                        <InfoRow icon={<DocumentTextIcon className="w-5 h-5" />} label="Dokumen Penyedia">
                            {supplier.document_url ? (
                                <a 
                                    href={supplier.document_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-green-700 hover:text-green-900 hover:underline"
                                >
                                    Lihat Dokumen
                                </a>
                            ) : '-'}
                        </InfoRow>

                        <InfoRow icon={<PencilIcon className="w-5 h-5" />} label="Keterangan Tambahan">
                            <p className="whitespace-pre-wrap">{supplier.additional_info || '-'}</p>
                        </InfoRow>
                    </dl>
                </div>

                {/* Footer Modal */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 text-right rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}