'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Wallet, CalendarDays, ImageIcon, 
  Scissors, Utensils, BedDouble, GraduationCap, 
  ArrowRight, ExternalLink 
} from 'lucide-react' // <-- UPDATE IMPORT INI (Tambah icon baru)
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
    if (!isSnapReady) return alert("Sistem pembayaran sedang menyiapkan koneksi.")
    
    if (!name || !whatsapp || !date || !time || !selectedService) {
      return alert("Mohon lengkapi semua data!")
    }

    setLoading(true)
    try {
      const { data: booking, error: dbError } = await supabase
        .from('bookings')
        .insert([{ 
          customer_name: name, 
          customer_wa: whatsapp,
          service_name: selectedService.name,
          booking_date: date, 
          booking_time: time,
          payment_status: 'pending'
        }])
        .select().single()

      if (dbError) throw dbError

      const response = await fetch('/api/tokenizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: booking.id, name: name, price: siteSettings?.dp_amount || 0 })
      })
      
      const resData = await response.json()

      window.snap.pay(resData.token, {
        onSuccess: () => {
          alert("Pembayaran Berhasil!")
          const msg = `Halo, saya ${name} sudah bayar DP untuk ${selectedService.name} tanggal ${date} jam ${time}.`
          window.open(`https://wa.me/${siteSettings?.whatsapp_admin}?text=${encodeURIComponent(msg)}`, '_blank')
          window.location.reload()
        },
        onPending: () => alert("Menunggu pembayaran..."),
        onError: () => alert("Pembayaran gagal!"),
        onClose: () => alert("Jendela pembayaran ditutup.")
      })
    } catch (err: any) {
      alert("Kesalahan: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Loading state yang lebih cantik dikit
  if (!siteSettings) return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4 bg-slate-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800"></div>
      <div className="font-bold text-slate-400 animate-pulse">Memuat Beefirst Visual...</div>
    </div>
  )

  const primaryColor = siteSettings?.primary_color || '#000000'

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        onLoad={() => setIsSnapReady(true)}
      />

      {/* --- SECTION INTRO & SHOWCASE (BARU) --- */}
      <div className="bg-white pb-16 pt-10 px-5 rounded-b-[3rem] shadow-sm mb-10 border-b border-slate-100">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          
          {/* Headline Copywriting */}
          <div className="space-y-2">
            <span className="inline-block px-4 py-1.5 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-black tracking-widest uppercase mb-2">
              🚀 Upgrade Bisnismu Sekarang
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Punya Bisnis Tapi Belum Punya <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">Landing Page?</span>
            </h2>
            <p className="text-slate-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed font-medium">
              Jangan biarkan pelanggan kabur karena sistemmu ribet. <span className="text-slate-900 font-bold">Beefirst Visual</span> siap menyulap bisnismu jadi lebih profesional, otomatis, dan berkelas.
            </p>
          </div>

          {/* Grid Tombol Contoh (Demo) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
            {/* 1. Salon */}
            <a 
              href="#" /* ISI LINK LANDING PAGE SALON DISINI */
              target="_blank"
              className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-pink-50 hover:border-pink-200 border border-slate-100 transition-all hover:-translate-y-1"
            >
              <div className="bg-white p-3 rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <Scissors size={20} className="text-pink-500" />
              </div>
              <span className="text-xs font-black text-slate-600 uppercase tracking-wide group-hover:text-pink-600">Salon & Spa</span>
            </a>

            {/* 2. Resto */}
            <a 
              href="#" /* ISI LINK LANDING PAGE RESTO DISINI */
              target="_blank"
              className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-orange-50 hover:border-orange-200 border border-slate-100 transition-all hover:-translate-y-1"
            >
              <div className="bg-white p-3 rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <Utensils size={20} className="text-orange-500" />
              </div>
              <span className="text-xs font-black text-slate-600 uppercase tracking-wide group-hover:text-orange-600">Resto & Cafe</span>
            </a>

            {/* 3. Guest House */}
            <a 
              href="#" /* ISI LINK GUEST HOUSE DISINI */
              target="_blank"
              className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-100 transition-all hover:-translate-y-1"
            >
              <div className="bg-white p-3 rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <BedDouble size={20} className="text-blue-500" />
              </div>
              <span className="text-xs font-black text-slate-600 uppercase tracking-wide group-hover:text-blue-600">Guest House</span>
            </a>

            {/* 4. Bimbel */}
            <a 
              href="#" /* ISI LINK BIMBEL DISINI */
              target="_blank"
              className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 transition-all hover:-translate-y-1"
            >
              <div className="bg-white p-3 rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <GraduationCap size={20} className="text-emerald-500" />
              </div>
              <span className="text-xs font-black text-slate-600 uppercase tracking-wide group-hover:text-emerald-600">Bimbel / Kursus</span>
            </a>
          </div>

          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <span>Scroll ke bawah untuk coba sistem booking</span>
            <ArrowRight size={12} className="animate-bounce mt-1" />
          </div>
        </div>
      </div>


      {/* --- FORM BOOKING ORIGINAL --- */}
      <div className="max-w-md mx-auto px-5 pb-20"> {/* Tambah padding bottom */}
        <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-white relative z-10">
          
          <div style={{ backgroundColor: primaryColor }} className="p-12 text-white text-center relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-white p-4 rounded-[2rem] shadow-2xl mb-6 flex items-center justify-center min-w-[90px] min-h-[90px]">
                  {siteSettings?.logo_url ? (
                    <img 
                      src={siteSettings.logo_url} 
                      alt="Logo Beefirst" 
                      className="w-[60px] h-[60px] object-contain"
                    />
                  ) : (
                    <ImageIcon className="text-slate-200" size={40} />
                  )}
              </div>

              <h1 className="text-2xl font-black tracking-tighter mb-2 uppercase italic">{siteSettings?.business_name}</h1>
              <p className="text-[10px] font-black opacity-60 tracking-[0.3em] uppercase">Your Visual Storyteller</p>
            </div>
            {/* Hiasan background abstrak */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute top-20 -left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          </div>

          <form onSubmit={handleBooking} className="p-10 space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
              <input required className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-3xl text-slate-900 focus:bg-white focus:border-slate-200 outline-none transition-all font-bold" placeholder="Nama Anda" onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor WhatsApp</label>
              <input required type="tel" className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-3xl text-slate-900 focus:bg-white focus:border-slate-200 outline-none transition-all font-bold" placeholder="08..." onChange={(e) => setWhatsapp(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Layanan (DP Reservasi Jasa)</label>
              <div className="grid grid-cols-1 gap-3">
                {services.map(s => (
                  <button 
                    key={s.id} 
                    type="button" 
                    onClick={() => setSelectedService(s)} 
                    className={`flex justify-between items-center p-5 rounded-3xl border-2 transition-all shadow-sm ${selectedService?.id === s.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-50 bg-slate-50 text-slate-600'}`}
                  >
                    <span className="text-sm font-black uppercase italic">{s.name}</span>
                    <span className="text-[10px] font-mono font-black opacity-60 italic">Rp {s.price.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal</label>
                <input type="date" required className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-3xl text-slate-900 outline-none font-bold text-xs" onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jam</label>
                <select required className="w-full bg-slate-50 border-2 border-slate-200 p-5 rounded-3xl text-slate-900 outline-none font-bold text-xs" onChange={(e) => setTime(e.target.value)} value={time}>
                  <option value="">Pilih</option>
                  {availableTimeSlots.map(slot => (
                    <option key={slot} value={slot} disabled={bookedSlots.includes(slot)}>
                      {slot} {bookedSlots.includes(slot) ? '(Penuh)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={loading || !time || !isSnapReady} 
                style={{ backgroundColor: (!time || loading || !isSnapReady) ? '#f1f5f9' : primaryColor }} 
                className="w-full py-6 rounded-3xl font-black text-white shadow-2xl hover:opacity-90 transition-all active:scale-95 disabled:text-slate-300 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2"
              >
                 {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Wallet size={16} />}
                {!isSnapReady ? 'Menghubungkan...' : loading ? 'Processing...' : `Bayar DP Rp ${siteSettings?.dp_amount.toLocaleString()}`}
              </button>
            </div>
          </form>
        </div>
        
        {/* Footer Kecil */}
        <div className="text-center mt-10 opacity-40 hover:opacity-100 transition-opacity">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Powered by Beefirst Visual</p>
        </div>
      </div>
    </div>
  )
}