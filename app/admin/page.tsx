'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts'
import { 
  LayoutDashboard, CalendarDays, Settings, Users, Wallet, RefreshCw, 
  MessageSquare, Menu, X, Trash2, Plus, Filter, ImageIcon, LogOut 
} from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [bookings, setBookings] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [timeFilter, setTimeFilter] = useState('7')
  const [newService, setNewService] = useState({ name: '', price: 0 })

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return window.location.replace('/login')

      const { data: bData } = await supabase.from('bookings').select('*').order('booking_date', { ascending: false })
      if (bData) setBookings(bData)
      const { data: sData } = await supabase.from('settings').select('*').single()
      if (sData) setSettings(sData)
      const { data: svData } = await supabase.from('services').select('*').order('created_at', { ascending: true })
      if (svData) setServices(svData)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // FIX LOGOUT: Bersihkan total dan arahkan ke login
  const handleLogout = async () => {
    if (confirm("Logout dari sistem?")) {
      await supabase.auth.signOut()
      localStorage.clear()
      sessionStorage.clear()
      window.location.replace('/login')
    }
  }

  // --- LOGIKA ACTIONS LAINNYA ---
  const handleDeleteBooking = async (id: string) => {
    if (confirm("Hapus booking?")) {
      await supabase.from('bookings').delete().eq('id', id)
      fetchData()
    }
  }

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newService.name || newService.price <= 0) return
    const { error } = await supabase.from('services').insert([newService])
    if (!error) { fetchData(); setNewService({ name: '', price: 0 }); }
  }

  const handleLogoUpload = async (event: any) => {
    try {
      setUploading(true)
      const file = event.target.files[0]
      if (!file) return
      const fileName = `logo-${Math.random()}.${file.name.split('.').pop()}`
      await supabase.storage.from('logos').upload(fileName, file)
      const { data } = supabase.storage.from('logos').getPublicUrl(fileName)
      await supabase.from('settings').update({ logo_url: data.publicUrl }).eq('id', 1)
      setSettings({ ...settings, logo_url: data.publicUrl })
      alert("Logo Updated!")
    } catch (e) { alert("Upload Failed") } finally { setUploading(false) }
  }

  const getFilteredChartData = () => {
    const filterDays = parseInt(timeFilter);
    const filtered = bookings.filter(b => {
      const diffDays = Math.ceil(Math.abs(new Date().getTime() - new Date(b.booking_date).getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= filterDays;
    });
    const reduced = filtered.reduce((acc: any[], curr) => {
      const date = curr.booking_date;
      const found = acc.find(item => item.name === date);
      if (found) { found.total += 1; } else { acc.push({ name: date, total: 1 }); }
      return acc;
    }, []);
    return reduced.sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  };

  if (loading || !settings) return <div className="h-screen flex items-center justify-center font-black uppercase text-[10px]">Loading Beefirst...</div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-900 font-sans">
      
      {/* HEADER MOBILE */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-black px-6 flex justify-between items-center z-[100] shadow-xl">
        <div className="flex items-center gap-3">
          {settings.logo_url && <img src={settings.logo_url} className="h-8 w-8 object-contain bg-white p-1 rounded-lg" />}
          <span className="font-black text-white text-sm tracking-widest italic">ADMIN</span>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-3 bg-white text-black rounded-xl">
          {isMenuOpen ? <X size={20}/> : <Menu size={20}/>}
        </button>
      </div>

      {/* SIDEBAR */}
      <div className={`fixed inset-0 z-[110] lg:relative lg:z-10 transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:flex'}`}>
        {isMenuOpen && <div className="fixed inset-0 bg-black/80 lg:hidden" onClick={() => setIsMenuOpen(false)}></div>}
        <aside className="relative w-72 bg-white border-r-2 border-slate-200 h-full p-8 flex flex-col shadow-2xl lg:shadow-none">
          <div className="mb-10 hidden lg:block">
            {settings.logo_url && <img src={settings.logo_url} className="h-12 object-contain mb-4" />}
            <h2 className="font-black text-xl tracking-tighter uppercase italic">Beefirst</h2>
          </div>
          <nav className="space-y-2 flex-1">
            <SidebarItem active={activeTab === 'overview'} label="Overview" icon={<LayoutDashboard size={18}/>} onClick={() => {setActiveTab('overview'); setIsMenuOpen(false)}} />
            <SidebarItem active={activeTab === 'list'} label="Bookings" icon={<CalendarDays size={18}/>} onClick={() => {setActiveTab('list'); setIsMenuOpen(false)}} />
            <SidebarItem active={activeTab === 'services'} label="Services" icon={<Plus size={18}/>} onClick={() => {setActiveTab('services'); setIsMenuOpen(false)}} />
            <SidebarItem active={activeTab === 'settings'} label="Settings" icon={<Settings size={18}/>} onClick={() => {setActiveTab('settings'); setIsMenuOpen(false)}} />
          </nav>
          <button onClick={handleLogout} className="mt-10 flex items-center gap-4 p-4 text-red-600 font-black uppercase text-[10px] tracking-widest hover:bg-red-50 rounded-xl transition-all border-t border-slate-100 pt-8">
            <LogOut size={18}/> Logout
          </button>
        </aside>
      </div>

      <main className="flex-1 p-6 lg:p-12 pt-28 lg:pt-12 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-10 border-b-4 border-black pb-4">
            <h1 className="text-4xl font-black tracking-tighter capitalize italic">{activeTab}</h1>
            <button onClick={fetchData} className="p-3 bg-black text-white rounded-xl hover:scale-110 transition-all"><RefreshCw size={14}/></button>
          </header>

          {/* TAB OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Booking" value={bookings.length} color="text-black" bg="bg-white" />
                <StatCard label="Omzet Booking" value={`Rp ${(bookings.length * settings.dp_amount).toLocaleString()}`} color="text-black" bg="bg-white" />
                <StatCard label="Layanan Aktif" value={services.length} color="text-black" bg="bg-white" />
              </div>
              <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border-4 border-black">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-black text-[10px] uppercase tracking-widest">Statistik</h3>
                  <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                    <FilterBtn label="3H" active={timeFilter === '3'} onClick={() => setTimeFilter('3')} />
                    <FilterBtn label="1M" active={timeFilter === '7'} onClick={() => setTimeFilter('7')} />
                    <FilterBtn label="1B" active={timeFilter === '30'} onClick={() => setTimeFilter('30')} />
                    <FilterBtn label="1T" active={timeFilter === '365'} onClick={() => setTimeFilter('365')} />
                  </div>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={getFilteredChartData()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={9} tick={{fill: '#000', fontWeight: 'bold'}} />
                      <YAxis fontSize={9} tick={{fill: '#000', fontWeight: 'bold'}} />
                      <Tooltip />
                      <Bar dataKey="total" fill="#000" radius={[5, 5, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB SERVICES */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <form onSubmit={handleAddService} className="bg-white p-8 rounded-[2rem] border-4 border-black space-y-4 h-fit shadow-xl">
                <h3 className="font-black text-[10px] uppercase tracking-widest">Layanan Baru</h3>
                <input value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="w-full border-2 border-black p-4 rounded-xl font-black text-sm" placeholder="Nama Jasa" />
                <input type="number" value={newService.price} onChange={e => setNewService({...newService, price: Number(e.target.value)})} className="w-full border-2 border-black p-4 rounded-xl font-black text-sm" placeholder="Harga (Rp)" />
                <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Simpan Jasa</button>
              </form>
              <div className="lg:col-span-2 bg-white rounded-[2rem] border-2 border-slate-200 overflow-hidden shadow-xl">
                <table className="w-full text-left font-black uppercase text-xs">
                  <thead className="bg-black text-white"><tr><th className="p-6">Jasa</th><th className="p-6 text-right">Harga</th><th className="p-6 text-center">X</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {services.map(s => (
                      <tr key={s.id}>
                        <td className="p-6">{s.name}</td>
                        <td className="p-6 text-right">Rp {s.price.toLocaleString()}</td>
                        <td className="p-6 flex justify-center"><button onClick={() => handleDeleteService(s.id)} className="text-red-400"><Trash2 size={18}/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB SETTINGS */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-4 border-black flex flex-col items-center">
                <h3 className="font-black text-[10px] uppercase mb-6 tracking-widest italic">Logo Branding</h3>
                <div className="w-32 h-32 bg-slate-50 rounded-3xl border-2 border-dashed border-black flex items-center justify-center overflow-hidden mb-6">
                  {settings.logo_url ? <img src={settings.logo_url} className="w-full h-full object-contain" /> : <ImageIcon className="text-slate-200" size={40} />}
                </div>
                <label className="cursor-pointer bg-black text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all">
                  {uploading ? 'WAIT...' : 'GANTI LOGO'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                </label>
              </div>
              <div className="lg:col-span-2">
                <form onSubmit={(e) => {e.preventDefault(); supabase.from('settings').update(settings).eq('id', 1).then(() => alert("Saved!"))}} className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border-4 border-black space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-black text-black">
                    <div className="space-y-2 uppercase text-[10px] tracking-widest">Nama Bisnis<input value={settings.business_name} onChange={e => setSettings({...settings, business_name: e.target.value})} className="w-full border-2 border-black p-5 rounded-3xl text-sm italic" /></div>
                    <div className="space-y-2 uppercase text-[10px] tracking-widest">WA Admin<input value={settings.whatsapp_admin} onChange={e => setSettings({...settings, whatsapp_admin: e.target.value})} className="w-full border-2 border-black p-5 rounded-3xl text-sm font-mono" /></div>
                    <div className="space-y-2 uppercase text-[10px] tracking-widest">Besar DP (Rp)<input type="number" value={settings.dp_amount} onChange={e => setSettings({...settings, dp_amount: Number(e.target.value)})} className="w-full border-2 border-black p-5 rounded-3xl text-sm" /></div>
                    <div className="space-y-2 uppercase text-[10px] tracking-widest">Tema Warna<input type="color" value={settings.primary_color} onChange={e => setSettings({...settings, primary_color: e.target.value})} className="w-full h-14 rounded-2xl cursor-pointer" /></div>
                  </div>
                  <button type="submit" className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.4em] shadow-2xl active:scale-95 transition-all">Update Pengaturan</button>
                </form>
              </div>
            </div>
          )}

          {/* TAB BOOKING LIST */}
          {activeTab === 'list' && (
            <div className="bg-white rounded-[2rem] shadow-xl border-4 border-black overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-black uppercase text-[10px]">
                  <thead className="bg-black text-white"><tr><th className="p-6">Customer</th><th className="p-6">Service</th><th className="p-6">Time</th><th className="p-6 text-center">Action</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 text-black italic">
                    {bookings.map(b => (
                      <tr key={b.id}>
                        <td className="p-6">{b.customer_name}<p className="text-[8px] font-normal not-italic">{b.customer_wa}</p></td>
                        <td className="p-6"><span className="px-2 py-1 bg-black text-white rounded text-[8px] font-black">{b.service_name}</span></td>
                        <td className="p-6">{b.booking_date} | {b.booking_time}</td>
                        <td className="p-6 flex justify-center gap-4">
                          <a href={`https://wa.me/${b.customer_wa}`} target="_blank" className="text-black"><MessageSquare size={18}/></a>
                          <button onClick={() => handleDeleteBooking(b.id)} className="text-red-500"><Trash2 size={18}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

function SidebarItem({ active, icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest ${active ? 'bg-black text-white shadow-xl translate-x-1' : 'text-slate-400 hover:bg-slate-50 hover:text-black'}`}>
      {icon} {label}
    </button>
  )
}

function FilterBtn({ label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-xl text-[9px] font-black transition-all ${active ? 'bg-black text-white shadow-md' : 'text-slate-400'}`}>
      {label}
    </button>
  )
}

function StatCard({ label, value, color, bg }: any) {
  return (
    <div className={`${bg} p-8 rounded-[2rem] shadow-xl border-4 border-black flex flex-col gap-4`}>
      <div className={`w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center shadow-inner`}><Wallet size={20}/></div>
      <div>
        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-2xl font-black ${color} italic`}>{value}</p>
      </div>
    </div>
  )
}