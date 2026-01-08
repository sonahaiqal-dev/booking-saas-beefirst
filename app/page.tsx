'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Wallet, CalendarDays, ImageIcon, 
  Scissors, Utensils, BedDouble, GraduationCap, 
  ArrowRight, CheckCircle2, MapPin, Clock, Send
} from 'lucide-react' 
import Script from 'next/script'

declare global {
  interface Window {
    snap: any;
  }
}

export default function BookingPage() {
  const [siteSettings, setSiteSettings] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [bookedSlots, setBookings] = useState<string[]>([])
  const [isSnapReady, setIsSnapReady] = useState(false)
  
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('') 
  const [selectedService, setSelectedService] = useState<any>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(false)

  const availableTimeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']

  useEffect(() => {
    const initData = async () => {
      // Ambil data settings (termasuk is_dp_enabled)
      const { data: sData } = await supabase.from('settings').select('*').single()
      if (sData) {
        setSiteSettings(sData)
        document.title = `${sData.business_name} | Booking Online`
      }
      
      const { data: svData } = await supabase.from('services').select('*').order('price', { ascending: true })
      if (svData) setServices(svData)
    }
    initData()
  }, [])

  useEffect(() => {
    const fetchBooked = async () => {
      if (!date) return
      const { data } = await supabase.from('bookings').select('booking_time').eq('booking_date', date)
      if (data) setBookings(data.map(b => b.booking_time.slice(0, 5)))
    }
    fetchBooked()
    setTime('') 
  }, [date])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validasi input
    if (!name || !whatsapp || !date || !time || !selectedService) {
      return alert("Mohon lengkapi semua data!")
    }

    // Cek kesiapan Snap HANYA JIKA DP diaktifkan
    if (siteSettings?.is_dp_enabled && !isSnapReady) {
       return alert("Sistem pembayaran sedang menyiapkan koneksi. Tunggu sebentar...")
    }

    setLoading(true)

    try {
      // 1. Simpan ke Database dulu (Status Pending)
      const { data: booking, error: dbError } = await supabase
        .from('bookings')
        .insert([{ 
          customer_name: name, 
          customer_wa: whatsapp,
          service_name: selectedService.name,
          booking_date: date, 
          booking_time: time,
          payment_status: siteSettings?.is_dp_enabled ? 'pending' : 'confirmed' // Jika tanpa DP, langsung confirm
        }])
        .select().single()

      if (dbError) throw dbError

      // --- PERCABANGAN LOGIKA ---
      
      if (siteSettings?.is_dp_enabled) {
        // A. JIKA SISTEM DP AKTIF -> KE MIDTRANS
        const response = await fetch('/api/tokenizer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: booking.id, name: name, price: siteSettings?.dp_amount || 0 })
        })
        
        const resData = await response.json()

        window.snap.pay(resData.token, {
          onSuccess: () => {
            alert("Pembayaran Berhasil!")
            const msg = `Halo Admin, saya ${name} sudah bayar DP untuk layanan ${selectedService.name} pada tanggal ${date} jam ${time}.`
            window.open(`https://wa.me/${siteSettings?.whatsapp_admin}?text=${encodeURIComponent(msg)}`, '_blank')
            window.location.reload()
          },
          onPending: () => alert("Menunggu pembayaran..."),
          onError: () => alert("Pembayaran gagal!"),
          onClose: () => alert("Jendela pembayaran ditutup.")
        })

      } else {
        // B. JIKA SISTEM DP MATI -> LANGSUNG WHATSAPP
        alert("Booking Berhasil Terkirim!")
        const msg = `Halo Admin, saya ${name} ingin booking layanan ${selectedService.name} pada tanggal ${date} jam ${time}. Mohon konfirmasinya.`
        window.open(`https://wa.me/${siteSettings?.whatsapp_admin}?text=${encodeURIComponent(msg)}`, '_blank')
        window.location.reload()
      }

    } catch (err: any) {
      alert("Kesalahan: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // --- UI RENDER ---

  if (!siteSettings) return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4 bg-gray-50">
      <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
    </div>
  )

  const primaryColor = siteSettings?.primary_color || '#1e293b'
  const isDpEnabled = siteSettings?.is_dp_enabled; // Helper variable

  return (
    <div className="min-h-screen font-sans text-slate-800 selection:bg-slate-200 selection:text-slate-900">
      
      {/* Script Midtrans hanya perlu diload, tidak masalah ada walaupun tidak dipakai */}
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        onLoad={() => setIsSnapReady(true)}
      />

      {/* BACKGROUND GRADIENT HALUS */}
      <div className="fixed inset-0 z-0 bg-[#F8FAFC]">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white to-transparent opacity-80"></div>
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-slate-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* --- SECTION SHOWCASE --- */}
        <div className="mb-12 text-center space-y-8">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-100 mb-4">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Beefirst Visual SaaS</span>
           </div>

           <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
             Bisnis Profesional <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-400">Butuh Sistem Digital</span>
           </h1>
           
           <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
             Lihat bagaimana <strong>Beefirst</strong> mengubah cara bisnis Anda menerima pesanan. 
             Pilih demo di bawah ini:
           </p>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              {[
                { icon: Scissors, label: "Salon & Spa", color: "text-pink-500", bg: "hover:bg-pink-50", link: "#" },
                { icon: Utensils, label: "Resto & Cafe", color: "text-orange-500", bg: "hover:bg-orange-50", link: "#" },
                { icon: BedDouble, label: "Guest House", color: "text-blue-500", bg: "hover:bg-blue-50", link: "#" },
                { icon: GraduationCap, label: "Education", color: "text-emerald-500", bg: "hover:bg-emerald-50", link: "#" }
              ].map((item, idx) => (
                <a 
                  key={idx}
                  href={item.link}
                  target="_blank"
                  className={`group relative flex flex-col items-center p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${item.bg}`}
                >
                  <div className={`p-3 rounded-full bg-slate-50 mb-3 group-hover:scale-110 transition-transform ${item.color}`}>
                    <item.icon size={24} />
                  </div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{item.label}</span>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={14} className="text-slate-400" />
                  </div>
                </a>
              ))}
           </div>
        </div>

        {/* --- BOOKING FORM --- */}
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden relative">
            
            <div style={{ backgroundColor: primaryColor }} className="relative px-8 pt-12 pb-10 text-white overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
               <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
               <div className="absolute top-20 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

               <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="bg-white p-1 rounded-2xl shadow-lg mb-5 rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="bg-white rounded-xl overflow-hidden w-[80px] h-[80px] flex items-center justify-center border border-slate-100">
                      {siteSettings?.logo_url ? (
                        <img src={siteSettings.logo_url} alt="Logo" className="w-14 h-14 object-contain"/>
                      ) : (
                        <ImageIcon className="text-slate-300" size={32} />
                      )}
                    </div>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight mb-1">{siteSettings?.business_name}</h2>
                  <p className="text-[10px] uppercase tracking-[0.2em] opacity-80 font-medium">Official Booking Page</p>
               </div>
            </div>

            <form onSubmit={handleBooking} className="p-8 space-y-8">
              
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nama Lengkap</label>
                  <input 
                    required 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 focus:border-slate-400 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                    placeholder="Contoh: Budi Santoso" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">WhatsApp</label>
                  <input 
                    required 
                    type="tel"
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 focus:border-slate-400 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                    placeholder="Contoh: 0812..." 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Pilih Layanan</label>
                <div className="space-y-3">
                  {services.map(s => {
                    const isSelected = selectedService?.id === s.id;
                    return (
                      <button 
                        key={s.id} 
                        type="button" 
                        onClick={() => setSelectedService(s)} 
                        className={`w-full flex justify-between items-center p-4 rounded-2xl border transition-all duration-200 group ${isSelected ? 'border-slate-800 bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'border-slate-100 bg-white text-slate-600 hover:border-slate-300'}`}
                      >
                        <div className="flex items-center gap-3 text-left">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                            {isSelected ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                          </div>
                          <span className="text-sm font-bold">{s.name}</span>
                        </div>
                        <span className={`text-xs font-mono font-medium ${isSelected ? 'text-slate-200' : 'text-slate-400'}`}>
                          Rp {s.price.toLocaleString()}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    <CalendarDays size={10} /> Tanggal
                  </label>
                  <input 
                    type="date" 
                    required 
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-slate-100 shadow-sm" 
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    <Clock size={10} /> Jam
                  </label>
                  <div className="relative">
                    <select 
                      required 
                      onChange={(e) => setTime(e.target.value)} 
                      value={time}
                      className="w-full appearance-none bg-white border border-slate-200 rounded-2xl px-4 py-4 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-slate-100 shadow-sm"
                    >
                      <option value="">--:--</option>
                      {availableTimeSlots.map(slot => (
                        <option key={slot} value={slot} disabled={bookedSlots.includes(slot)}>
                          {slot} {bookedSlots.includes(slot) ? '(Penuh)' : ''}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                {/* LOGIKA TOMBOL SUBMIT */}
                <button 
                  type="submit" 
                  disabled={loading || !time || (isDpEnabled && !isSnapReady)} 
                  style={{ backgroundColor: (!time || loading || (isDpEnabled && !isSnapReady)) ? '#F1F5F9' : primaryColor }} 
                  className={`
                    w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all duration-300
                    flex items-center justify-center gap-3
                    ${(!time || loading || (isDpEnabled && !isSnapReady)) ? 'text-slate-300 cursor-not-allowed shadow-none' : 'text-white hover:shadow-2xl hover:-translate-y-1 active:scale-95'}
                  `}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {/* GANTI ICON DAN TEXT TERGANTUNG STATUS DP */}
                      {isDpEnabled ? <Wallet size={16} /> : <Send size={16} />}
                      <span>
                        {isDpEnabled 
                          ? `Bayar DP Rp ${siteSettings?.dp_amount.toLocaleString()}` 
                          : 'Booking Sekarang'
                        }
                      </span>
                    </>
                  )}
                </button>
                
                {/* Footer text berubah tergantung DP */}
                <p className="text-center mt-6 text-[10px] text-slate-400 font-medium">
                  {isDpEnabled 
                    ? "Pembayaran aman didukung oleh Midtrans" 
                    : "Konfirmasi pesanan via WhatsApp"
                  }
                </p>
              </div>

            </form>
          </div>
          
          <div className="text-center mt-12 mb-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Powered by Beefirst Visual</p>
          </div>
        </div>
      </div>
    </div>
  )
}