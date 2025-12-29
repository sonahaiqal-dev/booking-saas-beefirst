'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts'
import { 
  LayoutDashboard, CalendarDays, Settings, Users, Wallet, RefreshCw, MessageSquare, Menu, X, Trash2, Plus, Palette, Smartphone 
} from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [bookings, setBookings] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // State Form
  const [newService, setNewService] = useState({ name: '', price: 0 })

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: bData } = await supabase.from('bookings').select('*').order('booking_date', { ascending: false })
      if (bData) setBookings(bData)
      const { data: sData } = await supabase.from('settings').select('*').single()
      if (sData) setSettings(sData)
      const { data: svData } = await supabase.from('services').select('*').order('created_at', { ascending: true })
      if (svData) setServices(svData)
    } catch (e) { console.error("Sync Error:", e) }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // --- LOGIKA ACTIONS ---
  const handleDeleteBooking = async (id: string) => {
    if (confirm("Hapus data booking ini secara permanen?")) {
      const { error } = await supabase.from('bookings').delete().eq('id', id)
      if (!error) { fetchData(); }
    }
  }

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newService.name || newService.price <= 0) return alert("Lengkapi data layanan!")
    const { error } = await supabase.from('services').insert([newService])
    if (!error) { fetchData(); setNewService({ name: '', price: 0 }); alert("Layanan baru ditambahkan!"); }
  }

  const handleDeleteService = async (id: string) => {
    if (confirm("Hapus layanan ini?")) {
      const { error } = await supabase.from('services').delete().eq('id', id)
      if (!error) { fetchData(); }
    }
  }

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('settings').update(settings).eq('id', 1)
    if (!error) alert("Branding & Sistem Berhasil Diupdate!")
  }

  if (loading || !settings) return (
    <div className="h-screen flex flex-col items-center justify-center font-black text-slate-900 bg-white gap-4">
      <RefreshCw className="animate-spin" size={40} />
      <p className="tracking-[0.5em] text-xs">LOADING BEEFIRST SYSTEM</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      
      {/* --- MOBILE HEADER (FIXED & HIGH CONTRAST) --- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-slate-900 px-6 flex justify-between items-center z-[100] shadow-2xl border-b border-slate-800">
        <div className="flex flex-col">
          <span className="font-black text-white text-xl tracking-tighter leading-none">BEEFIRST</span>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Management V3.0</span>
        </div>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="p-3 bg-white text-slate-900 rounded-2xl shadow-xl active:scale-90 transition-all flex items-center justify-center"
        >
          {isMenuOpen ? <X size={24}/> : <Menu size={24}/>}
        </button>
      </div>

      {/* --- SIDEBAR (RESPONSIVE SLIDE-IN) --- */}
      <div className={`
        fixed inset-0 z-[110] lg:relative lg:z-10 lg:translate-x-0 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:flex lg:translate-x-0'}
      `}>
        {isMenuOpen && (
          <div className="fixed inset-0 bg-slate-900/90 lg:hidden backdrop-blur-md" onClick={() => setIsMenuOpen(false)}></div>
        )}
        
        <aside className="relative w-80 bg-white border-r-2 border-slate-200 h-full p-8 flex flex-col shadow-2xl lg:shadow-none overflow-y-auto">
          <div className="mb-12 hidden lg:block">
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Beefirst</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Agency Thought Partner</p>
          </div>

          <nav className="space-y-3">
            <SidebarItem active={activeTab === 'overview'} icon={<LayoutDashboard size={20}/>} label="Dashboard" onClick={() => {setActiveTab('overview'); setIsMenuOpen(false)}} />
            <SidebarItem active={activeTab === 'list'} icon={<CalendarDays size={20}/>} label="Bookings" onClick={() => {setActiveTab('list'); setIsMenuOpen(false)}} />
            <SidebarItem active={activeTab === 'services'} icon={<Users size={20}/>} label="Manage Services" onClick={() => {setActiveTab('services'); setIsMenuOpen(false)}} />
            <SidebarItem active={activeTab === 'settings'} icon={<Settings size={20}/>} label="System Settings" onClick={() => {setActiveTab('settings'); setIsMenuOpen(false)}} />
          </nav>

          <div className="mt-auto pt-10">
             <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Supabase Status</p>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                   <p className="text-xs font-bold uppercase tracking-tighter">Live Database</p>
                </div>
             </div>
          </div>
        </aside>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-6 md:p-10 lg:p-14 pt-32 lg:pt-14 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 capitalize leading-none">{activeTab}</h1>
              <p className="text-slate-400 font-bold mt-2 uppercase text-[10px] tracking-[0.3em]">Update: {new Date().toLocaleDateString('id-ID')}</p>
            </div>
            <button onClick={fetchData} className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-slate-200 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-xl group">
              <RefreshCw size={16} className="group-active:rotate-180 transition-transform"/> Sync System
            </button>
          </header>

          {/* --- CONTENT TAB: OVERVIEW --- */}
          {activeTab === 'overview' && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard label="Total Reservasi" value={bookings.length} color="text-blue-700" bg="bg-blue-50" icon={<CalendarDays/>}/>
                <StatCard label="Estimasi Omzet" value={`Rp ${(bookings.length * settings.dp_amount).toLocaleString()}`} color="text-green-700" bg="bg-green-50" icon={<Wallet/>}/>
                <StatCard label="Layanan Aktif" value={services.length} color="text-purple-700" bg="bg-purple-50" icon={<Plus/>}/>
              </div>

              <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
                <h3 className="font-black text-slate-900 mb-10 uppercase text-xs tracking-[0.4em] relative z-10">Grafik Aktivitas Booking</h3>
                <div className="h-64 md:h-96 relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bookings.slice(0, 10).reverse()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                      <XAxis dataKey="booking_date" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#0f172a', fontWeight: '900'}} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#0f172a', fontWeight: '900'}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="id" fill={settings.primary_color} radius={[15, 15, 0, 0]} barSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* --- CONTENT TAB: BOOKINGS (WITH DELETE) --- */}
          {activeTab === 'list' && (
            <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-slate-50 border-b-2 border-slate-100 font-black text-slate-900 uppercase text-[11px] tracking-[0.2em]">
                    <tr>
                      <th className="p-8">Nama Pelanggan</th>
                      <th className="p-8">Layanan</th>
                      <th className="p-8">Waktu Reservasi</th>
                      <th className="p-8 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-900 font-bold">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-8">
                            <p className="font-black text-lg uppercase tracking-tighter">{b.customer_name}</p>
                            <p className="text-xs text-slate-400 font-mono mt-1">{b.customer_wa}</p>
                        </td>
                        <td className="p-8">
                          <span className="px-4 py-2 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                            {b.service_name}
                          </span>
                        </td>
                        <td className="p-8">
                           <p className="text-sm font-black uppercase">{b.booking_date}</p>
                           <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{b.booking_time} WIB</p>
                        </td>
                        <td className="p-8">
                          <div className="flex items-center justify-center gap-4 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <a href={`https://wa.me/${b.customer_wa}`} target="_blank" className="w-12 h-12 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-sm">
                              <MessageSquare size={20}/>
                            </a>
                            <button onClick={() => handleDeleteBooking(b.id)} className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white hover:rotate-12 transition-all shadow-sm">
                              <Trash2 size={20}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- CONTENT TAB: SERVICES (ADD & REMOVE) --- */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-4 border-slate-900 h-fit">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                  <Plus size={24}/>
                </div>
                <h3 className="font-black text-2xl text-slate-900 uppercase tracking-tighter mb-6 leading-none">Tambah<br/>Layanan Baru</h3>
                <form onSubmit={handleAddService} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1">Nama Jasa</label>
                    <input 
                      value={newService.name} 
                      onChange={e => setNewService({...newService, name: e.target.value})}
                      className="w-full border-2 border-slate-200 p-5 rounded-2xl font-black bg-slate-50 focus:bg-white focus:border-slate-900 outline-none transition-all" 
                      placeholder="e.g. Wedding Package"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1">Harga (Rp)</label>
                    <input 
                      type="number" 
                      value={newService.price} 
                      onChange={e => setNewService({...newService, price: Number(e.target.value)})}
                      className="w-full border-2 border-slate-200 p-5 rounded-2xl font-black bg-slate-50 focus:bg-white focus:border-slate-900 outline-none transition-all" 
                      placeholder="1000000"
                    />
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:brightness-125 transition-all active:scale-95">
                    Tambahkan Jasa
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b-2 border-slate-100 font-black text-slate-900 uppercase text-[10px] tracking-widest">
                    <tr>
                      <th className="p-8">Nama Layanan</th>
                      <th className="p-8 text-right">Harga (IDR)</th>
                      <th className="p-8 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-black text-slate-900">
                    {services.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-8 uppercase tracking-tighter text-lg">{s.name}</td>
                        <td className="p-8 text-right font-mono text-xl">Rp {s.price.toLocaleString()}</td>
                        <td className="p-8">
                           <div className="flex justify-center">
                              <button onClick={() => handleDeleteService(s.id)} className="p-4 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                                <Trash2 size={20}/>
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- CONTENT TAB: SETTINGS (LENGKAP: NAMA, WA, COLOR, DP) --- */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl">
              <form onSubmit={handleUpdateSettings} className="bg-white p-10 md:p-16 rounded-[4rem] shadow-2xl border border-slate-100 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] ml-2">
                      <Smartphone size={14}/> Identitas Bisnis
                    </label>
                    <input 
                      value={settings.business_name} 
                      onChange={e => setSettings({...settings, business_name: e.target.value})} 
                      className="w-full border-2 border-slate-200 p-6 rounded-[2rem] font-black text-slate-900 text-xl shadow-inner outline-none focus:border-slate-900 focus:bg-white transition-all bg-slate-50" 
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] ml-2">
                      <MessageSquare size={14}/> WhatsApp Admin
                    </label>
                    <input 
                      value={settings.whatsapp_admin} 
                      onChange={e => setSettings({...settings, whatsapp_admin: e.target.value})} 
                      className="w-full border-2 border-slate-200 p-6 rounded-[2rem] font-black text-slate-900 text-xl font-mono shadow-inner outline-none focus:border-slate-900 transition-all bg-slate-50" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t-2 border-slate-50 pt-12">
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] ml-2">
                      <Palette size={14}/> Warna Branding
                    </label>
                    <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-[2rem] border-2 border-slate-200 shadow-inner">
                      <input 
                        type="color" 
                        value={settings.primary_color} 
                        onChange={e => setSettings({...settings, primary_color: e.target.value})} 
                        className="h-14 w-24 rounded-2xl cursor-pointer border-4 border-white shadow-xl" 
                      />
                      <span className="text-slate-900 font-black uppercase font-mono text-sm tracking-widest">{settings.primary_color}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] ml-2">
                      <Wallet size={14}/> Besar DP Wajib (IDR)
                    </label>
                    <input 
                      type="number" 
                      value={settings.dp_amount} 
                      onChange={e => setSettings({...settings, dp_amount: Number(e.target.value)})} 
                      className="w-full border-2 border-slate-200 p-6 rounded-[2rem] font-black text-slate-900 text-2xl shadow-inner outline-none focus:border-slate-900 transition-all bg-slate-50" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  style={{backgroundColor: settings.primary_color}} 
                  className="w-full py-8 rounded-[3rem] font-black text-white text-2xl shadow-2xl uppercase tracking-[0.5em] active:scale-[0.98] transition-all hover:brightness-110 flex items-center justify-center gap-4"
                >
                  Save Global Configuration
                </button>
              </form>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

function SidebarItem({ active, icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`
        w-full flex items-center gap-5 p-6 rounded-[2rem] font-black transition-all uppercase text-[11px] tracking-[0.2em]
        ${active ? 'bg-slate-900 text-white shadow-[0_20px_40px_rgba(0,0,0,0.3)] translate-x-3 scale-105' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'}
      `}
    >
      <span className={active ? 'text-white' : 'text-slate-400'}>{icon}</span>
      {label}
    </button>
  )
}

function StatCard({ label, value, color, bg, icon }: any) {
  return (
    <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100 flex flex-col gap-6 hover:shadow-2xl hover:-translate-y-2 transition-all group">
      <div className={`w-16 h-16 ${bg} ${color} rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{label}</p>
        <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
      </div>
    </div>
  )
}