# 🌏 Wonderful Indonesia Decarbonization Initiative Hub (WIDI Hub)

**Wonderful Indonesia Decarbonization Initiative Hub (WIDI Hub)** adalah platform nasional terintegrasi yang dirancang untuk memimpin transformasi sektor pariwisata Indonesia menuju masa depan rendah karbon. Proyek ini merupakan inisiatif strategis dari Kementerian Pariwisata dan Ekonomi Kreatif Republik Indonesia untuk mendukung komitmen **Net Zero Emissions** dan **Deklarasi Glasgow** tentang Aksi Iklim di Sektor Pariwisata.

WIDI Hub berfungsi sebagai pusat data, alat pengukuran (kalkulator), dan wadah kolaborasi bagi industri pariwisata (Hotel, Operator Tur, Atraksi Wisata) untuk mengukur, melaporkan, dan mengurangi jejak karbon mereka secara terstandarisasi.

---

## ✨ Fitur Unggulan

### 1. 📊 Kalkulator Jejak Karbon Standar Global (IPCC)
Sistem perhitungan emisi yang presisi dan transparan mencakup Scope 1, 2, dan 3:
* **⚡ Listrik (Scope 2):** Menggunakan faktor emisi grid spesifik per provinsi di Indonesia.
* **🔥 Energi & Transportasi (Scope 1):** Perhitungan berbasis liter bahan bakar dengan faktor emisi lengkap   ($CO_2, CH_4, N_2O$).
* **🗑️ Limbah (Scope 3):** Metodologi kompleks menggunakan standar **IPCC First Order Decay** untuk TPA, serta perhitungan spesifik untuk Insinerasi, Open Burning, dan Pengolahan Biologis (Kompos/Biogas). Input dalam kg, output otomatis terkonversi ke Ton $CO_2e$.

### 2. 🗺️ Peta Sebaran & GIS Interaktif
* **Landing Page Map:** Visualisasi data emisi nasional (Sumber: SIPONGI Kemenhut 2024) dan sebaran partisipan program (Hotel, Tur, Atraksi) di berbagai kota besar.
* **Dashboard Map:** Peta analisis mendalam untuk pengguna terdaftar.

### 3. 🏢 Dashboard Manajemen Terpadu
* **User Dashboard:** Pantau tren penurunan emisi bulanan, kelola profil usaha, dan akses riwayat laporan.
* **Sistem Notifikasi:** Fitur "Inbox" untuk menerima pengumuman broadcast dari admin atau pesan verifikasi personal.
* **Auto-Save Draft:** Formulir cerdas yang menyimpan data input secara otomatis di browser (*local storage*), mencegah kehilangan data saat berpindah halaman.

### 4. 🎓 Edukasi & Rantai Pasok
* **Pusat Pembelajaran:** Modul video dan dokumen panduan teknis dekarbonisasi.
* **Direktori Pemasok Hijau:** Database vendor penyedia solusi berkelanjutan (energi terbarukan, pengelolaan sampah) yang terverifikasi.

---

## 🛠️ Teknologi (Tech Stack)

Aplikasi ini dibangun dengan arsitektur modern yang mengutamakan performa, keamanan, dan skalabilitas:

* **Frontend:** [Next.js 15](https://nextjs.org/) (App Router) - Framework React mutakhir.
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework.
* **Backend & Auth:** [Supabase](https://supabase.com/) - Database PostgreSQL, Autentikasi, dan Storage.
* **Peta & GIS:** [React Leaflet](https://react-leaflet.js.org/) & Leaflet.js.
* **Visualisasi Data:** [Recharts](https://recharts.org/) - Grafik statistik interaktif.
* **PDF Generation:** `jspdf` & `jspdf-autotable` untuk sertifikat dan laporan otomatis.
* **Icons:** Kustom SVG Icons (Heroicons style).

---

## 📂 Struktur Folder Utama

Berikut adalah gambaran struktur proyek untuk memudahkan navigasi pengembangan:

```bash
├── app/
│   ├── components/         # 🧩 Komponen UI Reusable
│   │   ├── CarbonCalculator.jsx    # Core Logic: Kalkulator Emisi (IPCC)
│   │   ├── LandingPageMap.jsx      # Peta Publik (SIPONGI & Peserta)
│   │   ├── Dashboard.jsx           # Layout Utama Dashboard User/Admin
│   │   ├── EmissionMap.jsx         # Peta Analisis Internal
│   │   └── ... (Komponen Halaman Lain)
│   │
│   ├── hooks/              # 🪝 Custom React Hooks
│   │   └── usePersistedState.js    # Logika Auto-Save/Caching Form
│   │
│   ├── lib/                # ⚙️ Utilitas & Helper Functions
│   │   ├── generatePdf.js          # Generator Laporan PDF
│   │   └── locationData.js         # Data Statis Wilayah
│   │
│   ├── layout.js           # Root Layout (Font, Metadata)
│   └── page.jsx            # Entry Point (Landing Page Wrapper)
│
├── public/
│   ├── data/               # 💾 Dataset Statis
│   │   ├── emisiCO2.json           # Data Emisi Provinsi (SIPONGI)
│   │   ├── indonesia-provinces.json # Peta GeoJSON Indonesia
│   │   └── ... 
│
└── tailwind.config.js      # Konfigurasi Desain & Warna WIDI
````

-----

## 🚀 Cara Instalasi & Menjalankan (Lokal)

Ikuti langkah berikut untuk menjalankan proyek di komputer Anda:

1.  **Clone Repositori:**

    ```bash
    git clone [https://github.com/username/osp-nextjs.git](https://github.com/username/osp-nextjs.git)
    cd osp-nextjs
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    # atau
    yarn install
    ```

3.  **Konfigurasi Environment Variable:**
    Buat file `.env.local` di root folder dan isi kredensial Supabase Anda:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=[https://your-project-id.supabase.co](https://your-project-id.supabase.co)
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
    ```

4.  **Jalankan Server Development:**

    ```bash
    npm run dev
    ```

    Buka [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) di browser Anda.

-----

**Copyright © 2025 Wise Steps Consulting - Konsultan Pariwisata Indonesia.**
*All Rights Reserved.*
