"use client";

// MODIFIKASI: Tambahkan 'useRef'
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { BookOpenIcon, DashboardIcon, HandshakeIcon, IncentiveIcon, InstagramIcon, LinkedinIcon, FacebookIcon } from './Icons.jsx';

// Dynamic import untuk komponen peta, dengan SSR dinonaktifkan
const EmissionMap = dynamic(() => import('./EmissionMap'), { 
    ssr: false,
    loading: () => <div className="h-[500px] bg-zinc-200 rounded-lg animate-pulse flex items-center justify-center">Memuat Peta...</div>
});

// === KOMPONEN BARU UNTUK KARTU FITUR (DIPERBAIKI) ===
function FeatureCard({ icon, title, description, delay }) {
    const cardRef = useRef(null);
    const [style, setStyle] = useState({});

    // Definisikan transisi scroll-in di satu tempat
    const scrollInTransition = `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`;

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;

        const card = cardRef.current;
        const { width, height, top, left } = card.getBoundingClientRect();
        
        const mouseX = e.clientX - left;
        const mouseY = e.clientY - top;

        const percX = (mouseX / width) - 0.5;
        const percY = (mouseY / height) - 0.5;

        const maxRotation = 8; 
        const rotateY = percX * maxRotation;
        const rotateX = -1 * percY * maxRotation; 

        setStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05) translateY(-4px)`,
            // FIX: Gabungkan transisi scroll-in (untuk opacity) 
            // dengan transisi mouse-move (untuk transform) yang cepat dan tanpa delay.
            transition: `opacity 0.6s ease-out ${delay}s, transform 0.1s ease-out 0s`
        });
    };

    const handleMouseLeave = () => {
        setStyle({
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0px)',
            // FIX: Gabungkan transisi scroll-in (untuk opacity) 
            // dengan transisi mouse-leave (untuk transform) yang lambat dan tanpa delay.
            transition: `opacity 0.6s ease-out ${delay}s, transform 0.5s ease-in-out 0s`
        });
    };

    return (
        <div 
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ 
                // FIX: Terapkan transisi scroll-in awal
                transition: scrollInTransition,
                // ...style akan menimpa 'transition' ini saat mouse bergerak,
                // yang mana sudah kita siapkan di handleMouseMove/Leave
                ...style 
            }}
            className="bg-white p-8 rounded-xl shadow-sm text-left border hover:shadow-lg transition-all duration-300 scroll-animate"
        >
            <div style={{color: '#22543d'}} className="mb-4">{icon}</div>
            <h3 className={`text-xl font-bold mb-2 text-zinc-800`}>{title}</h3>
            <p className={`text-zinc-600 leading-relaxed`}>{description}</p>
        </div>
    );
}
// === AKHIR KOMPONEN BARU ===
// === AKHIR KOMPONEN BARU ===


export default function LandingPage({ setActivePage, setIsLogin }) {
    const [isScrolled, setIsScrolled] = useState(false);

    // URL Logo
    const logoKemenparPutih = "https://bob.kemenparekraf.go.id/wp-content/uploads/2025/02/Kementerian-Pariwisata-RI_Bahasa-Indonesia-Putih.png";
    const logoKemenparBerwarna = "https://upload.wikimedia.org/wikipedia/commons/f/fc/Lambang_Kementerian_Pariwisata_Republik_Indonesia_%282024%29.png";
    const logoWiseSteps = "https://github.com/rahadianMs/gstc-fix/blob/main/asset/WSG_Masterfiles_Logo-02-1024x264.png?raw=true";

    // Efek untuk header
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Efek Intersection Observer (Animasi saat scroll)
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); 
                }
            });
        }, {
            rootMargin: '0px',
            threshold: 0.1 
        });

        const elements = document.querySelectorAll('.scroll-animate');
        elements.forEach(el => observer.observe(el));

        return () => {
            elements.forEach(el => observer.unobserve(el));
        };
    }, []); 

    const handleGoToAuth = (showLogin) => {
        setIsLogin(showLogin);
        setActivePage('auth');
    };

    // Palet Warna Profesional Baru
    const colors = {
        primary: 'zinc-800', // Teks utama
        secondary: 'zinc-600', // Teks sekunder
        brand: '#22543d', // Hijau tua profesional
        brandHover: '#1c4532',
        accent: '#c89c49', // Aksen Emas/Ochre
        accentHover: '#b38b40'
    };

    const featureCards = [
        { icon: <DashboardIcon />, title: "Dashboard Pemantauan Emisi", description: "Hitung dan lacak jejak karbon bisnis Anda secara akurat melalui dasbor interaktif." },
        { icon: <BookOpenIcon />, title: "Pusat Edukasi Terpadu", description: "Akses materi pembelajaran dan panduan praktik rendah emisi untuk pariwisata." },
        { icon: <HandshakeIcon />, title: "Kolaborasi Vendor Berkelanjutan", description: "Temukan dan terhubung dengan penyedia solusi dan produk ramah lingkungan." },
        { icon: <IncentiveIcon />, title: "Insentif Keikutsertaan", description: "Dapatkan pengakuan, akses pasar, dan dukungan kebijakan sebagai pionir pariwisata hijau." },
    ];

    const participantLogos = [
        { name: "InJourney", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Logo_InJourney.svg/2560px-Logo_InJourney.svg.png", heightClass: "h-14" },
        { name: "Traveloka", url: "https://ik.imagekit.io/tvlk/image/imageResource/2024/08/09/1723192761223-35bd6fefad235fbb690b6d79b050343f.png?tr=q-75", heightClass: "h-24" },
        { name: "Exo Travel", url: "https://www.exotravel.com/images/w3_images/logo222.png", heightClass: "h-16" },
        { name: "Tiket.com", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Tiket.com_logo.png/1200px-Tiket.com_logo.png", heightClass: "h-12" },
        { name: "Ekosistem Hotels", url: "https://images.glints.com/unsafe/glints-dashboard.oss-ap-southeast-1.aliyuncs.com/company-logo/f983fb3ffcdf2510d5529deafaccfc27.png", heightClass: "h-20" },
    ];

     const scopeCards = [
        { title: "Akomodasi", imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?fm=jpg&q=60&w=3000&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YmFsaSUyMGhvdGVsfGVufDB8fDB8fHww" },
        { title: "Operator Jasa Perjalanan", imageUrl: "https://images.unsplash.com/photo-1616895727759-dd84a2690433?q=80&w=1170&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
        { title: "Pengelola Atraksi Wisata", imageUrl: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=1171&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }
    ];

    return (
        <>
            <style jsx global>{`
                html {
                  scroll-behavior: smooth;
                }
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
                .logo-white {
                    filter: brightness(0) invert(1) grayscale(1);
                }

                /* === ANIMASI PAGE LOAD (HANYA UNTUK HERO) === */
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-on-load {
                    opacity: 0;
                    animation-fill-mode: forwards;
                }
                .fade-in-up {
                    animation-name: fadeInUp;
                    animation-duration: 0.7s;
                    animation-timing-function: ease-out;
                }
                .fade-in {
                    animation-name: fadeIn;
                    animation-duration: 0.7s;
                    animation-timing-function: ease-out;
                }
                
                /* === ANIMASI SCROLL DINAMIS (UNTUK KONTEN DI BAWAH) === */
                .scroll-animate {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
                    will-change: opacity, transform; 
                }
                
                .scroll-animate.is-visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                /* Utility classes untuk delay */
                .delay-100 { animation-delay: 0.1s; transition-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; transition-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; transition-delay: 0.3s; }
                .delay-500 { animation-delay: 0.5s; transition-delay: 0.5s; }
            `}</style>
            <div id="landing-page" className={`bg-white text-${colors.primary}`}>
                <header className={`fixed top-0 left-0 z-50 w-full px-[5%] py-4 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
                    {/* ... (Konten header tidak berubah) ... */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img 
                                src={logoWiseSteps} 
                                alt="Wise Steps Consulting Logo" 
                                className={`h-8 md:h-9 transition-all duration-300 ${!isScrolled && 'logo-white'}`} 
                            />
                            <img 
                                src={isScrolled ? logoKemenparBerwarna : logoKemenparPutih} 
                                alt="Kemenparekraf Logo" 
                                className="h-9 md:h-10" 
                            />
                        </div>
                        <nav className="hidden md:flex items-center gap-8">
                            <a href="#home" className={`font-medium transition-colors duration-200 ${isScrolled ? `text-${colors.secondary} hover:text-[${colors.brand}]` : 'text-white hover:opacity-80'}`}>Home</a>
                            <a href="#about" className={`font-medium transition-colors duration-200 ${isScrolled ? `text-${colors.secondary} hover:text-[${colors.brand}]` : 'text-white hover:opacity-80'}`}>Tentang</a>
                            <a href="#features" className={`font-medium transition-colors duration-200 ${isScrolled ? `text-${colors.secondary} hover:text-[${colors.brand}]` : 'text-white hover:opacity-80'}`}>Fitur</a>
                            <a href="#map" className={`font-medium transition-colors duration-200 ${isScrolled ? `text-${colors.secondary} hover:text-[${colors.brand}]` : 'text-white hover:opacity-80'}`}>Peta</a>
                            <button onClick={() => handleGoToAuth(true)} className={`px-5 py-2 font-semibold border-2 rounded-lg transition-all duration-300 ${isScrolled ? `text-[${colors.brand}] border-[${colors.brand}] hover:bg-green-50` : 'text-white border-white hover:bg-white/10'}`}>
                                Login
                            </button>
                        </nav>
                    </div>
                </header>

                <main id="home" className="relative flex items-center min-h-screen px-[5%] py-24 text-white bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1608387371413-f2566ac510e0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170')" }}>
                    {/* ... (Konten main hero tidak berubah) ... */}
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    <div className="relative z-10 max-w-2xl text-left">
                        <p className="mb-4 text-lg md:text-xl opacity-95 animate-on-load fade-in-up delay-100">Selamat datang di “Wonderful Indonesia Net Zero Hub”</p>
                        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-8 drop-shadow-lg animate-on-load fade-in-up delay-300">Menuju Pariwisata Rendah Karbon dan Berkelanjutan</h1>
                        <button onClick={() => handleGoToAuth(false)} style={{ backgroundColor: colors.accent }} className={`px-8 py-4 text-lg font-semibold text-white rounded-lg shadow-xl hover:bg-[${colors.accentHover}] transform hover:-translate-y-1 transition-all duration-300 animate-on-load fade-in-up delay-500`}>
                            Daftar / Registrasi
                        </button>
                    </div>
                </main>

                <section id="about" className="py-24 px-[5%]">
                    {/* ... (Konten about tidak berubah) ... */}
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-16">
                             <h2 className={`text-4xl md:text-5xl font-bold text-${colors.primary} scroll-animate`}>Tentang Wonderful Indonesia Net Zero Hub</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <div className="scroll-animate delay-200">
                                <img src="https://www.aman.com/sites/default/files/2021-03/Aman_Amanjiwo_Gallery_1.jpg" alt="Amanjiwo Resort" className="rounded-2xl shadow-lg w-full object-cover aspect-[4/3]" />
                            </div>
                            <div className="space-y-6 scroll-animate delay-300">
                                <div>
                                    <h3 className={`text-2xl font-bold text-${colors.primary} mb-3`}>Pariwisata Indonesia Menuju Net Zero Emissions</h3>
                                    <p className={`text-${colors.secondary} leading-relaxed text-justify`}>Program ini adalah inisiatif Kementerian Pariwisata Indonesia untuk mewujudkan komitmen sektor dalam Glasgow Declaration, yakni menuju Net Zero Emissions di 2060. Melalui program ini, Kementerian Pariwisata Indonesia berkomitmen untuk berkolaborasi bersama pelaku usaha pariwisata dalam mengukur dan mengurangi jejak karbon di sektor pariwisata.</p>
                                </div>
                                <div>
                                    <h3 className={`text-2xl font-bold text-${colors.primary} mb-3`}>Apa itu ‘WINZ Hub’?</h3>
                                    <p className={`text-${colors.secondary} leading-relaxed text-justify`}>Wonderful Indonesia Net Zero Hub (WINZ Hub) adalah sebuah platform nasional yang dikembangkan untuk mendukung transformasi pariwisata Indonesia dalam mengurangi jejak karbon. WINZ Hub berfungsi sebagai pusat data, wadah pengembangan upaya rendah emisi, dan kolaborasi lintas aktor dalam mengukur, melaporkan, serta mengurangi emisi karbon di sektor pariwisata.</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-24">
                             <h3 className={`text-3xl font-bold text-${colors.primary} mb-12 text-center scroll-animate`}>Lingkup Usaha</h3>
                             <div className="grid md:grid-cols-3 gap-8">
                                {scopeCards.map((card, index) => (
                                    <div 
                                        key={card.title} 
                                        className="relative rounded-xl overflow-hidden shadow-lg h-80 group scroll-animate"
                                        style={{ transitionDelay: `${0.2 + index * 0.15}s` }} 
                                    >
                                        <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 p-6">
                                            <h4 className="text-2xl font-bold text-white">{card.title}</h4>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </section>
                
                <section id="map" className="py-24 px-[5%] bg-white">
                    {/* ... (Konten map tidak berubah) ... */}
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-16">
                            <h2 className={`text-4xl md:text-5xl font-bold text-${colors.primary} scroll-animate`}>Peta Sebaran Emisi Karbon</h2>
                            <p className={`text-lg text-${colors.secondary} mt-4 max-w-3xl mx-auto scroll-animate delay-200`}>Visualisasi data emisi CO2 dari sektor pariwisata di berbagai provinsi di Indonesia. Arahkan kursor pada sebuah provinsi untuk melihat detail.</p>
                        </div>
                        <EmissionMap />
                    </div>
                </section>

                {/* --- FEATURES SECTION: MODIFIKASI --- */}
                <section id="features" className="py-24 px-[5%] bg-zinc-50">
                    <div className="container mx-auto max-w-6xl text-center">
                        <span className="font-semibold scroll-animate" style={{color: colors.brand}}>Fitur Utama</span>
                        <h2 className={`text-4xl font-bold text-${colors.primary} mt-2 mb-16 scroll-animate delay-100`}>Semua yang Anda Butuhkan untuk Transformasi Hijau</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {/* MODIFIKASI: 
                                Menggunakan komponen 'FeatureCard' baru
                                menggantikan 'div' inline sebelumnya.
                            */}
                            {featureCards.map((card, index) => (
                                <FeatureCard 
                                    key={card.title} 
                                    icon={card.icon}
                                    title={card.title}
                                    description={card.description}
                                    delay={0.1 + index * 0.15} // Kirim delay sebagai prop
                                />
                            ))}
                        </div>
                    </div>
                </section>
                
                <section id="participant-list-section" className="relative py-24 bg-center bg-cover" style={{ backgroundImage: "url('https://myoona.id/content/dam/oona/aem-images/blog/liburan-labuan-bajo-risiko-perjalanan-domestik-banner.webp')" }}>
                    {/* ... (Konten participant-list tidak berubah) ... */}
                    <div className="absolute inset-0 bg-black opacity-70"></div>
                    <div className="relative z-10 container mx-auto text-center">
                        <h2 className="text-4xl font-bold text-white mb-4 scroll-animate">Didukung dan Diikuti Oleh</h2>
                        <p className="text-white/80 max-w-2xl mx-auto mb-16 scroll-animate delay-200">Bergabunglah dengan jaringan bisnis dan inisiatif pariwisata yang telah berkomitmen pada keberlanjutan.</p>
                        <div className="relative w-full overflow-hidden">
                            <div className="flex animate-marquee">
                                {[...participantLogos, ...participantLogos].map((logo, index) => (
                                    <div key={index} className="flex-shrink-0 w-64 flex justify-center items-center mx-4"> 
                                        <img src={logo.url} alt={logo.name} className={`${logo.heightClass} object-contain filter grayscale brightness-0 invert hover:grayscale-0 hover:brightness-100 hover:invert-0 transition-all duration-300`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="glasgow-portal" className="py-20 px-[5%] bg-zinc-100">
                    {/* ... (Konten glasgow-portal tidak berubah) ... */}
                    <div className="container mx-auto max-w-4xl bg-white p-10 rounded-2xl shadow-lg border flex flex-col md:flex-row items-center gap-8 text-center md:text-left scroll-animate">
                        <div className="flex-shrink-0">
                            <img src="https://kindlejourneys.com/files/Recurso-2-e1635510867617.png" alt="Glasgow Declaration Logo" className="h-24" />
                        </div>
                        <div>
                            <h3 className={`text-2xl font-bold text-${colors.primary}`}>Bagian dari Komitmen Global</h3>
                            <p className={`text-${colors.secondary} mt-2 mb-4`}>Program ini merupakan bagian dari komitmen Indonesia dalam 'Deklarasi Glasgow tentang Aksi Iklim di Sektor Pariwisata'. Pelajari lebih lanjut tentang inisiatif global ini.</p>
                            <a href="https://www.glasgowdeclaration.org/" target="_blank" rel="noopener noreferrer" style={{backgroundColor: colors.brand}} className={`inline-block font-semibold text-white rounded-lg px-6 py-3 hover:bg-[${colors.brandHover}] transition-colors`}>
                                Kunjungi Portal Glasgow Declaration
                            </a>
                        </div>
                    </div>
                </section>

                <footer style={{backgroundColor: colors.brand}} className="text-white/80 py-16 px-[5%]">
                    {/* ... (Konten footer tidak berubah) ... */}
                    <div className="container mx-auto max-w-6xl">
                         <div className="grid md:grid-cols-12 gap-12">
                            <div className="md:col-span-4">
                                <img src={logoKemenparPutih} alt="Logo Kemenpar" className="h-16 mb-4"/>
                                <h3 className="text-white text-xl font-semibold mb-2">Kementerian Pariwisata Republik Indonesia</h3>
                                <p className="text-sm max-w-sm">Jl. Medan Merdeka Barat No. 17, RT/RW 02/03, Gambir, Daerah Khusus Ibukota Jakarta 10110, Indonesia.</p>
                            </div>
                            <div className="md:col-span-4 text-sm">
                                <h4 className="text-white font-semibold mb-4 text-base">Kontak</h4>
                                <p>Whatsapp Contact Center: 0811-895-6767</p>
                                <p className="mt-2">Email: info@kemenpar.go.id</p>
                            </div>
                            <div className="md:col-span-4">
                                <h4 className="text-white font-semibold mb-4 text-base">Ikuti Kami</h4>
                                <div className="flex items-center gap-5">
                                    <a href="https://www.instagram.com/kemenpar.ri/?hl=en" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><InstagramIcon className="w-6 h-6" /></a>
                                    <a href="https://www.linkedin.com/company/ministry-of-tourism-and-creative-economy/?originalSubdomain=id" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><LinkedinIcon className="w-6 h-6" /></a>
                                    <a href="https://web.facebook.com/KemenPariwisata/?_rdc=1&_rdr" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><FacebookIcon className="w-6 h-6" /></a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-white/20 mt-12 pt-8 text-center text-sm text-white/60">
                        <p>Copyright ©2025 Wise Steps Consulting - Konsultan Pariwisata Indonesia. All Rights Reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}