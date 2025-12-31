'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Wallet, CalendarDays, ImageIcon } from 'lucide-react'
import Script from 'next/script' // <-- TAMBAHKAN IMPORT INI

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
        // Set Nama Tab secara otomatis
        document.title = `${sData.business_name} | Booking Online`
      }
      
      const { data: svData } = await supabase.from('services').select('*').order('price', { ascending: true })
      if (svData) setServices(svData)
    }
    initData()

    // LOGIKA INTERVAL LAMA DIHAPUS AGAR TIDAK LEMOT
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

  if (!siteSettings) return <div className="h-screen flex items-center justify-center font-bold text-slate-400">Loading Photography Beefirst...</div>

  const primaryColor = siteSettings?.primary_color || '#000000'

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-5 font-sans">
      
      {/* SCRIPT MIDTRANS: Langsung aktif begitu dimuat. 
          Ganti ke 'app.midtrans.com' jika sudah Production. 
      */}
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        onLoad={() => setIsSnapReady(true)}
      />

      <div className="max-w-md mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white">
        
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
            <p className="text-[10px] font-black opacity-60 tracking-[0.3em] uppercase">Professional Booking System</p>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
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
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Layanan</label>
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
              className="w-full py-6 rounded-3xl font-black text-white shadow-2xl hover:opacity-90 transition-all active:scale-95 disabled:text-slate-300 uppercase tracking-[0.2em] text-xs"
            >
              {!isSnapReady ? 'Menghubungkan...' : loading ? 'Processing...' : `Bayar DP Rp ${siteSettings?.dp_amount.toLocaleString()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}