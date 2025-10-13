export const provinces = [
    { id: '11', name: 'ACEH' },
    { id: '12', name: 'SUMATERA UTARA' },
    { id: '13', name: 'SUMATERA BARAT' },
    { id: '14', name: 'RIAU' },
    { id: '15', name: 'JAMBI' },
    { id: '16', name: 'SUMATERA SELATAN' },
    { id: '17', name: 'BENGKULU' },
    { id: '18', name: 'LAMPUNG' },
    { id: '19', name: 'KEPULAUAN BANGKA BELITUNG' },
    { id: '21', name: 'KEPULAUAN RIAU' },
    { id: '31', name: 'DKI JAKARTA' },
    { id: '32', name: 'JAWA BARAT' },
    { id: '33', name: 'JAWA TENGAH' },
    { id: '34', name: 'DI YOGYAKARTA' },
    { id: '35', name: 'JAWA TIMUR' },
    { id: '36', name: 'BANTEN' },
    { id: '51', name: 'BALI' },
    { id: '52', name: 'NUSA TENGGARA BARAT' },
    { id: '53', name: 'NUSA TENGGARA TIMUR' },
    { id: '61', name: 'KALIMANTAN BARAT' },
    { id: '62', name: 'KALIMANTAN TENGAH' },
    { id: '63', name: 'KALIMANTAN SELATAN' },
    { id: '64', name: 'KALIMANTAN TIMUR' },
    { id: '65', name: 'KALIMANTAN UTARA' },
    { id: '71', name: 'SULAWESI UTARA' },
    { id: '72', name: 'SULAWESI TENGAH' },
    { id: '73', name: 'SULAWESI SELATAN' },
    { id: '74', name: 'SULAWESI TENGGARA' },
    { id: '75', name: 'GORONTALO' },
    { id: '76', name: 'SULAWESI BARAT' },
    { id: '81', name: 'MALUKU' },
    { id: '82', name: 'MALUKU UTARA' },
    { id: '91', name: 'PAPUA BARAT' },
    { id: '92', name: 'PAPUA' },
    { id: '93', name: 'PAPUA TENGAH' },
    { id: '94', name: 'PAPUA PEGUNUNGAN' },
    { id: '95', name: 'PAPUA SELATAN' },
    { id: '96', name: 'PAPUA BARAT DAYA' },
];

export const regencies = {
    '11': [ { id: '1101', name: 'KABUPATEN SIMEULUE' }, /* ... data lainnya */ ],
    // Data kabupaten lain akan ditambahkan di sini...
    // Karena datanya sangat banyak, kita akan memuatnya secara dinamis dari API lain
    // hanya jika diperlukan, atau idealnya, data ini ada di database Anda.
    // Untuk saat ini, kita akan gunakan fetch dari API di dalam komponen.
};

// Fungsi helper untuk mengambil data kabupaten
export const getRegenciesByProvinceId = async (provinceId) => {
    if (!provinceId) return [];
    try {
        const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/kota/${provinceId}.json`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Gagal mengambil data kabupaten:", error);
        return [];
    }
};