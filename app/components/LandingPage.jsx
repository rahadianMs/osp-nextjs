"use client";

import { useState } from 'react';

export default function LandingPage({ setActivePage, setIsLogin }) {
    const [activeTab, setActiveTab] = useState('accomodation');
  const handleGoToAuth = (showLogin) => {
    setIsLogin(showLogin);
    setActivePage('auth');
  };

  return (
    <div id="landing-page" className="bg-white">
       <header className="fixed top-0 left-0 z-50 flex items-center justify-between w-full px-[5%] py-6 bg-[#348567]">
          <div className="flex items-center gap-3">
              <img src="https://cdn-biofo.nitrocdn.com/pguRNgUGRHgHBjvClHTnuzLuMOCPhzJi/assets/images/optimized/rev-a721222/wisestepsconsulting.id/wp-content/uploads/2024/09/WSG_Masterfiles_Logo-13.png" alt="Wise Steps Consulting Logo" className="h-10" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fc/Lambang_Kementerian_Pariwisata_Republik_Indonesia_%282024%29.png" alt="Logo Kemenpar" className="h-10" />
          </div>
          <nav className="hidden md:flex items-center gap-6">
              <a href="#home" className="text-white font-medium transition-opacity duration-200 opacity-80 hover:opacity-100">Home</a>
              <a href="#about" className="text-white font-medium transition-opacity duration-200 opacity-80 hover:opacity-100">About</a>
              <a href="#program" className="text-white font-medium transition-opacity duration-200 opacity-80 hover:opacity-100">Program</a>
              <a href="#e-learning" className="text-white font-medium transition-opacity duration-200 opacity-80 hover:opacity-100">E-Learning</a>
              <a href="#document" className="text-white font-medium transition-opacity duration-200 opacity-80 hover:opacity-100">Document</a>
              <button onClick={() => handleGoToAuth(true)} className="text-white font-medium transition-opacity duration-200 opacity-80 hover:opacity-100">Login</button>
          </nav>
      </header>
      
      <main className="relative flex flex-col items-center justify-center min-h-screen px-4 py-24 text-center bg-[#348567] md:flex-row md:text-left md:px-[5%] md:gap-12">
          <div className="flex-1 md:flex justify-center items-center">
              <div className="relative flex items-center justify-center w-64 h-64 border-8 rounded-full md:w-96 md:h-96 border-white/20">
                  <img
                    src="https://digital.ihg.com/is/image/ihg/hotel-indigo-bali-6067764985-2x1"
                    alt="Resort di Bali"
                    className="object-cover rounded-full w-[90%] h-[90%]"
                  />
              </div>
          </div>
          <div className="relative z-10 flex-1 text-white">
              <p className="text-2xl font-semibold mb-2 text-white/90">Welcome To</p>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">Indonesia Tourism Carbon Track & Reporting</h1>
              <p className="mb-10 text-lg opacity-90 max-w-md mx-auto md:mx-0">National Online Single Portal (OSP) for Carbon Reporting</p>
              <button onClick={() => handleGoToAuth(false)} className="px-8 py-4 text-lg font-semibold text-white bg-[#68C3A3] rounded-lg shadow-md hover:bg-[#85d4b8] transform hover:-translate-y-1 transition-all duration-200">Register</button>
          </div>
      </main>
      
      {/* Content Sections */}
        <section id="net-zero-section" className="py-20 px-[5%]">
            <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
                <div className="section-image">
                    <img src="https://mawatu.co.id/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-05-at-22.06.11.jpeg" alt="Diskusi Pariwisata Berkelanjutan" className="rounded-2xl shadow-lg w-full object-cover aspect-video"/>
                </div>
                <div className="section-text">
                    <h2 className="text-4xl font-bold text-[#348567] mb-6">Indonesia Tourism Towards Net Zero</h2>
                    <p className="text-slate-600 leading-relaxed">Program ini adalah inisiatif nasional untuk mendorong industri pariwisata Indonesia mengurangi jejak karbon dan bergerak menuju operasional yang berkelanjutan. Kami membantu bisnis dari berbagai skala untuk mengukur, melaporkan, dan mengurangi emisi karbon mereka.</p>
                </div>
            </div>
        </section>

        <section id="incentive-section" className="py-20 px-[5%] bg-slate-100">
            <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
                 <div className="section-text md:order-last">
                    <h2 className="text-4xl font-bold text-[#348567] mb-6 text-center">Incentive and Support</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm text-center font-medium">Sertifikasi atau Pengakuan</div>
                        <div className="bg-white p-4 rounded-xl shadow-sm text-center font-medium">Insentif Pemasaran & Akses Pasar</div>
                        <div className="bg-white p-4 rounded-xl shadow-sm text-center font-medium">Bimbingan dari Konsultasi Ahli</div>
                        <div className="bg-white p-4 rounded-xl shadow-sm text-center font-medium">Insentif Regulasi dan Kebijakan</div>
                        <div className="bg-white p-4 rounded-xl shadow-sm text-center font-medium">Insentif Pengurangan Pajak</div>
                        <div className="bg-white p-4 rounded-xl shadow-sm text-center font-medium">Dukungan Finansial atau Subsidi</div>
                    </div>
                </div>
                <div className="section-image">
                    <img src="https://indonesia.travel/contentassets/ad62b2d07c3b463694923e90a9701331/borobudur_2.jpg" alt="Borobudur" className="rounded-2xl shadow-lg w-full object-cover aspect-video"/>
                </div>
            </div>
        </section>

        <section id="participant-list-section" className="py-20 px-[5%]">
            <div className="container mx-auto max-w-5xl text-center">
                <h2 className="text-4xl font-bold text-[#348567] mb-4">Participant List</h2>
                <div className="flex justify-center border-b mb-8">
                    <button onClick={() => setActiveTab('accomodation')} className={`px-6 py-3 font-semibold ${activeTab === 'accomodation' ? 'border-b-2 border-[#348567] text-[#348567]' : 'text-slate-500'}`}>Accomodation</button>
                    <button onClick={() => setActiveTab('tour-operator')} className={`px-6 py-3 font-semibold ${activeTab === 'tour-operator' ? 'border-b-2 border-[#348567] text-[#348567]' : 'text-slate-500'}`}>Tour Operator</button>
                    <button onClick={() => setActiveTab('attraction')} className={`px-6 py-3 font-semibold ${activeTab === 'attraction' ? 'border-b-2 border-[#348567] text-[#348567]' : 'text-slate-500'}`}>Attraction</button>
                    <button onClick={() => setActiveTab('others')} className={`px-6 py-3 font-semibold ${activeTab === 'others' ? 'border-b-2 border-[#348567] text-[#348567]' : 'text-slate-500'}`}>Others</button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                     {activeTab === 'accomodation' && (
                        <>
                           <div className="flex justify-center"><img src="https://ekosistemhotels.com/wp-content/themes/ekosistem1.1/images/Logo-Ekosistem.png" alt="Ekosistem Hotels Logo" className="h-16 object-contain"/></div>
                           <div className="flex justify-center"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Logo_InJourney.svg/2560px-Logo_InJourney.svg.png" alt="InJourney Logo" className="h-12 object-contain"/></div>
                        </>
                    )}
                    {activeTab === 'tour-operator' && (
                       <>
                           <div className="flex justify-center"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Tiket.com_logo.png/1200px-Tiket.com_logo.png" alt="Tiket.com Logo" className="h-10 object-contain"/></div>
                           <div className="flex justify-center"><img src="https://www.exotravel.com/images/w3_images/logo222.png" alt="Exo Travel Logo" className="h-16 object-contain"/></div>
                       </>
                    )}
                     {activeTab === 'attraction' && (
                       <div className="col-span-full flex justify-center"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Logo_InJourney.svg/2560px-Logo_InJourney.svg.png" alt="InJourney Logo" className="h-12 object-contain"/></div>
                    )}
                    {activeTab === 'others' && (
                        <p className="col-span-full text-slate-500">Belum ada partisipan dalam kategori ini.</p>
                    )}
                </div>
            </div>
        </section>

        <footer id="secretariat-section" className="bg-[#2A6A52] text-white/80 py-16 px-[5%]">
            <div className="container mx-auto max-w-6xl">
                 <div className="footer-left">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Lambang_Kementerian_Pariwisata_Republik_Indonesia_%282024%29.png/1200px-Lambang_Kementerian_Pariwisata_Republik_Indonesia_%282024%29.png" alt="Logo Kemenpar" className="h-16 mb-4"/>
                    <h3 className="text-white text-xl font-semibold mb-2">Kementerian Pariwisata Republik Indonesia</h3>
                    <p className="text-sm max-w-sm">Jl. Medan Merdeka Barat No. 17, RT/RW 02/03, Gambir, Daerah Khusus Ibukota Jakarta 10110, Indonesia.</p>
                    <p className="text-sm mt-2">Whatsapp Contact Center : 0811-895-6767</p>
                    <p className="text-sm">Email : info@kemenpar.go.id</p>
                </div>
            </div>
            <div className="border-t border-white/20 mt-12 pt-8 text-center text-sm text-white/60">
                <p>Copyright ©2025 Wise Steps Consulting - Konsultan Pariwisata Indonesia. All Rights Reserved.</p>
            </div>
        </footer>

    </div>
  );
}
