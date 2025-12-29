'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Image from 'next/image' // <-- 1. IMPORT KOMPONEN IMAGE

declare global {
  interface Window {
    snap: any;
  }
}

export default function BookingPage() {
  const [siteSettings, setSiteSettings] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
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
      if (sData) setSiteSettings(sData)
      const { data: svData } = await supabase.from('services').select('*').order('price', { ascending: true })
      if (svData) setServices(svData)
    }
    initData()

    const checkSnap = setInterval(() => {
      if (typeof window !== 'undefined' && window.snap) {
        setIsSnapReady(true)
        clearInterval(checkSnap)
      }
    }, 1000)
    return () => clearInterval(checkSnap)
  }, [])

  useEffect(() => {
    const fetchBooked = async () => {
      if (!date) return
      const { data } = await supabase.from('bookings').select('booking_time').eq('booking_date', date)
      if (data) setBookedSlots(data.map(b => b.booking_time.slice(0, 5)))
    }
    fetchBooked()
    setTime('') 
  }, [date])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSnapReady) return alert("Sistem pembayaran sedang menyiapkan koneksi. Tunggu sebentar.")
    
    if (!name || !whatsapp || !date || !time || !selectedService) {
      return alert("Mohon lengkapi semua data termasuk nomor WhatsApp!")
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
          const msg = `Halo, saya ${name} (WA: ${whatsapp}) sudah bayar DP untuk ${selectedService.name} tanggal ${date} jam ${time}.`
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

  if (!siteSettings) return <div className="h-screen flex items-center justify-center font-bold text-slate-400">Loading...</div>

  const primaryColor = siteSettings?.primary_color || '#4f46e5'

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-5">
      <div className="max-w-md mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white">
        
        {/* --- BAGIAN HEADER DENGAN LOGO --- */}
        <div style={{ backgroundColor: primaryColor }} className="p-10 text-white text-center relative overflow-hidden">
          {/* Flex container untuk menengahkan logo dan teks */}
          <div className="relative z-10 flex flex-col items-center">
            
            {/* Container Logo Putih agar terlihat kontras */}
            <div className="bg-white p-3 rounded-2xl shadow-lg mb-4">
                {/* Pastikan file logo.png ada di folder 'public' */}
                <Image 
                  src="/logo.png" 
                  alt="Logo Bisnis" 
                  width={60} 
                  height={60} 
                  className="object-contain"
                />
            </div>

            <h1 className="text-2xl font-black tracking-tight mb-2 uppercase">{siteSettings?.business_name}</h1>
            <p className="text-xs font-bold opacity-80 tracking-widest uppercase">Pemesanan Online</p>
          </div>
          {/* Hiasan background */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
        </div>
        {/* --- END HEADER --- */}

        <form onSubmit={handleBooking} className="p-8 space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
            <input required className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-800 focus:bg-white focus:border-slate-200 outline-none transition-all font-bold" placeholder="Nama Anda" onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor WhatsApp</label>
            <input required type="tel" className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-800 focus:bg-white focus:border-slate-200 outline-none transition-all font-bold" placeholder="Contoh: 08954024..." onChange={(e) => setWhatsapp(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Layanan</label>
            <div className="grid grid-cols-1 gap-2">
              {services.map(s => (
                <button key={s.id} type="button" onClick={() => setSelectedService(s)} className={`flex justify-between items-center p-4 rounded-2xl border-2 transition-all ${selectedService?.id === s.id ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-50 bg-slate-50 text-slate-600'}`}>
                  <span className="text-sm font-bold">{s.name}</span>
                  <span className="text-[10px] font-black opacity-60">Rp {s.price.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal</label>
              <input type="date" required className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-800 outline-none font-bold text-xs" onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jam</label>
              <select required className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-slate-800 outline-none font-bold text-xs" onChange={(e) => setTime(e.target.value)} value={time}>
                <option value="">Pilih Jam</option>
                {availableTimeSlots.map(slot => (
                  <option key={slot} value={slot} disabled={bookedSlots.includes(slot)}>
                    {slot} {bookedSlots.includes(slot) ? '(Penuh)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={loading || !time || !isSnapReady} style={{ backgroundColor: (!time || loading || !isSnapReady) ? '#e2e8f0' : primaryColor }} className="w-full py-5 rounded-[1.5rem] font-black text-white shadow-xl hover:opacity-90 transition-all active:scale-95 disabled:text-slate-400 uppercase tracking-widest text-sm">
              {!isSnapReady ? 'Menyiapkan Bank...' : loading ? 'Memproses...' : `Bayar DP Rp ${siteSettings?.dp_amount.toLocaleString()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}