"use client";

// Komponen Ikon untuk Panduan
const NumberCircle = ({ number }) => (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#22543d] text-white flex items-center justify-center font-bold">
        {number}
    </div>
);

const GuideSection = ({ title, children }) => (
    <section className="mb-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-6 pb-2 border-b-2 border-emerald-600">{title}</h2>
        <div className="space-y-6 text-slate-600 leading-relaxed">
            {children}
        </div>
    </section>
);

// Komponen Utama Halaman Panduan
export default function PanduanPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-800">Panduan Pengguna</h1>
                <p className="mt-2 text-lg text-slate-600">Panduan lengkap untuk memulai, mengelola, dan memaksimalkan penggunaan WINZ Hub.</p>
            </div>

            <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-md border">
                <GuideSection title="Selamat Datang di WINZ Hub!">
                    <p>
                        <strong>Wonderful Indonesia Net Zero Hub (WINZ Hub)</strong> adalah platform nasional yang dirancang untuk membantu bisnis pariwisata di Indonesia—seperti hotel, operator tur, dan pengelola atraksi—dalam mengukur, melaporkan, dan mengurangi jejak karbon mereka.
                    </p>
                    <p>
                        Dengan menggunakan platform ini, Anda tidak hanya berkontribusi pada keberlanjutan lingkungan, tetapi juga bergabung dalam komitmen global Indonesia di bawah <strong>Deklarasi Glasgow</strong> untuk Aksi Iklim di Sektor Pariwisata.
                    </p>
                </GuideSection>

                <GuideSection title="Membuat Laporan Emisi Pertama Anda">
                    <div className="flex items-start gap-4">
                        <NumberCircle number="1" />
                        <div>
                            <h4 className="font-bold text-lg text-slate-700">Pilih Periode Laporan</h4>
                            <p>Buka halaman <strong>"Laporan Emisi"</strong>. Langkah pertama adalah memilih bulan dan tahun laporan yang ingin Anda buat. Sebaiknya isi laporan secara rutin setiap bulan untuk mendapatkan data yang akurat.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <NumberCircle number="2" />
                        <div>
                            <h4 className="font-bold text-lg text-slate-700">Input Data per Kategori</h4>
                            <p>Platform membagi sumber emisi menjadi empat kategori utama. Anda bisa mengisinya secara bertahap.</p>
                            <ul className="list-disc list-inside mt-2 space-y-2 pl-2">
                                <li>
                                    <strong>Listrik:</strong> Masukkan total konsumsi listrik dari tagihan PLN (dalam kWh), luas bangunan, dan total malam kamar terisi. Pilih juga lokasi grid listrik yang paling sesuai.
                                </li>
                                <li>
                                    <strong>Energi Non-Listrik:</strong> Catat penggunaan bahan bakar selain untuk transportasi, seperti solar untuk genset atau gas LPG untuk memasak. Masukkan jenis bahan bakar, jumlah penggunaan, dan frekuensi per bulan.
                                </li>
                                <li>
                                    <strong>Transportasi:</strong> Daftarkan kendaraan operasional milik perusahaan. Masukkan jenis kendaraan, rata-rata jarak tempuh per penggunaan, dan total frekuensi penggunaan per bulan.
                                </li>
                                <li>
                                    <strong>Limbah:</strong> Tambahkan jenis-jenis limbah yang dihasilkan bisnis Anda (misalnya, limbah makanan, plastik). Masukkan beratnya dalam satuan <strong>ton</strong> dan pilih metode pengolahannya.
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <NumberCircle number="3" />
                        <div>
                            <h4 className="font-bold text-lg text-slate-700">Simpan Laporan</h4>
                            <p>Setelah mengisi data pada satu tab (misalnya, Listrik), klik tombol <strong>"Simpan Laporan"</strong>. Sistem akan menghitung estimasi emisi untuk kategori tersebut dan menyimpannya. Anda bisa melanjutkan ke tab lain atau kembali lagi nanti untuk melengkapi data bulan yang sama.</p>
                        </div>
                    </div>
                </GuideSection>

                <GuideSection title="Memahami Dasbor Utama">
                    <p>Halaman <strong>"Dasbor Utama"</strong> adalah pusat pantauan Anda. Di sini Anda akan menemukan ringkasan emisi yang dikelompokkan ke dalam Scope 1, 2, dan 3, beserta rincian untuk setiap kategori emisi.</p>
                </GuideSection>

                <GuideSection title="Mengelola Riwayat dan Sertifikat">
                     <ul className="list-disc list-inside space-y-3">
                        <li>
                            <strong>Riwayat Laporan:</strong> Di bagian bawah halaman "Laporan Emisi", Anda akan menemukan daftar semua laporan yang telah Anda buat, diurutkan dari yang terbaru. Klik pada salah satu laporan untuk melihat detailnya atau mengunduhnya dalam format PDF.
                        </li>
                        <li>
                            <strong>Sertifikat Apresiasi:</strong> Kunjungi halaman <strong>"Sertifikasi"</strong>. Setelah Anda berhasil membuat setidaknya satu laporan yang mencakup data untuk semua kategori emisi, Anda akan berhak mengunduh Sertifikat Apresiasi sebagai bentuk pengakuan atas komitmen Anda.
                        </li>
                    </ul>
                </GuideSection>
            </div>
        </div>
    );
}