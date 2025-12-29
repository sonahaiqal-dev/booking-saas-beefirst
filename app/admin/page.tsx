'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts'
import { 
  LayoutDashboard, CalendarDays, Settings, Users, Wallet, RefreshCw, MessageSquare, Menu, X, Trash2, Plus 
} from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [bookings, setBookings] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // State untuk tambah layanan baru
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
    } catch (e) { console.error("Error:", e) }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // AKSI: Hapus & Tambah
  const handleDeleteBooking = async (id: string) => {
    if (confirm("Hapus data booking?")) {
      const { error } = await supabase.from('bookings').delete().eq('id', id)
      if (!error) fetchData()
    }
  }

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newService.name) return
    const { error } = await supabase.from('services').insert([newService])
    if (!error) { fetchData(); setNewService({ name: '', price: 0 }); }
  }

  const handleDeleteService = async (id: string) => {
    if (confirm("Hapus layanan ini?")) {
      const { error } = await supabase.from('services').delete().eq('id', id)
      if (!error) fetchData()
    }
  }

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('settings').update(settings).eq('id', 1)
    if (!error) alert("Tersimpan!")
  }

  // Persiapan Data Grafik
  const chartData = bookings.reduce((acc: any[], curr) => {
    const date = curr.booking_date;
    const found = acc.find(item => item.name === date);
    if (found) { found.total += 1; } 
    else { acc.push({ name: date, total: 1 }); }
    return acc;
  }, []).slice(0, 7).reverse();

  if (loading || !settings) return <div className="h-screen flex items-center justify-center font-black uppercase">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-900">
      
      {/* HEADER MOBILE */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-slate-900 px-6 flex justify-between items-center z-[100] shadow-xl">
        <div className="font-black text-white uppercase tracking-tighter">BEEFIRST ADMIN</div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-3 bg-white text-slate-900 rounded-xl">
          {isMenuOpen ? <X size={20}/> : <Menu size={20}/>}
        </button>
      </div>

      {/* SIDEBAR */}
      <div className={`fixed inset-0 z-[110] lg:relative lg:z-10 transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:flex'}`}>
        {isMenuOpen && <div className="fixed inset-0 bg-slate-900/80 lg:hidden" onClick={() => setIsMenuOpen(false)}></div>}
        <aside className="relative w-72 bg-white border-r-2 border-slate-200 h-full p-8 flex flex-col shadow-2xl lg:shadow-none">
          <nav className="space-y-2 mt-10 lg:mt-0">
            <SidebarItem active={activeTab === 'overview'} label="Overview" icon={<LayoutDashboard size={18}/>} onClick={() => {setActiveTab('overview'); setIsMenuOpen(false)}} />
            <SidebarItem active={activeTab === 'list'} label="Bookings" icon={<CalendarDays size={18}/>} onClick={() => {setActiveTab('list'); setIsMenuOpen(false)}} />
            <SidebarItem active={activeTab === 'services'} label="Services" icon={<Plus size={18}/>} onClick={() => {setActiveTab('services'); setIsMenuOpen(false)}} />
            <SidebarItem active={activeTab === 'settings'} label="Settings" icon={<Settings size={18}/>} onClick={() => {setActiveTab('settings'); setIsMenuOpen(false)}} />
          </nav>
        </aside>
      </div>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-6 lg:p-12 pt-28 lg:pt-12 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-black tracking-tighter capitalize">{activeTab}</h1>
            <button onClick={fetchData} className="px-4 py-2 bg-white border-2 border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"><RefreshCw size={14}/></button>
          </header>

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Booking" value={bookings.length} color="text-blue-600" bg="bg-blue-100" />
                <StatCard label="Omzet Booking" value={`Rp ${(bookings.length * settings.dp_amount).toLocaleString()}`} color="text-green-600" bg="bg-green-100" />
                <StatCard label="Layanan Aktif" value={services.length} color="text-purple-600" bg="bg-purple-100" />
              </div>
              
              <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
                <h3 className="font-black text-[10px] uppercase tracking-widest mb-6">Statistik 7 Hari Terakhir</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                      <XAxis dataKey="name" fontSize={10} tick={{fill: '#000', fontWeight: 'bold'}} />
                      <YAxis fontSize={10} tick={{fill: '#000', fontWeight: 'bold'}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} />
                      <Bar dataKey="total" fill={settings.primary_color} radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BOOKINGS */}
          {activeTab === 'list' && (
            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-50 border-b-2 border-slate-200 font-black uppercase text-[10px] tracking-widest">
                    <tr><th className="p-6">Customer</th><th className="p-6">Layanan</th><th className="p-6">Waktu</th><th className="p-6 text-center">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold">
                    {bookings.map(b => (
                      <tr key={b.id} className="text-sm">
                        <td className="p-6 font-black uppercase">{b.customer_name}<p className="text-[10px] text-slate-400 font-normal">{b.customer_wa}</p></td>
                        <td className="p-6"><span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase">{b.service_name}</span></td>
                        <td className="p-6 text-xs">{b.booking_date} | {b.booking_time}</td>
                        <td className="p-6 flex justify-center gap-4">
                          <a href={`https://wa.me/${b.customer_wa}`} target="_blank" className="text-green-600"><MessageSquare size={18}/></a>
                          <button onClick={() => handleDeleteBooking(b.id)} className="text-red-400"><Trash2 size={18}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SERVICES */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <form onSubmit={handleAddService} className="bg-white p-8 rounded-[2rem] border-2 border-slate-200 space-y-4 h-fit shadow-lg">
                <h3 className="font-black text-[10px] uppercase tracking-widest mb-2">Tambah Layanan</h3>
                <input value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="w-full border-2 border-slate-200 p-4 rounded-xl font-bold text-sm" placeholder="Nama Layanan" />
                <input type="number" value={newService.price} onChange={e => setNewService({...newService, price: Number(e.target.value)})} className="w-full border-2 border-slate-200 p-4 rounded-xl font-bold text-sm" placeholder="Harga (Rp)" />
                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg">Simpan</button>
              </form>
              <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b-2 border-slate-200 font-black text-[10px] uppercase tracking-widest">
                    <tr><th className="p-6">Nama Jasa</th><th className="p-6">Harga</th><th className="p-6 text-center">Hapus</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold uppercase text-xs">
                    {services.map(s => (
                      <tr key={s.id}>
                        <td className="p-6">{s.name}</td>
                        <td className="p-6 font-mono">Rp {s.price.toLocaleString()}</td>
                        <td className="p-6 flex justify-center"><button onClick={() => handleDeleteService(s.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={18}/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleUpdateSettings} className="max-w-2xl bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest">Nama Bisnis</label>
                  <input value={settings.business_name} onChange={e => setSettings({...settings, business_name: e.target.value})} className="w-full border-2 border-slate-200 p-4 rounded-xl font-bold text-sm outline-none focus:border-slate-900" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest">WhatsApp Admin</label>
                  <input value={settings.whatsapp_admin} onChange={e => setSettings({...settings, whatsapp_admin: e.target.value})} className="w-full border-2 border-slate-200 p-4 rounded-xl font-bold text-sm font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest">Warna Branding</label>
                  <input type="color" value={settings.primary_color} onChange={e => setSettings({...settings, primary_color: e.target.value})} className="w-full h-12 rounded-xl cursor-pointer" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest">Besar DP (Rp)</label>
                  <input type="number" value={settings.dp_amount} onChange={e => setSettings({...settings, dp_amount: Number(e.target.value)})} className="w-full border-2 border-slate-200 p-4 rounded-xl font-bold text-sm" />
                </div>
              </div>
              <button type="submit" style={{backgroundColor: settings.primary_color}} className="w-full py-5 rounded-2xl font-black text-white text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                Update Settings
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
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-xl font-black transition-all uppercase text-[10px] tracking-widest ${active ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}>
      {icon} {label}
    </button>
  )
}

function StatCard({ label, value, color, bg }: any) {
  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-slate-50 flex flex-col gap-4">
      <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center`}><Wallet size={20}/></div>
      <div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
    </div>
  )
}