// app/components/AdminSupplyChainPage.jsx
"use client";

import { useState, useEffect } from 'react';

const initialFormState = {
    emission_source: 'Listrik',
    provider_name: '',
    product_type: '',
    location: '',
    operation_scope: '',
    verification_type: 'admin',
    contact_website: '',
    document_url: '',
    additional_info: ''
};

export default function AdminSupplyChainPage({ supabase }) {
    const [loading, setLoading] = useState(true);
    const [suppliers, setSuppliers] = useState([]);
    const [formData, setFormData] = useState(initialFormState);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const emissionSources = ['Listrik', 'Energi Non-Listrik', 'Transportasi', 'Limbah'];

    // 1. Fungsi untuk mengambil data pemasok
    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('sustainable_suppliers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSuppliers(data || []);
        } catch (error) {
            setMessage({ type: 'error', text: `Gagal mengambil data: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    // 2. Ambil data saat komponen dimuat
    useEffect(() => {
        fetchSuppliers();
    }, [supabase]);

    // 3. Fungsi untuk menangani input form
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 4. Fungsi untuk submit form (membuat pemasok baru)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.provider_name || !formData.emission_source) {
            setMessage({ type: 'error', text: 'Nama Penyedia dan Sumber Emisi wajib diisi.' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const { error } = await supabase
                .from('sustainable_suppliers')
                .insert([formData]); // Kirim data dari state formData

            if (error) throw error;

            setMessage({ type: 'success', text: 'Pemasok baru berhasil ditambahkan!' });
            setFormData(initialFormState); // Reset form
            fetchSuppliers(); // Muat ulang daftar pemasok
        } catch (error) {
            setMessage({ type: 'error', text: `Gagal menambahkan: ${error.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    // 5. Fungsi untuk menghapus pemasok
    const handleDelete = async (supplierId) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus pemasok ini?')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('sustainable_suppliers')
                .delete()
                .eq('id', supplierId);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Pemasok berhasil dihapus.' });
            fetchSuppliers(); // Muat ulang daftar
        } catch (error) {
            setMessage({ type: 'error', text: `Gagal menghapus: ${error.message}` });
        }
    };

    return (
        <div className="space-y-8">
            {/* Bagian 1: Formulir Tambah Pemasok */}
            <div className="bg-white p-8 rounded-xl shadow-md border">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">Tambah Pemasok Baru</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="provider_name" className="block text-sm font-medium text-slate-700">Nama Penyedia (Wajib)</label>
                            <input type="text" name="provider_name" id="provider_name" value={formData.provider_name} onChange={handleFormChange} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg"/>
                        </div>
                        <div>
                            <label htmlFor="product_type" className="block text-sm font-medium text-slate-700">Jenis Produk</label>
                            <input type="text" name="product_type" id="product_type" value={formData.product_type} onChange={handleFormChange} className="mt-1 w-full p-2 border border-slate-300 rounded-lg"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="emission_source" className="block text-sm font-medium text-slate-700">Sumber Emisi (Wajib)</label>
                            <select name="emission_source" id="emission_source" value={formData.emission_source} onChange={handleFormChange} required className="mt-1 w-full p-2 border border-slate-300 rounded-lg">
                                {emissionSources.map(source => (
                                    <option key={source} value={source}>{source}</option>
                                ))}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="verification_type" className="block text-sm font-medium text-slate-700">Jenis Verifikasi</label>
                            <select name="verification_type" id="verification_type" value={formData.verification_type} onChange={handleFormChange} className="mt-1 w-full p-2 border border-slate-300 rounded-lg">
                                <option value="admin">Verifikasi Admin</option>
                                <option value="sertifikasi">Sertifikasi</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-slate-700">Lokasi</label>
                            <input type="text" name="location" id="location" value={formData.location} onChange={handleFormChange} className="mt-1 w-full p-2 border border-slate-300 rounded-lg"/>
                        </div>
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="operation_scope" className="block text-sm font-medium text-slate-700">Cakupan Operasi</label>
                            <input type="text" name="operation_scope" id="operation_scope" value={formData.operation_scope} onChange={handleFormChange} className="mt-1 w-full p-2 border border-slate-300 rounded-lg"/>
                        </div>
                        <div>
                            <label htmlFor="contact_website" className="block text-sm font-medium text-slate-700">Kontak / Website (URL)</label>
                            <input type="url" name="contact_website" id="contact_website" value={formData.contact_website} onChange={handleFormChange} placeholder="https://..." className="mt-1 w-full p-2 border border-slate-300 rounded-lg"/>
                        </div>
                        <div>
                            <label htmlFor="document_url" className="block text-sm font-medium text-slate-700">Dokumen Penyedia (URL)</label>
                            <input type="url" name="document_url" id="document_url" value={formData.document_url} onChange={handleFormChange} placeholder="https://..." className="mt-1 w-full p-2 border border-slate-300 rounded-lg"/>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="additional_info" className="block text-sm font-medium text-slate-700">Keterangan Tambahan</label>
                        <textarea name="additional_info" id="additional_info" value={formData.additional_info} onChange={handleFormChange} rows="3" className="mt-1 w-full p-2 border border-slate-300 rounded-lg"></textarea>
                    </div>

                    {message.text && (
                        <p className={`text-sm p-3 rounded-lg ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                            {message.text}
                        </p>
                    )}

                    <div className="text-right">
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 disabled:bg-slate-400">
                            {isSubmitting ? 'Menyimpan...' : 'Tambah Pemasok'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Bagian 2: Daftar Pemasok Saat Ini */}
            <div className="bg-white p-8 rounded-xl shadow-md border">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">Daftar Pemasok Saat Ini ({suppliers.length})</h2>
                <div className="overflow-x-auto border rounded-lg shadow">
                    {loading ? (
                        <p className="p-10 text-center text-slate-500">Memuat data...</p>
                    ) : (
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nama Penyedia</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Sumber Emisi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Verifikasi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {suppliers.map(supplier => (
                                    <tr key={supplier.id}>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{supplier.provider_name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{supplier.emission_source}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${supplier.verification_type === 'sertifikasi' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {supplier.verification_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <button 
                                                onClick={() => handleDelete(supplier.id)}
                                                className="text-red-600 hover:text-red-900 hover:underline"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}