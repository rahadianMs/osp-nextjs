// app/lib/generateActivityReportPdf.js
"use client";

import jsPDF from 'jspdf';

// Helper untuk format tanggal
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Fungsi utama untuk generate PDF
export const generateActivityReportPdf = async (report) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let currentY = 20;

  // --- 1. KOP SURAT (HEADER) ---
  // Saya mengambil gaya header dari file generatePdf.js Anda
  // agar desainnya konsisten.
  try {
    const logoUrl =
      'https://upload.wikimedia.org/wikipedia/commons/f/fc/Lambang_Kementerian_Pariwisata_Republik_Indonesia_%282024%29.png';
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    await new Promise((resolve, reject) => {
      img.onload = () => {
        doc.addImage(img, 'PNG', margin, 12, 18, 18, undefined, 'MEDIUM');
        resolve();
      };
      img.onerror = reject;
      img.src = logoUrl;
    });
  } catch (error) {
    console.error('Gagal memuat logo:', error);
  }

  doc.setFontSize(14).setFont('helvetica', 'bold');
  doc.text('LAPORAN AKTIVITAS KEBERLANJUTAN', pageWidth / 2, 18, {
    align: 'center',
  });

  doc
    .setFontSize(10)
    .setFont('helvetica', 'normal');
  doc.text(
    'Indonesia Tourism Carbon Track & Reporting',
    pageWidth / 2,
    24,
    { align: 'center' }
  );

  doc.setDrawColor(220);
  doc.line(margin, 35, pageWidth - margin, 35);

  currentY = 45;

  // --- 2. DETAIL LAPORAN ---
  doc.setFontSize(12).setFont('helvetica', 'bold');
  doc.text('Judul Aktivitas:', margin, currentY);
  doc
    .setFontSize(14)
    .setFont('helvetica', 'normal')
    .setTextColor(0, 105, 92); // Warna Teal
  doc.text(report.title, margin, currentY + 7);
  currentY += 20;

  doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor(0, 0, 0);
  doc.text('Kategori:', margin, currentY);
  doc.setFontSize(11).setFont('helvetica', 'normal');
  doc.text(report.category, margin + 40, currentY);
  currentY += 8;

  doc.setFontSize(11).setFont('helvetica', 'bold');
  doc.text('Tanggal Aktivitas:', margin, currentY);
  doc.setFontSize(11).setFont('helvetica', 'normal');
  doc.text(formatDate(report.activity_date), margin + 40, currentY);
  currentY += 12;

  doc.setFontSize(11).setFont('helvetica', 'bold');
  doc.text('Deskripsi Aktivitas:', margin, currentY);
  currentY += 7;

  doc.setFontSize(10).setFont('helvetica', 'normal');
  const descriptionLines = doc.splitTextToSize(
    report.description || 'Tidak ada deskripsi.',
    pageWidth - margin * 2
  );
  doc.text(descriptionLines, margin, currentY);
  currentY += descriptionLines.length * 5 + 10; // Spasi ekstra

  // --- 3. BUKTI / LINK ---
  doc.setFontSize(11).setFont('helvetica', 'bold');
  doc.text('Bukti / Evidensi:', margin, currentY);
  currentY += 7;

  if (report.evidence_links && report.evidence_links.length > 0) {
    doc.setFontSize(10).setFont('helvetica', 'normal');
    report.evidence_links.forEach((link, index) => {
      doc.text(`- ${link.title || 'Link ' + (index + 1)}:`, margin + 5, currentY);
      doc.setTextColor(0, 0, 255); // Warna biru untuk link
      doc.textWithLink(link.url, margin + 8, currentY + 5, { url: link.url });
      doc.setTextColor(0, 0, 0); // Kembalikan ke hitam
      currentY += 12;
    });
  } else {
    doc.setFontSize(10).setFont('helvetica', 'italic');
    doc.text('Tidak ada bukti link yang dilampirkan.', margin + 5, currentY);
  }

  // --- 4. SIMPAN DOKUMEN ---
  const fileName = `Laporan_Aktivitas_${report.title
    .replace(/\s+/g, '_')
    .slice(0, 20)}.pdf`;
  doc.save(fileName);
};