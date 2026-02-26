"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import {
    HomeIcon, BellIcon, ChartPieIcon, BuildingOfficeIcon,
    DocumentChartBarIcon, PlusCircleIcon, AcademicCapIcon,
    QuestionMarkCircleIcon, BookOpenIcon, PencilIcon,
    DocumentTextIcon, MapIcon
} from '../../components/Icons.jsx';

const commonLinks = [
    { id: 'notifikasi', href: '/dashboard/notifikasi', text: 'Notifikasi', icon: <BellIcon /> },
    { id: 'profil-usaha', href: '/dashboard/profil-usaha', text: 'Profil Usaha', icon: <BuildingOfficeIcon /> },
    { id: 'laporan-emisi', href: '/dashboard/laporan-emisi', text: 'Laporan Emisi', icon: <DocumentChartBarIcon /> },
    { id: 'laporan-keberlanjutan', href: '/dashboard/laporan-keberlanjutan', text: 'Laporan Keberlanjutan', icon: <BookOpenIcon /> },
    { id: 'peta-emisi', href: '/dashboard/peta-emisi', text: 'Peta Emisi', icon: <MapIcon /> },
    { id: 'supply-chain', href: '/dashboard/supply-chain', text: 'Supply Chain Inventory', icon: <DocumentTextIcon /> },
    { id: 'sertifikasi', href: '/dashboard/sertifikasi', text: 'Sertifikasi', icon: <PlusCircleIcon /> },
    { id: 'pembelajaran', href: '/dashboard/pembelajaran', text: 'Pembelajaran', icon: <AcademicCapIcon /> },
    { id: 'panduan', href: '/dashboard/panduan', text: 'Panduan', icon: <QuestionMarkCircleIcon /> },
];

const adminHiddenLinks = ['profil-usaha', 'laporan-emisi', 'sertifikasi', 'panduan', 'pembelajaran', 'peta-emisi', 'supply-chain'];

export default function Sidebar({ isOpen, onClose }) {
    const pathname = usePathname();
    const { isAdmin, handleLogout } = useAuth();

    const logoWiseSteps = "/WSG_Masterfiles_Logo-02-1024x264 (1).png";
    const logoKemenpar = "/Kementerian-Pariwisata-RI_Bahasa-Indonesia-Putih.png";

    const sidebarLinks = isAdmin
        ? [
            { id: 'admin-dashboard', href: '/dashboard/admin', text: 'Dasbor Admin', icon: <HomeIcon /> },
            { id: 'admin-verification', href: '/dashboard/admin/verifikasi', text: 'Verifikasi Laporan', icon: <DocumentChartBarIcon /> },
            ...commonLinks.filter(link => !adminHiddenLinks.includes(link.id)),
            { id: 'admin-learning', href: '/dashboard/admin/pembelajaran', text: 'Kelola Pembelajaran', icon: <PencilIcon /> },
            { id: 'admin-supply-chain', href: '/dashboard/admin/supply-chain', text: 'Kelola Pemasok', icon: <BuildingOfficeIcon /> },
        ]
        : [
            { id: 'beranda', href: '/dashboard', text: 'Beranda', icon: <HomeIcon /> },
            { id: 'dashboard-utama', href: '/dashboard/ringkasan', text: 'Dasbor Utama', icon: <ChartPieIcon /> },
            ...commonLinks,
        ];

    // Check if a link is active based on pathname
    const isActive = (href) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Backdrop overlay — mobile only */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
                    fixed top-0 left-0 z-50 flex flex-col h-screen p-5 w-64 text-white
                    transition-transform duration-300 ease-in-out
                    lg:translate-x-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
                style={{ backgroundColor: '#22543d' }}
            >
                {/* Close button — mobile only */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 lg:hidden text-white/70 hover:text-white p-1"
                    aria-label="Tutup sidebar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="pb-5 mb-3 border-b border-white/20">
                    <div className="flex items-center gap-3">
                        <img
                            src={logoWiseSteps}
                            alt="Wise Steps Consulting Logo"
                            className="h-7 object-contain"
                            style={{ filter: 'brightness(0) invert(1)' }}
                        />
                        <img src={logoKemenpar} alt="Logo Kemenpar" className="h-8 object-contain" />
                    </div>
                </div>

                <nav className="flex flex-col flex-grow gap-1 overflow-y-auto -mr-2 pr-2">
                    {sidebarLinks.map(link => (
                        <Link
                            key={link.id}
                            href={link.href}
                            className={`flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(link.href)
                                ? 'bg-white/10 text-white font-semibold'
                                : 'text-white/70 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            {link.icon}
                            <span>{link.text}</span>
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto pt-3 border-t border-white/20">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full gap-3 p-2.5 text-sm font-medium text-red-400 rounded-lg hover:bg-red-500/20 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1 1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
