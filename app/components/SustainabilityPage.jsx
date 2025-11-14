// app/components/SustainabilityPage.jsx
"use client";

import { useState, useEffect } from "react";
// --- MODIFIKASI: Impor 'ClockIcon' ---
import {
  PlusCircleIcon,
  TrashIcon,
  LinkIcon,
  BookOpenIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  CheckBadgeIcon,
  ClockIcon, // <-- BARU
} from "./Icons";
import { generateActivityReportPdf } from "../lib/generateActivityReportPdf";

// --- KOMPONEN HELPER (UI) ---
const FormLabel = ({ htmlFor, children }) => (
  <label
    htmlFor={htmlFor}
    className="block text-sm font-medium text-slate-700 mb-1.5"
  >
    {children}
  </label>
);

const FormInput = ({ className, ...props }) => (
  <input
    {...props}
    className={`block w-full border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm ${className || ''}`}
  />
);

const FormTextarea = ({ className, ...props }) => (
  <textarea
    {...props}
    rows="4"
    className={`block w-full border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm ${className || 'px-3 py-2'}`}
  />
);

const FormSelect = ({ className, ...props }) => (
  <select
    {...props}
    className={`block w-full border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm ${className || 'px-3 py-2'}`}
  >
    {props.children}
  </select>
);

const SmallSpinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-teal-600"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

