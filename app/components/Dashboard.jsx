"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Impor semua komponen halaman
import BerandaPage from './BerandaPage';
import EmissionReportPage from './EmissionReportPage';
import DashboardSummary from './DashboardSummary';
import DashboardPieChart from './DashboardPieChart';
import DashboardTrends from './DashboardTrends';
import ProfilUsahaPage from './ProfilUsahaPage';
import NotificationPage from './NotificationPage';
import AboutPage from './AboutPage';
import AccountPage from './AccountPage';
import FaqPage from './FaqPage'; // Pastikan file ini ada
import SertifikasiPage from './SertifikasiPage';
import PembelajaranPage from './PembelajaranPage';
import PanduanPage from './PanduanPage';
import SustainabilityPage from './SustainabilityPage';
import PetaEmisiPage from './PetaEmisiPage'; 
import SupplyChainPage from './SupplyChainPage'; 

// Impor halaman Admin
import AdminDashboardPage from './AdminDashboardPage';
import AdminSustainabilityPage from './AdminSustainabilityPage';
import AdminNotificationPage from './AdminNotificationPage'; 
import AdminLearningPage from './AdminLearningPage'; 
import AdminSupplyChainPage from './AdminSupplyChainPage';
// [BARU] Impor halaman Verifikasi
import AdminVerificationPage from './AdminVerificationPage'; 

// Impor halaman detail video
import VideoDetailPage from './VideoDetailPage'; 

// Impor Ikon
import {
    HomeIcon, BellIcon, ChartPieIcon, BuildingOfficeIcon,
    DocumentChartBarIcon, PlusCircleIcon, AcademicCapIcon,
    QuestionMarkCircleIcon, UserCircleIcon, BookOpenIcon,
    PencilIcon,
    PlayCircleIcon, DocumentTextIcon, VideoCameraIcon, ArrowLeftIcon, 
    EyeIcon,
    MapIcon
} from './Icons.jsx';


// Komponen PageContent
const PageContent = ({ 
    activeDashboardPage, setActiveDashboardPage, supabase, user, sidebarLinks, 
    dataVersion, onDataUpdate, userRole, 
    selectedResource, setSelectedResource,
    businessName
}) => {
    switch (activeDashboardPage) {
        case 'beranda':
            if (userRole === 'admin') {
                return <AdminDashboardPage supabase={supabase} user={user} />;
            }
            return <BerandaPage 
                        user={user} 
                        supabase={supabase} 
                        setActiveDashboardPage={setActiveDashboardPage} 
                        dataVersion={dataVersion}
                        initialBusinessName={businessName}
                   />;
        
        case 'dashboard-utama':
            if (userRole === 'admin') {
                return <AdminDashboardPage supabase={supabase} user={user} />;
            }
            return (
                <div className="space-y-8">
                    <DashboardSummary supabase={supabase} user={user} dataVersion={dataVersion} />
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <DashboardTrends supabase={supabase} user={user} dataVersion={dataVersion} />
                        <DashboardPieChart supabase={supabase} user={user} dataVersion={dataVersion} />
                    </div>
                </div>
            );
        
        case 'admin-dashboard':
            return userRole === 'admin' 
                ? <AdminDashboardPage supabase={supabase} user={user} />
                : <BerandaPage 
                    user={user} 
                    supabase={supabase} 
                    setActiveDashboardPage={setActiveDashboardPage} 
                    dataVersion={dataVersion}
                    initialBusinessName={businessName}
                  />; 

        // [BARU] Case untuk Halaman Verifikasi Admin
        case 'admin-verification':
            return userRole === 'admin'
                ? <AdminVerificationPage supabase={supabase} />
                : <div className="flex items-center justify-center h-64 text-slate-500">Akses Ditolak</div>;

        case 'laporan-emisi':
            return <EmissionReportPage supabase={supabase} user={user} onDataUpdate={onDataUpdate} />;
        
        case 'laporan-keberlanjutan':
            return userRole === 'admin'
                ? <AdminSustainabilityPage supabase={supabase} user={user} />
                : <SustainabilityPage supabase={supabase} user={user} />;

        case 'peta-emisi':
            return <PetaEmisiPage />;

        case 'supply-chain': 
            return <SupplyChainPage supabase={supabase} user={user} />;

        case 'notifikasi':
            return userRole === 'admin'
                ? <AdminNotificationPage supabase={supabase} user={user} />
                : <NotificationPage supabase={supabase} user={user} />;

        case 'profil-usaha':
            return <ProfilUsahaPage user={user} supabase={supabase} setActiveDashboardPage={setActiveDashboardPage} />;
        case 'sertifikasi':
            return <SertifikasiPage supabase={supabase} user={user} />;
        
        case 'pembelajaran':
            return <PembelajaranPage 
                        supabase={supabase} 
                        setActiveDashboardPage={setActiveDashboardPage}
                        setSelectedResource={setSelectedResource}
                        userRole={userRole} 
                   />;

        case 'admin-learning':
            return userRole === 'admin'
                ? <AdminLearningPage 
                        supabase={supabase} 
                        setActiveDashboardPage={setActiveDashboardPage}
                  />
                : <PembelajaranPage 
                        supabase={supabase} 
                        setActiveDashboardPage={setActiveDashboardPage}
                        setSelectedResource={setSelectedResource}
                        userRole={userRole}
                   />;

        case 'admin-supply-chain':
            return userRole === 'admin'
                ? <AdminSupplyChainPage supabase={supabase} />
                : <SupplyChainPage supabase={supabase} user={user} />;
        
        case 'video-detail':
            return <VideoDetailPage 
                        selectedResource={selectedResource}
                        setActiveDashboardPage={setActiveDashboardPage}
                   />;
                
        case 'panduan':
            return <PanduanPage />;
        case 'tentang':
            return <AboutPage />;
        case 'akun':
            return <AccountPage user={user} supabase={supabase} />;
            
        // [FIXED] FAQ sekarang merender komponen yang benar
        case 'faq':
            return <FaqPage />;
            
        default:
             return (
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md border text-center">
                    <h2 className="text-2xl font-bold mb-4">Halaman dalam Pengembangan</h2>
                    <p className="text-slate-500">Fitur untuk "{sidebarLinks.find(link => link.id === activeDashboardPage)?.text}" sedang kami siapkan.</p>
                </div>
            );
    }
};

