import jsPDF from 'jspdf';

// Helper untuk format nama
const formatName = (type, category) => {
    const names = {
        transport: { petrol: 'Mobil Bensin', diesel: 'Mobil Diesel', motorcycle: 'Motor' },
        waste: { organic: 'Sampah Organik', plastic: 'Plastik', paper: 'Kertas', glass: 'Kaca', metal: 'Logam', other: 'Lainnya' }
    };
    return names[category]?.[type] || type;
};

// Fungsi utama untuk generate PDF
export const generatePdf = async (entry, businessName = 'Nama Usaha Belum Diatur') => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let currentY = 20;

    // --- 1. KOP SURAT (HEADER) ---
    try {
        const logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Lambang_Kementerian_Pariwisata_Republik_Indonesia_%282024%29.png';
        const img = await fetch(logoUrl);
        const blob = await img.blob();
        const reader = new FileReader();
        
        // Menggunakan Promise agar proses async bisa ditunggu
        await new Promise((resolve, reject) => {
            reader.onload = (e) => {
                doc.addImage(e.target.result, 'PNG', margin, 10, 20, 20);
                resolve();
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

    } catch (error) {
        console.error("Gagal memuat logo:", error);
    }
    
    doc.setFontSize(14).setFont('helvetica', 'bold');
    doc.text('LAPORAN JEJAK KARBON', pageWidth / 2, 18, { align: 'center' });
    
    doc.setFontSize(10).setFont('helvetica', 'normal');
    doc.text('Indonesia Tourism Carbon Track & Reporting', pageWidth / 2, 24, { align: 'center' });
    
    doc.setDrawColor(200); // Warna garis abu-abu
    doc.line(margin, 35, pageWidth - margin, 35); // Garis horizontal
    
    currentY = 45;

    // --- 2. INFORMASI DOKUMEN ---
    doc.setFontSize(12).setFont('helvetica', 'bold');
    doc.text('Informasi Laporan', margin, currentY);
    currentY += 8;

    doc.setFontSize(10).setFont('helvetica', 'normal');
    doc.text(`Periode Laporan: ${entry.calculation_title.replace('Laporan Emisi - ', '')}`, margin, currentY);
    currentY += 6;
    doc.text(`Nama Usaha: ${businessName}`, margin, currentY);
    currentY += 6;
    doc.text(`Tanggal Dibuat: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`, margin, currentY);
    currentY += 12;

    // --- 3. RINGKASAN TOTAL EMISI ---
    doc.setFillColor(236, 253, 245); // Warna hijau muda (emerald-50)
    doc.rect(margin, currentY, pageWidth - (margin * 2), 20, 'F');
    
    doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor(2, 44, 34); // emerald-900
    doc.text('Total Estimasi Emisi Karbon', margin + 5, currentY + 8);
    
    doc.setFontSize(16).setFont('helvetica', 'bold');
    doc.text(`${entry.total_co2e_kg.toFixed(2)} kg CO₂e`, pageWidth - margin - 5, currentY + 14, { align: 'right' });
    currentY += 30;

    // --- 4. DETAIL PER KATEGORI ---
    doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor(0, 0, 0);
    doc.text('Rincian Emisi per Kategori', margin, currentY);
    currentY += 8;

    // Listrik
    if (entry.electricity_co2e > 0) {
        doc.setFontSize(10).setFont('helvetica', 'bold');
        doc.text(`• Listrik: ${entry.electricity_co2e.toFixed(2)} kg CO₂e`, margin, currentY);
        currentY += 5;
        doc.setFont('helvetica', 'normal');
        doc.text(`  - Konsumsi: ${entry.electricity_details.kwh} kWh`, margin + 3, currentY);
        currentY += 8;
    }

    // Transportasi
    if (entry.transport_co2e > 0 && entry.transport_details) {
        doc.setFontSize(10).setFont('helvetica', 'bold');
        doc.text(`• Transportasi: ${entry.transport_co2e.toFixed(2)} kg CO₂e`, margin, currentY);
        currentY += 5;
        doc.setFont('helvetica', 'normal');
        entry.transport_details.forEach(v => {
            doc.text(`  - ${formatName(v.type, 'transport')} (x${v.quantity}): ${v.km} km, ${v.frequency}x / minggu`, margin + 3, currentY);
            currentY += 5;
        });
        currentY += 3;
    }

    // Sampah
    if (entry.waste_co2e > 0 && entry.waste_details) {
        doc.setFontSize(10).setFont('helvetica', 'bold');
        doc.text(`• Sampah: ${entry.waste_co2e.toFixed(2)} kg CO₂e`, margin, currentY);
        currentY += 5;
        doc.setFont('helvetica', 'normal');
        entry.waste_details.forEach(item => {
            doc.text(`  - ${formatName(item.type, 'waste')}: ${item.weight} kg`, margin + 3, currentY);
            currentY += 5;
        });
        currentY += 3;
    }

    // --- 5. FOOTER ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8).setTextColor(150);
        doc.text(
            `Halaman ${i} dari ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    // --- 6. SIMPAN DOKUMEN ---
    const fileName = `Laporan_Emisi_${entry.calculation_title.replace('Laporan Emisi - ', '').replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
};