// --- KOMPONEN UTAMA ---
export default function SustainabilityPage({ supabase, user }) {
  // (Semua state Anda tidak berubah)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Energi Terbarukan');
  const [activityDate, setActivityDate] = useState('');
  const [links, setLinks] = useState([
    { title: '', url: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [reports, setReports] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  // (Semua fungsi Anda tidak berubah)
  // fetchReports, useEffect, handleLinkChange, addLinkInput, removeLinkInput,
  // handleSubmit, handleDeleteReport, handleDownloadPdf, formatDate
  
  const fetchReports = async () => {
    setListLoading(true);
    const { data, error } = await supabase
      .from('sustainability_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('activity_date', { ascending: false });

    if (data) {
      setReports(data);
    } else {
      console.error("Gagal mengambil riwayat laporan:", error);
      setMessage({ type: 'error', text: 'Gagal memuat riwayat laporan.' });
    }
    setListLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const addLinkInput = () => {
    setLinks([...links, { title: '', url: '' }]);
  };

  const removeLinkInput = (index) => {
    if (links.length <= 1) return;
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const validLinks = links.filter(link => link.url && link.url.trim() !== '');

    const { data, error } = await supabase
      .from('sustainability_reports')
      .insert([
        {
          user_id: user.id,
          title,
          description,
          category,
          activity_date: activityDate,
          evidence_links: validLinks.length > 0 ? validLinks : null
        }
      ]);

    if (error) {
      console.error("Error submitting report object:", JSON.stringify(error, null, 2));
      setMessage({
        type: 'error',
        text: `Gagal menyimpan laporan. Error: ${error.message || 'Cek konsol untuk detail.'}`
      });
    } else {
      setMessage({ type: 'success', text: 'Laporan berhasil disimpan!' });
      setTitle('');
      setDescription('');
      setCategory('Energi Terbarukan');
      setActivityDate('');
      setLinks([{ title: '', url: '' }]);
      fetchReports();
    }
    setLoading(false);
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus laporan ini?")) {
      const { error } = await supabase
        .from('sustainability_reports')
        .delete()
        .eq('id', reportId); 

      if (error) {
        console.error("Gagal menghapus laporan:", error);
        setMessage({ type: 'error', text: `Gagal menghapus laporan: ${error.message}` });
      } else {
        setReports(reports.filter(report => report.id !== reportId));
        setMessage({ type: 'success', text: 'Laporan berhasil dihapus.' });
      }
    }
  };

  const handleDownloadPdf = async (report) => {
    setDownloadingId(report.id);
    setMessage({ type: '', text: '' });
    try {
      await generateActivityReportPdf(report);
    } catch (error) {
      console.error("Gagal membuat PDF:", error);
      setMessage({ type: 'error', text: 'Gagal membuat file PDF.' });
    }
    setDownloadingId(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tanggal tidak valid';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // --- RENDER ---
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* --- FORM SUBMIT (Tidak berubah) --- */}
      <h2 className="text-3xl font-bold text-slate-900 mb-6">
        Laporan Aktivitas Keberlanjutan
      </h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-200">
        {/* ... (Konten form utuh) ... */}
        <div className="space-y-6">
          <div>
            <FormLabel htmlFor="title">Judul Aktivitas</FormLabel>
            <FormInput id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mis: Pemasangan Panel Surya" required className="px-3 py-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <FormLabel htmlFor="category">Kategori</FormLabel>
              <FormSelect id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2">
                <option>Energi Terbarukan</option>
                <option>Manajemen Limbah</option>
                <option>Konservasi Air</option>
                <option>Edukasi & Komunitas</option>
                <option>Rantai Pasok Hijau</option>
                <option>Lainnya</option>
              </FormSelect>
            </div>
            <div>
              <FormLabel htmlFor="activityDate">Tanggal Aktivitas</FormLabel>
              <FormInput id="activityDate" type="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} required className="px-3 py-2" />
            </div>
          </div>
          <div>
            <FormLabel htmlFor="description">Deskripsi Singkat Aktivitas</FormLabel>
            <FormTextarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Jelaskan aktivitas yang dilakukan dan dampaknya..." className="px-3 py-2" />
          </div>
        </div>
        <div className="border-t border-slate-200 mt-8 pt-8">
          <h3 className="text-xl font-semibold text-slate-800 mb-5">
            Bukti / Evidensi (Opsional)
          </h3>
          <div className="space-y-4">
            {links.map((link, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex flex-wrap md:flex-nowrap gap-4 items-end">
                  <div className="flex-grow w-full md:w-1/3">
                    <FormLabel htmlFor={`link-title-${index}`}>
                      Judul Link {index + 1}
                    </FormLabel>
                    <FormInput
                      id={`link-title-${index}`}
                      type="text"
                      placeholder="Contoh: Sertifikat"
                      value={link.title}
                      onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                      className="px-3 py-2"
                    />
                  </div>
                  <div className="flex-grow w-full md:w-2/3">
                    <FormLabel htmlFor={`link-url-${index}`}>
                      URL {index + 1}
                    </FormLabel>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                        <LinkIcon />
                      </span>
                      <FormInput
                        id={`link-url-${index}`}
                        type="url"
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                        className="pl-10 pr-3 py-2"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLinkInput(index)}
                    disabled={links.length <= 1}
                    className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 disabled:text-slate-300 disabled:cursor-not-allowed rounded-md"
                    title="Hapus link"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addLinkInput}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <PlusCircleIcon />
            Tambah Link Lain
          </button>
        </div>
        <div className="border-t border-slate-200 mt-8 pt-6 text-right">
          <button type="submit" disabled={loading}
                  className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400">
            {loading ? 'Menyimpan...' : 'Simpan Laporan'}
          </button>
        </div>
        
        {message.text && (
          <p className={`text-sm text-center mt-4 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </p>
        )}
      </form>
      {/* --- AKHIR FORM SUBMIT --- */}


      {/* --- BAGIAN RIWAYAT LAPORAN --- */}
      <div className="mt-16">
        <h3 className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-6">
          <BookOpenIcon />
          Riwayat Laporan Anda
        </h3>

        {/* ... (Loading dan Empty state tidak berubah) ... */}
        {listLoading && (
          <div className="text-center text-slate-500 p-8 bg-white rounded-lg shadow-sm border">
            Memuat riwayat laporan...
          </div>
        )}

        {!listLoading && reports.length === 0 && (
          <div className="text-center text-slate-500 p-8 bg-white rounded-lg shadow-sm border">
            Anda belum memiliki laporan aktivitas keberlanjutan.
          </div>
        )}

        {!listLoading && reports.length > 0 && (
          <div className="space-y-6">
            {reports.map((report) => (
              <div key={report.id} className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                
                <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-100">
                  
                  {/* Bagian Kiri: Judul dan Tag */}
                  <div className="flex-grow">
                    <h4 className="text-xl font-semibold text-teal-700">{report.title}</h4>
                    
                    {/* --- PERUBAHAN UI: Menampilkan Status Verifikasi --- */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="inline-block px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-sm font-medium">
                        {report.category}
                      </span>
                      
                      {/* --- BARU: Logika Status (Hijau atau Abu-abu) --- */}
                      {report.is_verified ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                          <CheckBadgeIcon />
                          Terverifikasi
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-sm font-medium">
                          <ClockIcon />
                          Menunggu Verifikasi
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bagian Kanan: Tombol Aksi (Unduh & Hapus) */}
                  <div className="flex-shrink-0 flex items-center gap-1">
                    <button
                      onClick={() => handleDownloadPdf(report)}
                      disabled={downloadingId === report.id}
                      className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-full"
                      title="Unduh laporan (PDF)"
                    >
                      {downloadingId === report.id ? (
                        <SmallSpinner />
                      ) : (
                        <ArrowDownTrayIcon />
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      disabled={downloadingId === report.id}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                      title="Hapus laporan"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
                
                {/* ... (Konten Kartu tidak berubah) ... */}
                <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <CalendarIcon />
                      <span>Tanggal Aktivitas: {formatDate(report.activity_date)}</span>
                    </div>
                    <p className="text-slate-600">{report.description}</p>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-semibold text-slate-800 mb-2">Bukti / Evidensi:</h5>
                    {(report.evidence_links && report.evidence_links.length > 0) ? (
                      <ul className="space-y-2">
                        {report.evidence_links.map((link, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <LinkIcon />
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-teal-600 hover:text-teal-800 hover:underline truncate"
                              title={link.url}
                            >
                              {link.title || link.url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-400 italic">Tidak ada bukti link.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}