// Komponen Dasbor Utama
export default function Dashboard({
    supabase, user, activeDashboardPage, setActiveDashboardPage,
    isUserMenuOpen, setIsUserMenuOpen, userMenuRef, handleLogout
}) {
    const [dataVersion, setDataVersion] = useState(Date.now());
    const [selectedResource, setSelectedResource] = useState(null);
    const [userProfile, setUserProfile] = useState({ role: null, businessName: '...' });
    const [loadingProfile, setLoadingProfile] = useState(true);
    
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user) {
                try {
                    setLoadingProfile(true);
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('role, business_name')
                        .eq('id', user.id)
                        .single();
                    if (error) throw error;
                    
                    setUserProfile({
                        role: data?.role || 'user',
                        businessName: data?.business_name || user?.user_metadata?.business_name || 'Rekan'
                    });
                    
                } catch (error) {
                    console.error('Error fetching user profile:', error.message);
                    setUserProfile({ role: 'user', businessName: 'Rekan' }); 
                } finally {
                    setLoadingProfile(false);
                }
            }
        };
        fetchUserProfile();
    }, [user, supabase]); 

    const logoKemenparPutih = "https://bob.kemenparekraf.go.id/wp-content/uploads/2025/02/Kementerian-Pariwisata-RI_Bahasa-Indonesia-Putih.png";
    const logoWiseSteps = "https://cdn-lgbgj.nitrocdn.com/ItTrnTtgyWTkOHFuOZYyLNqTCVGqVARe/assets/images/optimized/rev-7dc1829/wisesteps.id/wp-content/uploads/revslider/home-desktop-tablet-12/Wise-Steps-Consulting-Logo-White.png";

    const handleDataUpdate = () => setDataVersion(Date.now());

    const commonLinks = [
        { id: 'notifikasi', text: 'Notifikasi', icon: <BellIcon /> },
        { id: 'profil-usaha', text: 'Profil Usaha', icon: <BuildingOfficeIcon /> },
        { id: 'laporan-emisi', text: 'Laporan Emisi', icon: <DocumentChartBarIcon /> },
        { id: 'laporan-keberlanjutan', text: 'Laporan Keberlanjutan', icon: <BookOpenIcon /> },
        { id: 'peta-emisi', text: 'Peta Emisi', icon: <MapIcon /> },
        { id: 'supply-chain', text: 'Supply Chain Inventory', icon: <DocumentTextIcon /> },
        { id: 'sertifikasi', text: 'Sertifikasi', icon: <PlusCircleIcon /> },
        { id: 'pembelajaran', text: 'Pembelajaran', icon: <AcademicCapIcon /> },
        { id: 'panduan', text: 'Panduan', icon: <QuestionMarkCircleIcon /> },
    ];
    
    // `adminHiddenLinks` menyembunyikan link 'user' dari 'admin'
    const adminHiddenLinks = ['profil-usaha', 'laporan-emisi', 'sertifikasi', 'panduan', 'pembelajaran', 'peta-emisi', 'supply-chain'];

    const sidebarLinks = userProfile.role === 'admin' 
        ? [
            { id: 'admin-dashboard', text: 'Dasbor Admin', icon: <HomeIcon /> },
            
            // [BARU] Menu Verifikasi Laporan
            { id: 'admin-verification', text: 'Verifikasi Laporan', icon: <DocumentChartBarIcon /> },
            
            ...commonLinks.filter(link => !adminHiddenLinks.includes(link.id)),
            
            { id: 'admin-learning', text: 'Kelola Pembelajaran', icon: <PencilIcon /> },
            
            { id: 'admin-supply-chain', text: 'Kelola Pemasok', icon: <BuildingOfficeIcon /> } 
          ]
        : [
            { id: 'beranda', text: 'Beranda', icon: <HomeIcon /> },
            { id: 'dashboard-utama', text: 'Dasbor Utama', icon: <ChartPieIcon /> },
            ...commonLinks
          ];
    
    const getPageTitle = () => {
        const link = sidebarLinks.find(link => link.id === activeDashboardPage);
        if (link) return link.text;
        
        switch (activeDashboardPage) {
            case 'akun': return 'Edit Akun & Profil';
            case 'faq': return 'FAQ';
            case 'tentang': return 'Tentang';
            case 'video-detail': return 'Detail Materi';
            case 'pembelajaran': return 'Pembelajaran';
            case 'peta-emisi': return 'Peta Sebaran Emisi';
            case 'supply-chain': return 'Direktori Pemasok Berkelanjutan'; 
            
            case 'admin-supply-chain': return 'Kelola Pemasok Berkelanjutan';
            // [BARU] Judul Halaman Verifikasi
            case 'admin-verification': return 'Verifikasi & Validasi Laporan';
            
            default: return 'Dasbor';
        }
    };
    const pageTitle = getPageTitle();

    if (loadingProfile) {
        return (
            <div className="flex items-center justify-center min-h-screen w-full bg-slate-50">
                <h2 className="text-xl font-medium text-slate-600">Memuat data pengguna...</h2>
            </div>
        );
    }

    return (
        <div id="app-wrapper" className="flex min-h-screen">
            <aside 
                className="fixed top-0 left-0 z-40 flex flex-col h-screen p-6 w-72 text-white" 
                style={{backgroundColor: '#22543d'}}
            >
               <div className="pb-6 mb-4 border-b border-white/20">
                    <div className="flex items-center gap-4">
                        <img src={logoWiseSteps} alt="Wise Steps Consulting Logo" className="h-8" />
                        <img src={logoKemenparPutih} alt="Logo Kemenpar" className="h-9" />
                    </div>
                </div>
                
                <nav className="flex flex-col flex-grow gap-1 overflow-y-auto">
                    {sidebarLinks.map(link => (
                        <button
                            key={link.id}
                            onClick={() => setActiveDashboardPage(link.id)}
                            className={`flex items-center gap-4 p-3 rounded-lg text-sm font-medium transition-colors ${
                                activeDashboardPage === link.id 
                                ? 'bg-white/10 text-white font-semibold' 
                                : 'text-white/70 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            {link.icon}
                            <span>{link.text}</span>
                        </button>
                    ))}
                </nav>
                <div className="mt-auto pt-4 border-t border-white/20">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full gap-4 p-3 text-sm font-medium text-red-400 rounded-lg hover:bg-red-500/20 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1 1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            <div className="flex flex-col flex-1 w-full ml-72"> 
                <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-10 bg-white border-b border-slate-200">
                    <h2 className="text-2xl font-bold">{pageTitle}</h2>
                    <div className="relative" ref={userMenuRef}>
                        <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:bg-slate-100">
                            <UserCircleIcon />
                        </button>
                        {isUserMenuOpen && (
                            <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                    <button onClick={() => { setActiveDashboardPage('akun'); setIsUserMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Akun</button>
                                    <button onClick={() => { setActiveDashboardPage('tentang'); setIsUserMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tentang</button>
                                    <button onClick={() => { setActiveDashboardPage('faq'); setIsUserMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">FAQ</button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>
                <main className="flex-1 p-10 overflow-y-auto bg-slate-50">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeDashboardPage}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <PageContent
                                activeDashboardPage={activeDashboardPage}
                                setActiveDashboardPage={setActiveDashboardPage}
                                supabase={supabase}
                                user={user}
                                sidebarLinks={sidebarLinks}
                                dataVersion={dataVersion}
                                onDataUpdate={handleDataUpdate}
                                userRole={userProfile.role}
                                businessName={userProfile.businessName}
                                selectedResource={selectedResource}
                                setSelectedResource={setSelectedResource}
                            />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}