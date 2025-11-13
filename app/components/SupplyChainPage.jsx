// app/components/SupplyChainPage.jsx
"use client";

import { useState, useEffect } from 'react';
import { 
    PlusCircleIcon, 
    EyeIcon,
} from './Icons.jsx';
// 1. Impor modal baru
import SupplierDetailModal from './SupplierDetailModal';

export default function SupplyChainPage({ supabase }) {
    const [loading, setLoading] = useState(true);
    const [allSuppliers, setAllSuppliers] = useState([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const [activeFilter, setActiveFilter] = useState('Semua');

    // 2. State untuk melacak supplier mana yang sedang dilihat di modal
    const [selectedSupplier, setSelectedSupplier] = useState(null);

    const emissionSources = ['Semua', 'Listrik', 'Energi Non-Listrik', 'Transportasi', 'Limbah'];

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('sustainable_suppliers')
                    .select('*')
                    .order('provider_name', { ascending: true }); 

                if (error) throw error;
                setAllSuppliers(data || []);
                setFilteredSuppliers(data || []);
            } catch (error) {
                console.error('Error fetching suppliers:', error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSuppliers();
    }, [supabase]); 

    const handleFilterChange = (e) => {
        const filterValue = e.target.value;
        setActiveFilter(filterValue);

        if (filterValue === 'Semua') {
            setFilteredSuppliers(allSuppliers);
        } else {
            const filtered = allSuppliers.filter(
                (supplier) => supplier.emission_source === filterValue
            );
            setFilteredSuppliers(filtered);
        }
    };

    const VerificationIcon = ({ type }) => {
        if (type === 'sertifikasi') {
            return (
                <span className="flex items-center gap-1 text-green-600" title="Tersertifikasi">
                    <PlusCircleIcon className="h-5 w-5" />
                    <span>Sertifikasi</span>
                </span>
            );
        }
        if (type === 'admin') {
            return (
                <span className="flex items-center gap-1 text-blue-600" title="Diverifikasi oleh Admin">
                    <EyeIcon className="h-5 w-5" />
                    <span>Verifikasi Admin</span>
                </span>
            );
        }
        return <span className="text-slate-400">-</span>;
    };

    return (
        // 3. Tambahkan <SupplierDetailModal> di sini
        <>
            {selectedSupplier && (
                <SupplierDetailModal 
                    supplier={selectedSupplier}
                    onClose={() => setSelectedSupplier(null)} // Fungsi untuk menutup modal
                />
            )}

            <div className="bg-white p-8 rounded-xl shadow-md border space-y-8">
                {/* Header dan Filter (Tidak Berubah) */}
                <div>
                    <h2 className="text-3xl font-bold mb-2 text-slate-800">Direktori Pemasok Berkelanjutan</h2>
                    <p className="text-slate-600 mb-6 max-w-4xl">
                        Temukan penyedia solusi berkelanjutan untuk membantu mengurangi jejak karbon Anda.
                    </p>
                    
                    <div>
                        <label htmlFor="emission-filter" className="block text-sm font-medium text-slate-700 mb-1">
                            Filter berdasarkan Solusi (Sumber Emisi):
                        </label>
                        <select
                            id="emission-filter"
                            value={activeFilter}
                            onChange={handleFilterChange}
                            className="p-2 border border-slate-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                        >
                            {emissionSources.map((source) => (
                                <option key={source} value={source}>
                                    {source}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Konten Tabel - SUDAH DIPERBARUI */}
                <div className="overflow-x-auto border rounded-lg shadow">
                    {loading ? (
                        <p className="text-center p-20 text-slate-500">Memuat data pemasok...</p>
                    ) : filteredSuppliers.length === 0 ? (
                        <p className="text-center p-20 text-slate-500">
                            Tidak ada pemasok yang ditemukan untuk filter "{activeFilter}".
                        </p>
                    ) : (
                        // 4. Perhatikan struktur tabel yang disederhanakan
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Penyedia</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Jenis Produk</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Lokasi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Verifikasi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredSuppliers.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.provider_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.product_type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.location}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <VerificationIcon type={item.verification_type} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {/* 5. Tombol untuk membuka modal */}
                                            <button
                                                onClick={() => setSelectedSupplier(item)}
                                                className="text-green-700 hover:text-green-900 font-semibold hover:underline"
                                            >
                                                Lihat Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
}