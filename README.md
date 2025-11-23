# 🌏 Wonderful Indonesia Net Zero Hub (WINZ Hub)

**Wonderful Indonesia Net Zero Hub (WINZ Hub)** adalah platform online nasional yang dirancang untuk membantu bisnis di sektor pariwisata Indonesia dalam mengukur, melaporkan, dan mengurangi jejak karbon mereka. Proyek ini merupakan inisiatif dari Kementerian Pariwisata dan Ekonomi Kreatif/Badan Pariwisata dan Ekonomi Kreatif Republik Indonesia untuk mendukung komitmen Indonesia dalam **Deklarasi Glasgow tentang Aksi Iklim di Sektor Pariwisata**.

Aplikasi ini dibangun menggunakan teknologi modern **Next.js** (App Router) untuk frontend dan **Supabase** sebagai infrastruktur backend (Database & Authentication), memastikan performa tinggi, skalabilitas, dan keamanan data.

---

## ✨ Fitur Utama

Berdasarkan arsitektur kode saat ini, platform menyediakan fitur berikut:

### 1. 📊 Manajemen Emisi & Lingkungan
* **Kalkulator Jejak Karbon:** Hitung emisi dari berbagai sumber (listrik, transportasi, limbah) menggunakan faktor emisi terstandarisasi.
* **Peta Sebaran Emisi (GIS):** Visualisasi interaktif data emisi per provinsi di Indonesia menggunakan data GeoJSON.
* **Riwayat & Laporan:** Pelacakan historis emisi bulanan/tahunan dan pembuatan laporan otomatis dalam format PDF.

### 2. 🏢 Dashboard Terintegrasi
* **User Dashboard:** Pantau tren penurunan emisi, status sertifikasi, dan ringkasan aktivitas usaha pariwisata.
* **Admin Dashboard:** Pusat kendali untuk memantau statistik nasional, verifikasi pengguna baru, dan analisis data agregat.

### 3. 🔗 Rantai Pasok Hijau (Supply Chain)
* **Manajemen Supplier:** Evaluasi dan kelola daftar pemasok berdasarkan kriteria keberlanjutan.
* **Scoring System:** Lihat skor keberlanjutan dari setiap pemasok untuk pengambilan keputusan pengadaan barang yang lebih hijau.

### 4. 🏆 Sertifikasi & Kepatuhan
* **Pengajuan Sertifikasi:** Alur kerja digital untuk mengajukan validasi "Net Zero" atau label ramah lingkungan lainnya.
* **Verifikasi Admin:** Panel khusus bagi admin untuk memvalidasi dokumen bukti dan menyetujui pengajuan.
* **Sertifikat Digital:** Pembuatan sertifikat apresiasi (PDF) secara otomatis bagi mitra yang memenuhi syarat.

### 5. 📚 Pusat Edukasi (Learning Center)
* **Modul & Panduan:** Akses materi edukasi tentang *Best Practice* pariwisata berkelanjutan.
* **Video Learning:** Halaman khusus untuk konten pembelajaran berbasis video.

---

## 🛠️ Teknologi yang Digunakan

