'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts'
import { 
  LayoutDashboard, CalendarDays, Settings, Users, Wallet, RefreshCw, Plus, Trash2, MessageSquare 
} from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [bookings, setBookings] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [settings, setSettings] = useState<any>({
    business_name: '',
    primary_color: '#4f46e5',
    dp_amount: 0,
    whatsapp_admin: ''
  })
  
  const [newService, setNewService] = useState({ name: '', price: 0, duration: '50 Menit' })
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
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const chartData = bookings.reduce((acc: any[], curr) => {
    const day = curr.booking_date;
    const found = acc.find(item => item.name === day);
    if (found) { found.total += 1; } 
    else { acc.push({ name: day, total: 1 }); }
    return acc;
  }, []).slice(0, 7).reverse();

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('settings').update(settings).eq('id', 1)
    if (error) alert("Gagal update: " + error.message)
    else alert("Pengaturan Berhasil Disimpan!")
  }

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newService.name || newService.price <= 0) return
    const { error } = await supabase.from('services').insert([newService])
    if (error) alert(error.message)
    else {
      setNewService({ name: '', price: 0, duration: '50 Menit' })
      fetchData()
    }
  }

  const deleteService = async (id: string) => {
    if (confirm("Hapus layanan ini?")) {
      await supabase.from('services').delete().eq('id', id)
      fetchData()
    }
  }

  const deleteBooking = async (id: string) => {
    if (confirm("Hapus data booking ini?")) {
      await supabase.from('bookings').delete().eq('id', id)
      fetchData()
    }
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50 font-bold text-slate-900">
      Loading Dashboard...
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* SIDEBAR */}
      <div className="w-72 bg-white border-r border-slate-200 p-8 space-y-2 hidden lg:block">
        <div className="mb-10">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">ADMIN PANEL</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Beefirst Visual SaaS</p>
        </div>
        
        <nav className="space-y-1">
          <SidebarItem active={activeTab === 'overview'} icon={<LayoutDashboard size={20}/>} label="Overview" onClick={() => setActiveTab('overview')} />
          <SidebarItem active={activeTab === 'list'} icon={<CalendarDays size={20}/>} label="Bookings" onClick={() => setActiveTab('list')} />
          <SidebarItem active={activeTab === 'services'} icon={<Users size={20}/>} label="Services" onClick={() => setActiveTab('services')} />
          <SidebarItem active={activeTab === 'settings'} icon={<Settings size={20}/>} label="Settings" onClick={() => setActiveTab('settings')} />
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 capitalize">{activeTab}</h1>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm font-bold text-slate-900 text-sm">
            <RefreshCw size={16}/> Refresh Data
          </button>
        </header>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard icon={<Users className="text-blue-700"/>} bg="bg-blue-100" label="Total Booking" value={bookings.length} />
              <StatCard icon={<Wallet className="text-green-700"/>} bg="bg-green-100" label="Omzet Booking" value={`Rp ${(bookings.length * (settings.dp_amount || 0)).toLocaleString()}`} />
              <StatCard icon={<CalendarDays className="text-purple-700"/>} bg="bg-purple-100" label="Layanan Aktif" value={services.length} />
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="font-black text-slate-900 mb-8 flex items-center gap-2 uppercase text-xs tracking-widest">Statistik Reservasi</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#0f172a', fontWeight: 'bold'}} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#0f172a', fontWeight: 'bold'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="total" fill={settings.primary_color || '#4f46e5'} radius={[8, 8, 0, 0]} barSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKINGS LIST */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-100 border-b-2 border-slate-200 font-black text-slate-900 uppercase text-[11px] tracking-widest">
                <tr>
                  <th className="p-6">Pelanggan</th>
                  <th className="p-6">Layanan</th>
                  <th className="p-6">Jadwal</th>
                  <th className="p-6">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-900 font-bold">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6">
                        <p className="text-slate-900 font-black">{b.customer_name}</p>
                        <p className="text-xs text-slate-600 font-mono">{b.customer_wa}</p>
                    </td>
                    <td className="p-6"><span className="px-3 py-1 bg-indigo-50 text-indigo-800 rounded-full text-xs font-black">{b.service_name}</span></td>
                    <td className="p-6 text-slate-900">{b.booking_date} <span className="text-slate-400 ml-2">|</span> {b.booking_time}</td>
                    <td className="p-6 flex gap-4">
                        <a href={`https://wa.me/${b.customer_wa}`} target="_blank" className="text-green-600 hover:scale-110 transition-transform"><MessageSquare size={20}/></a>
                        <button onClick={() => deleteBooking(b.id)} className="text-slate-300 hover:text-red-600 transition-colors"><Trash2 size={20}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: SERVICES (FIXED CONTRAST) */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={handleAddService} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 h-fit">
              <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2 uppercase text-xs tracking-widest"><Plus size={18} /> Tambah Baru</h3>
              <div>
                <label className="text-[10px] font-black text-slate-900 uppercase mb-2 block tracking-widest">Nama Layanan</label>
                <input required value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="w-full border-2 border-slate-200 p-4 rounded-2xl focus:border-indigo-500 outline-none text-slate-900 font-black transition-all bg-slate-50" placeholder="e.g. Foto Produk" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-900 uppercase mb-2 block tracking-widest">Harga Jasa (Rp)</label>
                <input required type="number" value={newService.price} onChange={e => setNewService({...newService, price: Number(e.target.value)})} className="w-full border-2 border-slate-200 p-4 rounded-2xl focus:border-indigo-500 outline-none text-slate-900 font-black transition-all bg-slate-50" />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg hover:shadow-none transition-all active:scale-95">SIMPAN LAYANAN</button>
            </form>

            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 border-b-2 border-slate-200 font-black text-slate-900 text-[11px] uppercase tracking-widest">
                  <tr>
                    <th className="p-6">Nama Layanan</th>
                    <th className="p-6">Harga</th>
                    <th className="p-6">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-6 font-black text-slate-900">{s.name}</td>
                      <td className="p-6 font-bold text-slate-900">Rp {s.price.toLocaleString()}</td>
                      <td className="p-6">
                        <button onClick={() => deleteService(s.id)} className="text-slate-300 hover:text-red-600 transition-colors">
                          <Trash2 size={18}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleUpdateSettings} className="max-w-2xl bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-widest mb-3">Nama Bisnis</label>
                <input 
                  value={settings.business_name} 
                  onChange={e => setSettings({...settings, business_name: e.target.value})} 
                  className="w-full border-2 border-slate-300 p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all font-black text-slate-900 bg-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-widest mb-3">WhatsApp Admin</label>
                <input 
                  value={settings.whatsapp_admin} 
                  onChange={e => setSettings({...settings, whatsapp_admin: e.target.value})} 
                  className="w-full border-2 border-slate-300 p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all font-black text-slate-900 bg-white font-mono" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-widest mb-3">Warna Tema Utama</label>
                <div className="flex gap-4 items-center bg-slate-50 p-3 rounded-2xl border-2 border-slate-300">
                  <input type="color" value={settings.primary_color} onChange={e => setSettings({...settings, primary_color: e.target.value})} className="h-12 w-16 rounded-xl cursor-pointer" />
                  <span className="text-slate-900 font-black uppercase font-mono">{settings.primary_color}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-widest mb-3">Besar DP Booking (Rp)</label>
                <input 
                  type="number" 
                  value={settings.dp_amount} 
                  onChange={e => setSettings({...settings, dp_amount: Number(e.target.value)})} 
                  className="w-full border-2 border-slate-300 p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all font-black text-slate-900 bg-white" 
                />
              </div>
            </div>
            
            <button type="submit" style={{backgroundColor: settings.primary_color}} className="w-full text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:opacity-90 active:scale-[0.98] transition-all uppercase tracking-widest">
              Simpan Pengaturan
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function SidebarItem({ active, icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-5 rounded-[1.5rem] font-black transition-all uppercase text-[11px] tracking-widest ${active ? 'bg-slate-900 text-white shadow-xl translate-x-2' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}>
      {icon} {label}
    </button>
  )
}

function StatCard({ icon, bg, label, value }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex items-center gap-6 group hover:shadow-lg transition-all">
      <div className={`p-5 ${bg} rounded-2xl transition-transform group-hover:rotate-12`}>{icon}</div>
      <div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
      </div>
    </div>
  )
}