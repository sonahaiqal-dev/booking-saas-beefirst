'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts'
import { 
  LayoutDashboard, CalendarDays, Settings, Users, Wallet, RefreshCw, Plus, Trash2, MessageSquare, Menu, X 
} from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [bookings, setBookings] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: bData } = await supabase.from('bookings').select('*').order('booking_date', { ascending: false })
      if (bData) setBookings(bData)
      const { data: sData } = await supabase.from('settings').select('*').single()
      if (sData) setSettings(sData)
      const { data: svData } = await supabase.from('services').select('*').order('created_at', { ascending: true })
      if (svData) setServices(svData)
    } catch (e) { console.error("Error fetching data:", e) }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // FITUR: Hapus Bookingan
  const handleDeleteBooking = async (id: string) => {
    const konfirmasi = confirm("Apakah Anda yakin ingin menghapus data booking ini?")
    if (konfirmasi) {
      const { error } = await supabase.from('bookings').delete().eq('id', id)
      if (error) {
        alert("Gagal menghapus data!")
      } else {
        alert("Data booking berhasil dihapus!")
        fetchData() // Refresh data otomatis setelah hapus
      }
    }
  }

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('settings').update(settings).eq('id', 1)
    if (error) alert("Gagal menyimpan!")
    else alert("Pengaturan Beefirst Berhasil Disimpan!")
  }

  const chartData = bookings.reduce((acc: any[], curr) => {
    const day = curr.booking_date;
    const found = acc.find(item => item.name === day);
    if (found) { found.total += 1; } 
    else { acc.push({ name: day, total: 1 }); }
    return acc;
  }, []).slice(0, 7).reverse();

  if (loading || !settings) return (
    <div className="h-screen flex items-center justify-center font-black text-slate-900 bg-white uppercase tracking-widest">
      Memuat Dashboard Beefirst...
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-900 font-sans">
      
      {/* --- HEADER MOBILE (FIXED) --- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-slate-900 px-6 flex justify-between items-center z-[100] shadow-xl">
        <div className="flex flex-col">
          <span className="font-black text-white text-lg leading-none uppercase tracking-tighter">BEEFIRST</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ADMIN PANEL</span>
        </div>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="p-3 bg-white text-slate-900 rounded-2xl shadow-xl active:scale-90 transition-all"
        >
          {isMenuOpen ? <X size={24}/> : <Menu size={24}/>}
        </button>
      </div>

      {/* --- SIDEBAR --- */}
      <div className={`
        fixed inset-0 z-[110] lg:relative lg:z-10 lg:translate-x-0 transition-transform duration-300 ease-in-out
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:flex lg:translate-x-0'}
      `}>
        {isMenuOpen && (
          <div className="fixed inset-0 bg-slate-900/80 lg:hidden" onClick={() => setIsMenuOpen(false)}></div>
        )}
        
        <aside className="relative w-80 bg-white border-r-2 border-slate-200 h-full p-8 flex flex-col shadow-2xl lg:shadow-none overflow-y-auto">
          <div className="mb-12 hidden lg:block">
            <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Beefirst Visual</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Management System</p>
          </div>

          <nav className="space-y-2">
            <SidebarItem active={activeTab === 'overview'} icon={<LayoutDashboard size={20}/>} label="Overview" onClick={() => {setActiveTab('overview'); setIsMenuOpen(false)}} />
            <SidebarItem active={activeTab === 'list'} icon={<CalendarDays size={20}/>} label="Bookings" onClick={() => {setActiveTab('list'); setIsMenuOpen(false)}} />
            <SidebarItem active={activeTab === 'services'} icon={<Users size={20}/>} label="Services" onClick={() => {setActiveTab('services'); setIsMenuOpen(false)}} />
            <SidebarItem active={activeTab === 'settings'} icon={<Settings size={20}/>} label="Settings" onClick={() => {setActiveTab('settings'); setIsMenuOpen(false)}} />
          </nav>
        </aside>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 pt-28 lg:pt-12 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          
          <header className="flex justify-between items-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 capitalize leading-none">{activeTab}</h1>
            <button onClick={fetchData} className="hidden md:flex items-center gap-3 px-6 py-3 bg-white border-2 border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
              <RefreshCw size={16}/> Refresh
            </button>
          </header>

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <StatCard label="Total Booking" value={bookings.length} color="text-blue-700" bg="bg-blue-100" />
                <StatCard label="Omzet Booking" value={`Rp ${(bookings.length * settings.dp_amount).toLocaleString()}`} color="text-green-700" bg="bg-green-100" />
                <StatCard label="Layanan Aktif" value={services.length} color="text-purple-700" bg="bg-purple-100" />
              </div>

              <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
                <h3 className="font-black text-slate-900 mb-8 uppercase text-xs tracking-widest">Statistik Reservasi</h3>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                      <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#0f172a', fontWeight: 'bold'}} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#0f172a', fontWeight: 'bold'}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} />
                      <Bar dataKey="total" fill={settings.primary_color} radius={[10, 10, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BOOKINGS LIST (DENGAN FITUR HAPUS) */}
          {activeTab === 'list' && (
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[750px]">
                  <thead className="bg-slate-100 border-b-2 border-slate-200 font-black text-slate-900 uppercase text-[11px] tracking-widest">
                    <tr>
                      <th className="p-6">Pelanggan</th>
                      <th className="p-6">Layanan</th>
                      <th className="p-6">Jadwal</th>
                      <th className="p-6">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-900 font-black">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-6 font-black uppercase">
                            {b.customer_name}
                            <p className="text-[10px] text-slate-400 font-mono font-normal">{b.customer_wa}</p>
                        </td>
                        <td className="p-6">
                            <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase">
                                {b.service_name}
                            </span>
                        </td>
                        <td className="p-6 text-xs uppercase">{b.booking_date} | {b.booking_time}</td>
                        <td className="p-6 flex items-center gap-4">
                          <a href={`https://wa.me/${b.customer_wa}`} target="_blank" className="text-green-600 hover:scale-110 transition-transform">
                            <MessageSquare size={20}/>
                          </a>
                          {/* TOMBOL HAPUS BARU */}
                          <button 
                            onClick={() => handleDeleteBooking(b.id)}
                            className="text-red-400 hover:text-red-600 hover:scale-110 transition-all"
                          >
                            <Trash2 size={20}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SERVICES & SETTINGS (LENGKAP) */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <form className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-200 space-y-5 h-fit shadow-xl">
                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-4">Tambah Layanan</h3>
                <input className="w-full border-2 border-slate-200 p-4 rounded-2xl font-black bg-slate-50 text-slate-900" placeholder="Nama Layanan" />
                <input type="number" className="w-full border-2 border-slate-200 p-4 rounded-2xl font-black bg-slate-50 text-slate-900" placeholder="Harga (Rp)" />
                <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest">Simpan</button>
              </form>
              <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden text-slate-900">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 border-b-2 border-slate-200 font-black uppercase text-[10px] tracking-widest">
                    <tr><th className="p-6">Nama Jasa</th><th className="p-6">Harga</th><th className="p-6">Hapus</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-black">
                    {services.map(s => (
                      <tr key={s.id}>
                        <td className="p-6 uppercase">{s.name}</td>
                        <td className="p-6 font-mono">Rp {s.price.toLocaleString()}</td>
                        <td className="p-6 text-slate-300 hover:text-red-600 cursor-pointer transition-colors"><Trash2 size={20}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <form onSubmit={handleUpdateSettings} className="max-w-3xl bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-2">Nama Bisnis</label>
                  <input value={settings.business_name} onChange={e => setSettings({...settings, business_name: e.target.value})} className="w-full border-2 border-slate-300 p-5 rounded-3xl font-black text-slate-900 bg-white focus:border-slate-900 outline-none transition-all text-lg shadow-sm" />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-2">WhatsApp Admin</label>
                  <input value={settings.whatsapp_admin} onChange={e => setSettings({...settings, whatsapp_admin: e.target.value})} className="w-full border-2 border-slate-300 p-5 rounded-3xl font-black text-slate-900 bg-white font-mono text-lg shadow-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-2">Warna Branding</label>
                  <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-3xl border-2 border-slate-200">
                    <input type="color" value={settings.primary_color} onChange={e => setSettings({...settings, primary_color: e.target.value})} className="h-14 w-20 rounded-2xl cursor-pointer shadow-inner" />
                    <span className="text-slate-900 font-black uppercase font-mono text-sm tracking-widest">{settings.primary_color}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-2">Besar DP Booking (Rp)</label>
                  <input type="number" value={settings.dp_amount} onChange={e => setSettings({...settings, dp_amount: Number(e.target.value)})} className="w-full border-2 border-slate-300 p-5 rounded-3xl font-black text-slate-900 bg-white text-lg shadow-sm" />
                </div>
              </div>
              <button type="submit" style={{backgroundColor: settings.primary_color}} className="w-full py-7 rounded-[2.5rem] font-black text-white text-xl shadow-2xl uppercase tracking-[0.4em] active:scale-[0.97] transition-all">
                Update Dashboard
              </button>
            </form>
          )}

        </div>
      </main>
    </div>
  )
}

function SidebarItem({ active, icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-5 p-5 rounded-[1.8rem] font-black transition-all uppercase text-[11px] tracking-widest ${active ? 'bg-slate-900 text-white shadow-2xl translate-x-1' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'}`}>
      {icon} {label}
    </button>
  )
}

function StatCard({ label, value, color, bg }: any) {
  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-50 flex flex-col gap-5 hover:shadow-2xl transition-all">
      <div className={`w-16 h-16 ${bg} ${color} rounded-2xl flex items-center justify-center shadow-inner`}><Wallet size={28}/></div>
      <div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
        <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
      </div>
    </div>
  )
}