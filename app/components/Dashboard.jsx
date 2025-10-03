import CarbonCalculator from './CarbonCalculator';
import EmissionHistory from './EmissionHistory';

// Komponen Dasbor (Diperbarui)
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
    { id: 'beranda', text: 'Beranda', icon: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg> },
    { id: 'notifikasi', text: 'Notifikasi', icon: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" clipRule="evenodd" /></svg> },
    { id: 'dashboard-utama', text: 'Dasbor Utama', icon: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg> },
    { id: 'profil-usaha', text: 'Profil Usaha', icon: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" /></svg> },
    { id: 'laporan-emisi', text: 'Laporan Emisi', icon: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" /></svg> },
    { id: 'sertifikasi', text: 'Sertifikasi', icon: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976.723-1.745A3.066 3.066 0 016.267 3.455zM8.5 6a.5.5 0 00-.5.5v3h-3a.5.5 0 000 1h3v3a.5.5 0 001 0v-3h3a.5.5 0 000-1h-3v-3a.5.5 0 00-.5-.5z" clipRule="evenodd" /></svg> },
    { id: 'pembelajaran', text: 'Pembelajaran', icon: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L9 9.61v5.07L2.96 11.43A1 1 0 102 13.2v.01a4.98 4.98 0 005.63 3.32l.35-.07a1 1 0 00.82-1.2L8.5 12.44v-2.1l.48.24a1 1 0 00.74 0l7-3A1 1 0 0018 6.5V6a1 1 0 00-1-1h-1a1 1 0 00-1 1v.39L10.394 2.08zM10 8.39L4.61 6.16 10 3.93 15.39 6.16 10 8.39z" /></svg> },
    { id: 'panduan', text: 'Panduan', icon: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg> },
  ];

  const PageContent = () => {
    switch(activeDashboardPage) {
        case 'beranda':
            return <div>
              <h1 className="text-xl font-bold">Selamat datang kembali!</h1>
              <p className="text-slate-600 mt-2">Anda masuk sebagai: <span className="font-mono text-sm bg-slate-200 p-1 rounded">{user?.email}</span></p>
            </div>;
        case 'dashboard-utama':
             return <div>
                <h1 className="text-3xl font-bold mb-6">Dasbor Utama</h1>
                <EmissionHistory supabase={supabase} user={user} />
             </div>;
        case 'laporan-emisi':
            return <CarbonCalculator supabase={supabase} user={user} setActiveDashboardPage={setActiveDashboardPage} />;
        case 'notifikasi':
            return <div>Konten Halaman Notifikasi.</div>;
        default:
            return <div>Konten untuk {activeDashboardPage}.</div>;
    }
  }

  const pageTitle = sidebarLinks.find(link => link.id === activeDashboardPage)?.text || 'Dasbor';

  return (
    <div id="app-wrapper" className="flex">
      <aside className="fixed top-0 left-0 z-40 flex flex-col h-screen p-6 bg-white border-r w-64 border-slate-200">
          <div className="pb-6 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                  <img src="[https://cdn-biofo.nitrocdn.com/pguRNgUGRHgHBjvClHTnuzLuMOCPhzJi/assets/images/optimized/rev-a721222/wisestepsconsulting.id/wp-content/uploads/2022/09/WSG_Masterfiles_Logo-02-1024x264.png](https://cdn-biofo.nitrocdn.com/pguRNgUGRHgHBjvClHTnuzLuMOCPhzJi/assets/images/optimized/rev-a721222/wisestepsconsulting.id/wp-content/uploads/2022/09/WSG_Masterfiles_Logo-02-1024x264.png)" alt="Wise Steps Consulting Logo" className="h-9"/>
                  <img src="[https://upload.wikimedia.org/wikipedia/commons/f/fc/Lambang_Kementerian_Pariwisata_Republik_Indonesia_%282024%29.png](https://upload.wikimedia.org/wikipedia/commons/f/fc/Lambang_Kementerian_Pariwisata_Republik_Indonesia_%282024%29.png)" alt="Logo Kemenpar" className="h-10"/>
              </div>
          </div>
          <nav className="flex flex-col flex-grow gap-1">
              {sidebarLinks.map(link => (
                  <button
                      key={link.id}
                      onClick={() => setActiveDashboardPage(link.id)}
                      className={`flex items-center gap-4 p-3 rounded-lg text-sm font-medium transition-colors ${
                          activeDashboardPage === link.id
                              ? 'bg-emerald-100 text-[#348567] font-semibold'
                              : 'text-slate-500 hover:bg-slate-100'
                      }`}
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
                  <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                  <span>Logout</span>
              </button>
          </div>
      </aside>
      <div className="flex flex-col flex-1 w-full ml-64">
          <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-10 bg-white border-b border-slate-200">
              <h2 className="text-2xl font-bold">{pageTitle}</h2>
              <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:bg-slate-100">
                      <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
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
