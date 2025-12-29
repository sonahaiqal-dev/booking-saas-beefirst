'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { LayoutDashboard, CalendarDays, Settings, Users, Wallet, RefreshCw, MessageSquare, Menu, X, Trash2, Plus, Filter, ImageIcon, LogOut } from 'lucide-react'

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

  // --- CEK SESI & FETCH ---
  const fetchData = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return window.location.replace('/login') // FIX: Langsung lempar jika tidak login

    const { data: bData } = await supabase.from('bookings').select('*').order('booking_date', { ascending: false })
    if (bData) setBookings(bData)
    const { data: sData } = await supabase.from('settings').select('*').single()
    if (sData) setSettings(sData)
    const { data: svData } = await supabase.from('services').select('*').order('created_at', { ascending: true })
    if (svData) setServices(svData)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // --- FIX LOGOUT: BERSIH & ANTI 404 ---
  const handleLogout = async () => {
    if (confirm("LOGOUT DARI SISTEM?")) {
      await supabase.auth.signOut()
      localStorage.clear()
      sessionStorage.clear()
      window.location.replace('/login') // FIX: Menggantikan router.push untuk menghindari 404 rute internal
    }
  }

  // --- ACTIONS ---
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newService.name || newService.price <= 0) return
    const { error } = await supabase.from('services').insert([newService])
    if (!error) { fetchData(); setNewService({ name: '', price: 0 }); alert("Layanan Ditambahkan!"); }
  }

  const handleDeleteService = async (id: string) => {
    if (confirm("Hapus layanan?")) {
      await supabase.from('services').delete().eq('id', id)
      fetchData()
    }
  }

  const handleLogoUpload = async (event: any) => {
    setUploading(true)
    const file = event.target.files[0]
    if (!file) return
    const fileName = `logo-${Math.random()}.${file.name.split('.').pop()}`
    await supabase.storage.from('logos').upload(fileName, file)
    const { data } = supabase.storage.from('logos').getPublicUrl(fileName)
    await supabase.from('settings').update({ logo_url: data.publicUrl }).eq('id', 1)
    setSettings({ ...settings, logo_url: data.publicUrl })
    setUploading(false)
    alert("Logo Diperbarui!")
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

  if (loading || !settings) return <div className="h-screen flex items-center justify-center font-black uppercase text-xs">Beefirst Loading...</div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-900 font-sans">
      <style jsx global>{`
        input, select { color: #000 !important; -webkit-text-fill-color: #000 !important; }
      `}</style>
      
      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-72 bg-white border-r-2 border-slate-200 h-screen p-8 flex-col fixed">
        <div className="mb-10">
          {settings.logo_url && <img src={settings.logo_url} className="h-10 object-contain mb-4" />}
          <h2 className="font-black text-xl uppercase italic">Beefirst</h2>
        </div>
        <nav className="space-y-2 flex-1">
          <SidebarItem active={activeTab === 'overview'} label="Overview" icon={<LayoutDashboard size={18}/>} onClick={() => setActiveTab('overview')} />
          <SidebarItem active={activeTab === 'list'} label="Bookings" icon={<CalendarDays size={18}/>} onClick={() => setActiveTab('list')} />
          <SidebarItem active={activeTab === 'services'} label="Services" icon={<Plus size={18}/>} onClick={() => setActiveTab('services')} />
          <SidebarItem active={activeTab === 'settings'} label="Settings" icon={<Settings size={18}/>} onClick={() => setActiveTab('settings')} />
        </nav>
        <button onClick={handleLogout} className="mt-10 flex items-center gap-4 p-4 text-red-500 font-black uppercase text-[10px] tracking-widest hover:bg-red-50 rounded-xl transition-all">
          <LogOut size={18}/> Logout System
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 lg:ml-72 p-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-black tracking-tighter capitalize mb-10 italic">{activeTab}</h1>

          {activeTab === 'overview' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Booking" value={bookings.length} color="text-black" bg="bg-white" />
                <StatCard label="Estimasi Omzet" value={`Rp ${(bookings.length * settings.dp_amount).toLocaleString()}`} color="text-black" bg="bg-white" />
                <StatCard label="Layanan Aktif" value={services.length} color="text-black" bg="bg-white" />
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
                <div className="flex justify-between items-center mb-8 font-black uppercase text-[10px]">
                  <span>Statistik</span>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <FilterBtn label="1M" active={timeFilter === '7'} onClick={() => setTimeFilter('7')} />
                    <FilterBtn label="1B" active={timeFilter === '30'} onClick={() => setTimeFilter('30')} />
                  </div>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={getFilteredChartData()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
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

          {activeTab === 'list' && (
            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-left uppercase text-[10px] font-black">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr><th className="p-6">Customer</th><th className="p-6">Service</th><th className="p-6">Date</th><th className="p-6 text-center">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 italic">
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td className="p-6">{b.customer_name}<p className="text-[8px] font-normal not-italic">{b.customer_wa}</p></td>
                      <td className="p-6"><span className="px-2 py-1 bg-black text-white rounded text-[8px]">{b.service_name}</span></td>
                      <td className="p-6">{b.booking_date}</td>
                      <td className="p-6 flex justify-center gap-4">
                        <a href={`https://wa.me/${b.customer_wa}`} target="_blank" className="text-black"><MessageSquare size={18}/></a>
                        <button onClick={() => {if(confirm("Hapus?")) supabase.from('bookings').delete().eq('id', b.id).then(() => fetchData())}} className="text-red-400"><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <form onSubmit={handleAddService} className="bg-white p-8 rounded-[2rem] border-2 border-slate-200 space-y-4 shadow-lg h-fit">
                <h3 className="font-black text-[10px] uppercase italic">Add Service</h3>
                <input value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="w-full border-2 border-slate-200 p-4 rounded-xl font-black text-sm" placeholder="Nama Jasa" />
                <input type="number" value={newService.price} onChange={e => setNewService({...newService, price: Number(e.target.value)})} className="w-full border-2 border-slate-200 p-4 rounded-xl font-black text-sm" placeholder="Harga" />
                <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest">Simpan</button>
              </form>
              <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-xl">
                <table className="w-full text-left uppercase text-xs font-black">
                  <thead className="bg-slate-50 border-b-2"><tr><th className="p-6">Service</th><th className="p-6 text-right">Price</th><th className="p-6 text-center">X</th></tr></thead>
                  <tbody className="divide-y">
                    {services.map(s => (
                      <tr key={s.id}>
                        <td className="p-6">{s.name}</td>
                        <td className="p-6 text-right">Rp {s.price.toLocaleString()}</td>
                        <td className="p-6 text-center"><button onClick={() => handleDeleteService(s.id)} className="text-red-400"><Trash2 size={18}/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
             <form onSubmit={(e) => {e.preventDefault(); supabase.from('settings').update(settings).eq('id', 1).then(() => alert("Updated!"))}} className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-black uppercase text-[10px]">
                  <div className="space-y-2">Nama Bisnis<input value={settings.business_name} onChange={e => setSettings({...settings, business_name: e.target.value})} className="w-full border-2 border-slate-200 p-4 rounded-2xl text-sm italic" /></div>
                  <div className="space-y-2">WA Admin<input value={settings.whatsapp_admin} onChange={e => setSettings({...settings, whatsapp_admin: e.target.value})} className="w-full border-2 border-slate-200 p-4 rounded-2xl text-sm" /></div>
                  <div className="space-y-2">DP (Rp)<input type="number" value={settings.dp_amount} onChange={e => setSettings({...settings, dp_amount: Number(e.target.value)})} className="w-full border-2 border-slate-200 p-4 rounded-2xl text-sm" /></div>
                  <div className="space-y-2 text-center">Ganti Logo<br/><input type="file" onChange={handleLogoUpload} className="mt-2 text-[8px]" /></div>
               </div>
               <button type="submit" className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase text-xs tracking-widest">Update All Settings</button>
             </form>
          )}

        </div>
      </main>
    </div>
  )
}

function SidebarItem({ active, icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-xl font-black transition-all uppercase text-[10px] tracking-widest ${active ? 'bg-black text-white shadow-xl translate-x-1' : 'text-slate-400 hover:bg-slate-50 hover:text-black'}`}>
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
    <div className={`${bg} p-8 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col gap-4`}>
      <div className={`w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center`}><Wallet size={20}/></div>
      <div>
        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-2xl font-black ${color} italic`}>{value}</p>
      </div>
    </div>
  )
}