* **Frontend:** [Next.js 14+](https://nextjs.org/) (App Router), React
* **Backend & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Maps/GIS:** Leaflet / React-Leaflet
* **PDF Generation:** `jspdf` & `jspdf-autotable`
* **Icons:** Lucide React / Heroicons

---

## 📂 Struktur File & Komponen

Berikut adalah dokumentasi mendalam mengenai struktur direktori dan fungsi dari setiap komponen utama dalam aplikasi ini:

```bash
osp-nextjs/
├── app/
│   ├── components/                 # 🧩 PUSTAKA KOMPONEN (UI & LOGIC)
│   │   ├── Account/Auth
│   │   │   ├── AuthPage.jsx            # Halaman Login/Register dengan Supabase Auth
│   │   │   ├── AccountPage.jsx         # Pengaturan akun pengguna
│   │   │   ├── ProfilUsahaPage.jsx     # Form detail profil usaha pariwisata
│   │   │
│   │   ├── Dashboard (User)
│   │   │   ├── Dashboard.jsx           # Layout utama dashboard user
│   │   │   ├── DashboardSummary.jsx    # Card ringkasan statistik (Total Emisi, dll)
│   │   │   ├── DashboardTrends.jsx     # Grafik garis tren emisi waktu ke waktu
│   │   │   ├── DashboardPieChart.jsx   # Grafik lingkaran proporsi sumber emisi
│   │   │
│   │   ├── Dashboard (Admin)
│   │   │   ├── AdminDashboardPage.jsx      # Halaman utama dashboard admin
│   │   │   ├── AdminDashboardSummary.jsx   # Statistik global platform
│   │   │   ├── AdminDashboardTrends.jsx    # Analisis tren data seluruh user
│   │   │   ├── AdminVerificationPage.jsx   # Tabel verifikasi dokumen sertifikasi
│   │   │
│   │   ├── Carbon & Emissions
│   │   │   ├── CarbonCalculator.jsx    # Form kompleks perhitungan jejak karbon
│   │   │   ├── EmissionMap.jsx         # Peta interaktif (render GeoJSON provinsi)
│   │   │   ├── EmissionHistory.jsx     # Tabel riwayat input emisi
│   │   │   ├── EmissionReportPage.jsx  # Halaman detail laporan emisi
│   │   │
│   │   ├── Supply Chain
│   │   │   ├── SupplyChainPage.jsx         # Halaman manajemen rantai pasok user
│   │   │   ├── SupplierDetailModal.jsx     # Popup detail info supplier
│   │   │   ├── AdminSupplyChainPage.jsx    # Manajemen master data supplier (Admin)
│   │   │
│   │   ├── Sustainability & Certs
│   │   │   ├── SustainabilityPage.jsx      # Overview program keberlanjutan
│   │   │   ├── SertifikasiPage.jsx         # Status dan pengajuan sertifikasi
│   │   │   ├── AdminSustainabilityPage.jsx # CMS untuk konten sustainability
│   │   │
│   │   ├── Learning Center
│   │   │   ├── PembelajaranPage.jsx    # Katalog modul pembelajaran
│   │   │   ├── VideoDetailPage.jsx     # Player dan deskripsi konten video
│   │   │   ├── PanduanPage.jsx         # Dokumentasi panduan teknis
│   │   │   ├── AdminLearningPage.jsx   # CMS upload materi belajar
│   │   │
│   │   └── General UI
│   │       ├── LandingPage.jsx         # Halaman muka (Public)
│   │       ├── BerandaPage.jsx         # Halaman home setelah login
│   │       ├── NotificationPage.jsx    # Pusat notifikasi user
│   │       └── Icons.jsx               # Koleksi aset ikon SVG/Vector
│   │
│   ├── lib/                        # ⚙️ UTILITIES & HELPER FUNCTIONS
│   │   ├── generatePdf.js                  # Helper dasar pembuatan PDF
│   │   ├── generateCertificatePdf.js       # Logic khusus layout sertifikat WINZ
│   │   ├── generateActivityReportPdf.js    # Logic generate laporan aktivitas user
│   │   └── locationData.js                 # Data statis wilayah/lokasi
│   │
│   ├── layout.js                   # Root Layout (Metadata, Font config)
│   └── page.jsx                    # Entry point aplikasi
│
├── public/
│   ├── data/                       # 💾 STATIC DATASETS
│   │   ├── indonesia-provinces.json    # GeoJSON batas wilayah provinsi
│   │   ├── emisiCO2.json & .csv        # Data faktor emisi atau dummy data
│   │   └── akomodasi.json              # Data tipe akomodasi pariwisata
│   └── ...                         # Aset Gambar & SVG
│
└── tailwind.config.js              # Konfigurasi tema & warna design system
````

-----

## 💻 Cara Instalasi & Menjalankan

Ikuti langkah berikut untuk mengembangkan projek ini secara lokal:

1.  **Clone Repositori:**

    ```bash
    git clone [https://github.com/rahadianms/osp-nextjs.git](https://github.com/rahadianms/osp-nextjs.git)
    cd osp-nextjs
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Konfigurasi Environment Variable (.env.local):**
    Buat file `.env.local` dan isi dengan kredensial Supabase Anda:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=[https://your-project-id.supabase.co](https://your-project-id.supabase.co)
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
    ```

4.  **Jalankan Development Server:**

    ```bash
    npm run dev
    ```

5.  **Akses Aplikasi:**
    Buka `http://localhost:3000` di browser Anda.

-----
