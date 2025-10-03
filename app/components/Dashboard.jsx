import EmissionReportPage from './EmissionReportPage'; // Impor komponen baru
import {
HomeIcon, BellIcon, ChartPieIcon, BuildingOfficeIcon,
DocumentChartBarIcon, PlusCircleIcon, AcademicCapIcon,
QuestionMarkCircleIcon, UserCircleIcon
} from './Icons.jsx';

// Komponen Dasbor (Diperbarui dengan struktur halaman baru)
export default function Dashboard({
supabase,
user,
activeDashboardPage,
setActiveDashboardPage,
isUserMenuOpen,
setIsUserMenuOpen,
userMenuRef,
handleLogout
}) {

const sidebarLinks = [
    { id: 'beranda', text: 'Beranda', icon: <HomeIcon /> },
    { id: 'notifikasi', text: 'Notifikasi', icon: <BellIcon /> },
    { id: 'dashboard-utama', text: 'Dasbor Utama', icon: <ChartPieIcon /> },
    { id: 'profil-usaha', text: 'Profil Usaha', icon: <BuildingOfficeIcon /> },
    { id: 'laporan-emisi', text: 'Laporan Emisi', icon: <DocumentChartBarIcon /> },
    { id: 'sertifikasi', text: 'Sertifikasi', icon: <PlusCircleIcon /> },
    { id: 'pembelajaran', text: 'Pembelajaran', icon: <AcademicCapIcon /> },
    { id: 'panduan', text: 'Panduan', icon: <QuestionMarkCircleIcon /> },
];

const PageContent = () => {
    switch (activeDashboardPage) {
        case 'beranda':
            return <div>
                <h1 className="text-3xl font-bold">Selamat datang kembali!</h1>
                <p className="text-slate-600 mt-2">Anda masuk sebagai: <span className="font-mono text-sm bg-slate-200 p-1 rounded">{user?.email}</span></p>
            </div>;
        case 'dashboard-utama':
            return (
                <div>
                    <h1 className="text-3xl font-bold mb-6">Visualisasi Data Emisi</h1>
                    <div className="bg-white p-8 rounded-xl shadow-md border text-center">
                        <p className="text-slate-500">Grafik dan ringkasan data emisi bulanan akan ditampilkan di sini.</p>
                    </div>
                </div>
            );
        case 'laporan-emisi':
            // Gunakan komponen "wadah" yang baru
            return <EmissionReportPage supabase={supabase} user={user} />;
        case 'notifikasi':
        case 'profil-usaha':
        case 'sertifikasi':
        case 'pembelajaran':
        case 'panduan':
            return <div className="bg-white p-8 rounded-xl shadow-md border text-center">
                <h2 className="text-2xl font-bold mb-4">Halaman dalam Pengembangan</h2>
                <p className="text-slate-500">Fitur untuk "{sidebarLinks.find(link => link.id === activeDashboardPage)?.text}" sedang kami siapkan.</p>
            </div>;
        default:
            return <div>Halaman tidak ditemukan.</div>;
    }
}

const pageTitle = sidebarLinks.find(link => link.id === activeDashboardPage)?.text || 'Dasbor';

return (
    <div id="app-wrapper" className="flex min-h-screen">
        <aside className="fixed top-0 left-0 z-40 flex flex-col h-screen p-6 bg-white border-r w-64 border-slate-200">
            <div className="pb-6 mb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <img src="https://cdn-biofo.nitrocdn.com/pguRNgUGRHgHBjvClHTnuzLuMOCPhzJi/assets/images/optimized/rev-a721222/wisestepsconsulting.id/wp-content/uploads/2022/09/WSG_Masterfiles_Logo-02-1024x264.png" alt="Wise Steps Consulting Logo" className="h-9" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fc/Lambang_Kementerian_Pariwisata_Republik_Indonesia_%282024%29.png" alt="Logo Kemenpar" className="h-10" />
                </div>
            </div>
            <nav className="flex flex-col flex-grow gap-1">
                {sidebarLinks.map(link => (
                    <button
                        key={link.id}
                        onClick={() => setActiveDashboardPage(link.id)}
                        className={`flex items-center gap-4 p-3 rounded-lg text-sm font-medium transition-colors ${activeDashboardPage === link.id ? 'bg-emerald-100 text-[#348567] font-semibold' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        {link.icon}
                        <span>{link.text}</span>
                    </button>
                ))}
            </nav>
            <div className="mt-auto">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full gap-4 p-3 text-sm font-medium text-red-500 rounded-lg hover:bg-red-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
        <div className="flex flex-col flex-1 w-full ml-64">
            <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-10 bg-white border-b border-slate-200">
                <h2 className="text-2xl font-bold">{pageTitle}</h2>
                <div className="relative" ref={userMenuRef}>
                    <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:bg-slate-100">
                        <UserCircleIcon />
                    </button>
                    {isUserMenuOpen && (
                        <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tentang Dashboard</a>
                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Akun</a>
                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">FAQ</a>
                            </div>
                        </div>
                    )}
                </div>
            </header>
            <main className="flex-1 p-10 overflow-y-auto bg-slate-50">
                <PageContent />
            </main>
        </div>
    </div>
);

}