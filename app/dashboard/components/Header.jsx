"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import { UserCircleIcon } from '../../components/Icons.jsx';

// Map pathname to page title
const pageTitles = {
    '/dashboard': 'Beranda',
    '/dashboard/ringkasan': 'Dasbor Utama',
    '/dashboard/notifikasi': 'Notifikasi',
    '/dashboard/profil-usaha': 'Profil Usaha',
    '/dashboard/laporan-emisi': 'Laporan Emisi',
    '/dashboard/laporan-keberlanjutan': 'Laporan Keberlanjutan',
    '/dashboard/peta-emisi': 'Peta Sebaran Emisi',
    '/dashboard/supply-chain': 'Direktori Pemasok Berkelanjutan',
    '/dashboard/sertifikasi': 'Sertifikasi',
    '/dashboard/pembelajaran': 'Pembelajaran',
    '/dashboard/panduan': 'Panduan',
    '/dashboard/akun': 'Edit Akun & Profil',
    '/dashboard/tentang': 'Tentang',
    '/dashboard/faq': 'FAQ',
    '/dashboard/admin': 'Dasbor Admin',
    '/dashboard/admin/verifikasi': 'Verifikasi & Validasi Laporan',
    '/dashboard/admin/pembelajaran': 'Kelola Pembelajaran',
    '/dashboard/admin/supply-chain': 'Kelola Pemasok Berkelanjutan',
};

export default function Header({ onMenuToggle }) {
    const pathname = usePathname();
    const { user } = useAuth();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    // Close menu on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close menu on route change
    useEffect(() => {
        setIsUserMenuOpen(false);
    }, [pathname]);

    // Determine page title from pathname
    const getPageTitle = () => {
        // Check for dynamic routes (e.g., /dashboard/pembelajaran/xxx)
        if (pathname.startsWith('/dashboard/pembelajaran/') && pathname !== '/dashboard/pembelajaran') {
            return 'Detail Materi';
        }
        return pageTitles[pathname] || 'Dasbor';
    };

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 md:h-16 px-4 md:px-6 lg:px-10 bg-white border-b border-slate-200">
            <div className="flex items-center gap-3">
                {/* Hamburger button — mobile only */}
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden p-2 -ml-2 rounded-md text-slate-600 hover:bg-slate-100"
                    aria-label="Toggle navigasi"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <h2 className="text-lg md:text-2xl font-bold truncate">{getPageTitle()}</h2>
            </div>

            <div className="relative" ref={userMenuRef}>
                <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full text-slate-500 hover:bg-slate-100"
                >
                    <UserCircleIcon />
                </button>
                {isUserMenuOpen && (
                    <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                            <Link href="/dashboard/akun" className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Akun
                            </Link>
                            <Link href="/dashboard/tentang" className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Tentang
                            </Link>
                            <Link href="/dashboard/faq" className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                FAQ
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
