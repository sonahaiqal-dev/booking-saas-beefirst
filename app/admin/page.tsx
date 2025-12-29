'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { LayoutDashboard, CalendarDays, Settings, Users, Wallet, Menu, X, RefreshCw } from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [bookings, setBookings] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: bData } = await supabase.from('bookings').select('*')
        if (bData) setBookings(bData)
        const { data: sData } = await supabase.from('settings').select('*').single()
        if (sData) setSettings(sData)
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading || !settings) return <div className="p-10 font-black uppercase tracking-widest text-slate-900">Memuat Sistem Beefirst...</div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-900 font-sans">
      
      {/* 1. HEADER MOBILE (MENGGUNAKAN STYLE MANUAL AGAR PASTI MUNCUL) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 1024px) { .mobile-header-beefirst { display: none !important; } }
        .mobile-header-beefirst { 
          display: flex; position: fixed; top: 0; left: 0; right: 0; height: 70px; 
          background: #0f172a; color: white; z-index: 9999; align-items: center; 
          justify-content: space-between; padding: 0 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        }
      `}} />

      <div className="mobile-header-beefirst">
        <div className="font-black text-sm tracking-tighter uppercase">Beefirst Admin</div>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ background: 'white', color: 'black', padding: '8px 15px', borderRadius: '12px', fontWeight: '900', fontSize: '11px' }}
        >
          {isMenuOpen ? 'TUTUP' : 'MENU'}
        </button>
      </div>

      {/* 2. SIDEBAR NAVIGATION */}
      <div className={`
        fixed inset-0 z-[10000] lg:relative lg:z-10 lg:translate-x-0 transition-transform duration-300 ease-in-out
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:flex lg:translate-x-0'}
      `}>
        {isMenuOpen && (
          <div className="fixed inset-0 bg-slate-900/90 lg:hidden" onClick={() => setIsMenuOpen(false)}></div>
        )}
        
        <aside className="relative w-80 bg-white border-r-2 border-slate-200 h-full p-8 flex flex-col shadow-2xl lg:shadow-none overflow-y-auto">
          <div className="mb-12 hidden lg:block">
            <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Beefirst Admin</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sistem Management</p>
          </div>

          <nav className="space-y-2">
            <SidebarItem active={activeTab === 'overview'} icon={<LayoutDashboard size={20}/>} label="Overview" onClick={() => {setActiveTab('overview'); setIsMenuOpen(false)}} />
            <SidebarItem active={activeTab === 'list'} icon={<CalendarDays size={20}/>} label="Bookings" onClick={() => {setActiveTab('list'); setIsMenuOpen(false)}} />
            <SidebarItem active={activeTab === 'settings'} icon={<Settings size={20}/>} label="Settings" onClick={() => {setActiveTab('settings'); setIsMenuOpen(false)}} />
          </nav>
        </aside>
      </div>

      {/* 3. MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-12 pt-28 lg:pt-12">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 capitalize leading-none">{activeTab}</h1>
          </header>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col gap-4">
                  <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center"><Users size={24}/></div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Booking</p>
                    <p className="text-4xl font-black text-slate-900">{bookings.length}</p>
                  </div>
               </div>
               <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col gap-4">
                  <div className="w-14 h-14 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center"><Wallet size={24}/></div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Estimasi Omzet</p>
                    <p className="text-4xl font-black text-slate-900">Rp {(bookings.length * settings.dp_amount).toLocaleString()}</p>
                  </div>
               </div>
            </div>
          )}
          
          {/* Tab Settings */}
          {activeTab === 'settings' && (
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 font-black uppercase text-center text-slate-300">
              Form Pengaturan Beefirst Visual
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function SidebarItem({ active, icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black transition-all uppercase text-[10px] tracking-widest ${active ? 'bg-slate-900 text-white shadow-xl translate-x-1' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}>
      {icon} {label}
    </button>
  )
}