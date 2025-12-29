'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts'
import { 
  LayoutDashboard, CalendarDays, Settings, Users, Wallet, RefreshCw, 
  MessageSquare, Menu, X, Trash2, Plus, Filter, ImageIcon, Lock, LogOut 
} from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(true)

  const [activeTab, setActiveTab] = useState('overview')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [bookings, setBookings] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const [timeFilter, setTimeFilter] = useState('7')
  const [newService, setNewService] = useState({ name: '', price: 0 })

  // --- LOGIKA AUTENTIKASI ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      setSession(currentSession)
      setAuthLoading(false)
      if (currentSession) fetchData()
    }
    checkUser()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    })
    if (error) {
      alert("Gagal Login: " + error.message)
      setAuthLoading(false)
    } else {
      window.location.reload()
    }
  }

  // --- FIX LOGOUT: ANTI 404 & BERSIH TOTAL ---
  const handleLogout = async () => {
    try {
      // 1. Sign out dari Supabase
      await supabase.auth.signOut();
      
      // 2. Bersihkan semua storage untuk mencegah sesi nyangkut
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        
        // 3. Gunakan replace agar history browser tidak bisa kembali ke admin
        window.location.replace('/login');
      }
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.replace('/login');
    }
  };

  // --- LOGIKA DATA ---
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

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newService.name || newService.price <= 0) return alert("Isi data layanan dengan benar!")
    const { error } = await supabase.from('services').insert([newService])
    if (!error) { 
        fetchData(); 
        setNewService({ name: '', price: 0 }); 
        alert("Layanan ditambahkan!"); 
    }
  }

  const handleDeleteService = async (id: string) => {
    if (confirm("Hapus layanan ini?")) {
      const { error } = await supabase.from('services').delete().eq('id', id)
      if (!error) fetchData()
    }
  }

  const handleLogoUpload = async (event: any) => {
    try {
      setUploading(true)
      const file = event.target.files[0]
      if (!file) return
      const fileExt = file.name.split('.').pop()
      const fileName = `logo-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`
      const { error: uploadError } = await supabase.storage.from('logos').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('logos').getPublicUrl(filePath)
      const publicUrl = data.publicUrl
      const { error: dbError } = await supabase.from('settings').update({ logo_url: publicUrl }).eq('id', 1)
      if (dbError) throw dbError
      setSettings({ ...settings, logo_url: publicUrl })
      alert("Logo Berhasil Diperbarui!")
    } catch (error: any) {
      alert("Error: " + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('settings').update(settings).eq('id', 1)
    if (!error) alert("Sistem Beefirst Visual Berhasil Diupdate!")
  }

  const getFilteredChartData = () => {
    const now = new Date();
    const filterDays = parseInt(timeFilter);
    const filtered = bookings.filter(b => {
      const bDate = new Date(b.booking_date);
      const diffTime = Math.abs(now.getTime() - bDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

  if (authLoading) return <div className="h-screen flex items-center justify-center font-black uppercase text-[10px] tracking-widest text-slate-400 animate-pulse">Authenticating Beefirst System...</div>

  // --- VIEW: LOGIN FORM ---
  if (!session) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <style jsx global>{`
        input { color: #000 !important; -webkit-text-fill-color: #000 !important; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0px 1000px white inset !important; -webkit-text-fill-color: #000 !important; }
      `}</style>
      <div className="w-full max-w-md bg-white p-12 rounded-[3rem] shadow-2xl border-4 border-black">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-black text-white rounded-3xl flex items-center justify-center mb-4 shadow-xl">
            <Lock size={32} />
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">Admin Login</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 text-center">Beefirst Visual Access</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-black">Email</label>
            <input required type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full bg-slate-50 border-2 border-black p-5 rounded-2xl font-black outline-none transition-all uppercase text-sm" placeholder="ADMIN@BEEFIRST.COM" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-black">Password</label>
            <input required type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full bg-slate-50 border-2 border-black p-5 rounded-2xl font-black outline-none transition-all text-sm" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.4em] shadow-2xl active:scale-95 transition-all">
            Enter Dashboard
          </button>
        </form>
      </div>
    </div>
  )

  if (loading || !settings) return <div className="h-screen flex items-center justify-center font-black uppercase text-[10px] tracking-widest text-black">Beefirst System Loading...</div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-900 font-sans">
      {/* CSS FIX UNTUK MOBILE FONT */}
      <style jsx global>{`
        input, select, textarea { color: #000 !important; -webkit-text-fill-color: #000 !important; background-color: #fff !important; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0px 1000px white inset !important; -webkit-text-fill-color: #000 !important; }
      `}</style>

      {/* HEADER MOBILE */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-black px-6 flex justify-between items-center z-[100] shadow-xl">
        <div className="flex items-center gap-3">
          {settings.logo_url && <img src={settings.logo_url} className="h-8 w-8 object-contain rounded-lg bg-white p-1" />}
          <span className="font-black text-white uppercase tracking-tighter text-sm italic">ADMIN</span>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-3 bg-white text-black rounded-xl border-2 border-black">
          {isMenuOpen ? <X size={20}/> : <Menu size={20}/>}
        </button>
      </div>

      {/* SIDEBAR */}
      <div className={`fixed inset-0 z-[110] lg:relative lg:z-10 transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:flex'}`}>
        {isMenuOpen && <div className="fixed inset-0 bg-black/80 lg:hidden" onClick={() => setIsMenuOpen(false)}></div>}
        <aside className="relative w-72 bg-white border-r-4 border-black h-full p-8 flex flex-col shadow-2xl lg:shadow-none overflow-y-auto">
          <div className="mb-10 hidden lg:block">
            {settings.logo_url && <img src={settings.logo_url} className="h-12 object-contain mb-4" />}
            <h2 className="font-black text-2xl tracking-tighter uppercase italic">Beefirst</h2>
          </div>
          <nav className="space-y-2 mt-10 lg:mt-0 flex-1">
            <SidebarItem active={activeTab === 'overview'} label="Overview" icon={<LayoutDashboard size={18}/>} onClick={() => {setActiveTab('overview'); setIsMenuOpen(false)}} />
            <SidebarItem active={activeTab === 'list'} label="Bookings" icon={<CalendarDays size={18}/>} onClick={() => {setActiveTab('list'); setIsMenuOpen(false)}} />
            <SidebarItem active={activeTab === 'services'} label="Services" icon={<Plus size={18}/>} onClick={() => {setActiveTab('services'); setIsMenuOpen(false)}} />
            <SidebarItem active={activeTab === 'settings'} label="Settings" icon={<Settings size={18}/>} onClick={() => {setActiveTab('settings'); setIsMenuOpen(false)}} />
          </nav>
          
          <button 
              onClick={handleLogout}
              className="mt-10 flex items-center gap-4 p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest text-red-600 hover:bg-red-50 border-t-4 border-black transition-all w-full mb-4"
              >
              <LogOut size={20} strokeWidth={3} />
              <span>Log Out System</span>
          </button>
        </aside>
      </div>

      {/* KONTEN */}
      <main className="flex-1 p-6 lg:p-12 pt-28 lg:pt-12 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-10 border-b-4 border-black pb-6">
            <h1 className="text-4xl font-black tracking-tighter capitalize leading-none italic">{activeTab}</h1>
            <button onClick={fetchData} className="p-3 bg-black text-white rounded-xl hover:scale-110 transition-all shadow-lg"><RefreshCw size={14}/></button>
          </header>

          {activeTab === 'overview' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Booking" value={bookings.length} color="text-black" bg="bg-white" />
                <StatCard label="Estimasi Omzet" value={`Rp ${(bookings.length * settings.dp_amount).toLocaleString()}`} color="text-black" bg="bg-white" />
                <StatCard label="Layanan Aktif" value={services.length} color="text-black" bg="bg-white" />
              </div>
              <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border-4 border-black">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-black">Statistik Aktivitas</h3>
                  <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border-2 border-black">
                    <FilterBtn label="3H" active={timeFilter === '3'} onClick={() => setTimeFilter('3')} />
                    <FilterBtn label="1M" active={timeFilter === '7'} onClick={() => setTimeFilter('7')} />
                    <FilterBtn label="1B" active={timeFilter === '30'} onClick={() => setTimeFilter('30')} />
                    <FilterBtn label="1T" active={timeFilter === '365'} onClick={() => setTimeFilter('365')} />
                  </div>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={getFilteredChartData()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee"/>
                      <XAxis dataKey="name" fontSize={9} tick={{fill: '#000', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                      <YAxis fontSize={9} tick={{fill: '#000', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="total" fill="#000" radius={[5, 5, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'list' && (
            <div className="bg-white rounded-[2rem] shadow-xl border-4 border-black overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-black border-b-2 border-black font-black uppercase text-[10px] tracking-widest text-white text-center">
                    <tr><th className="p-6">Customer</th><th className="p-6">Layanan</th><th className="p-6">Waktu</th><th className="p-6">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y-2 divide-black font-bold text-black uppercase">
                    {bookings.map(b => (
                      <tr key={b.id} className="text-xs text-center hover:bg-slate-50 transition-colors">
                        <td className="p-6 font-black uppercase text-xs">{b.customer_name}<p className="text-[10px] text-slate-500 font-normal italic">{b.customer_wa}</p></td>
                        <td className="p-6"><span className="px-4 py-1 bg-black text-white rounded-full text-[8px] font-black uppercase">{b.service_name}</span></td>
                        <td className="p-6 text-[10px] uppercase font-mono">{b.booking_date} | {b.booking_time}</td>
                        <td className="p-6 flex justify-center gap-6">
                          <a href={`https://wa.me/${b.customer_wa}`} target="_blank" className="text-black hover:scale-125 transition-transform"><MessageSquare size={20}/></a>
                          <button onClick={() => {if(confirm("Hapus?")) supabase.from('bookings').delete().eq('id', b.id).then(() => fetchData())}} className="text-red-600 hover:scale-125 transition-transform"><Trash2 size={20}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <form onSubmit={handleAddService} className="bg-white p-8 rounded-[2.5rem] border-4 border-black space-y-6 h-fit shadow-xl">
                <h3 className="font-black text-black uppercase text-xs tracking-widest mb-2 italic">Layanan Baru</h3>
                <input value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="w-full border-2 border-black p-5 rounded-2xl font-black bg-slate-50 text-sm uppercase" placeholder="NAMA JASA" />
                <input type="number" value={newService.price} onChange={e => setNewService({...newService, price: Number(e.target.value)})} className="w-full border-2 border-black p-5 rounded-2xl font-black bg-slate-50 text-sm" placeholder="HARGA (RP)" />
                <button type="submit" className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">Simpan Jasa</button>
              </form>
              <div className="lg:col-span-2 bg-white rounded-[2.5rem] border-4 border-black shadow-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-black border-b-2 border-black font-black text-white text-[10px] uppercase tracking-widest">
                    <tr><th className="p-6">Nama Jasa</th><th className="p-6 text-right">Harga</th><th className="p-6 text-center">Hapus</th></tr>
                  </thead>
                  <tbody className="divide-y-2 divide-black font-black text-black uppercase text-xs">
                    {services.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-6">{s.name}</td>
                        <td className="p-6 text-right font-mono">Rp {s.price.toLocaleString()}</td>
                        <td className="p-6 flex justify-center">
                            <button type="button" onClick={() => handleDeleteService(s.id)} className="text-red-600 hover:scale-125 transition-transform p-2">
                                <Trash2 size={20} strokeWidth={3} />
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-4 border-black flex flex-col items-center">
                <h3 className="font-black text-[10px] uppercase tracking-widest mb-6 italic text-black">Logo Branding</h3>
                <div className="w-32 h-32 bg-slate-50 rounded-3xl border-4 border-dashed border-black flex items-center justify-center overflow-hidden mb-8 shadow-inner">
                  {settings.logo_url ? <img src={settings.logo_url} className="w-full h-full object-contain" /> : <ImageIcon className="text-slate-300" size={40} />}
                </div>
                <label className="cursor-pointer bg-black text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all w-full text-center">
                  {uploading ? 'PROSES...' : 'UPLOAD LOGO'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                </label>
              </div>
              <div className="lg:col-span-2">
                <form onSubmit={handleUpdateSettings} className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border-4 border-black space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 italic text-black">Nama Bisnis</label>
                      <input value={settings.business_name} onChange={e => setSettings({...settings, business_name: e.target.value})} className="w-full border-2 border-black p-5 rounded-3xl font-black text-black bg-white focus:shadow-xl outline-none transition-all uppercase" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 italic text-black">WA Admin</label>
                      <input value={settings.whatsapp_admin} onChange={e => setSettings({...settings, whatsapp_admin: e.target.value})} className="w-full border-2 border-black p-5 rounded-3xl font-black text-black bg-white font-mono" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 italic text-black">Warna Branding</label>
                      <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-3xl border-2 border-black shadow-inner">
                        <input type="color" value={settings.primary_color} onChange={e => setSettings({...settings, primary_color: e.target.value})} className="h-12 w-24 rounded-xl cursor-pointer border-2 border-black" />
                        <span className="text-black font-black uppercase font-mono text-xs">{settings.primary_color}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 italic text-black">Besar DP (Rp)</label>
                      <input type="number" value={settings.dp_amount} onChange={e => setSettings({...settings, dp_amount: Number(e.target.value)})} className="w-full border-2 border-black p-5 rounded-3xl font-black text-black bg-white shadow-sm" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.5em] shadow-2xl active:scale-95 transition-all mt-4 border-4 border-black hover:bg-white hover:text-black">Update Pengaturan</button>
                </form>
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
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black transition-all uppercase text-[10px] tracking-widest ${active ? 'bg-black text-white shadow-xl translate-x-1 border-2 border-black' : 'text-slate-500 hover:bg-slate-100 hover:text-black border-2 border-transparent'}`}>
      {icon} {label}
    </button>
  )
}

function FilterBtn({ label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`px-5 py-2 rounded-xl text-[9px] font-black transition-all ${active ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:text-black'}`}>
      {label}
    </button>
  )
}

function StatCard({ label, value, color, bg }: any) {
  return (
    <div className={`${bg} p-10 rounded-[2.5rem] shadow-xl border-4 border-black flex flex-col gap-5 hover:scale-105 transition-all`}>
      <div className={`w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shadow-inner`}><Wallet size={24}/></div>
      <div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-3xl font-black ${color} tracking-tighter italic`}>{value}</p>
      </div>
    </div>
  )
}