'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase' 
import { Lock, Mail, Eye, EyeOff, ArrowRight, Camera } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) router.replace('/admin')
    }
    checkSession()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.refresh() 
    } catch (err: any) {
      setErrorMsg("AKSES DITOLAK: DATA SALAH.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white font-sans selection:bg-black selection:text-white">
      
      {/* --- SISI KIRI / HEADER MOBILE (HITAM TOTAL) --- */}
      <div className="lg:w-5/12 bg-black relative flex flex-col justify-between p-10 md:p-20 text-white lg:border-r-[12px] border-black">
        <div className="relative z-10">
           <div className="flex items-center gap-4 mb-8 lg:mb-12">
             <div className="p-2 bg-white text-black rounded-none shadow-[6px_6px_0px_0px_rgba(255,255,255,0.4)]">
               <Camera size={28} strokeWidth={4} />
             </div>
             <span className="text-xl font-black tracking-[0.2em] uppercase text-white">Beefirst</span>
           </div>
           
           <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase italic text-white">
            Visual<br/>Access.
           </h1>
        </div>
        
        <div className="relative z-10 border-l-4 border-white pl-6 mt-10 lg:mt-0">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Management System v3.0</p>
          {/* Warna abu-abu diganti ke putih dengan opacity agar tetap kontras tapi tidak dominan */}
          <p className="text-[9px] font-black text-white uppercase tracking-widest mt-2">Restricted Area - Beefirst Visual Agency</p>
        </div>
      </div>

      {/* --- SISI KANAN / FORM MOBILE (PUTIH TOTAL) --- */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-10 lg:space-y-12">
          
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-black tracking-tighter uppercase leading-none">Log In.</h2>
            <div className="h-2 w-16 bg-black"></div>
            {/* Teks deskripsi sekarang Hitam Pekat */}
            <p className="text-black font-black text-[10px] uppercase tracking-[0.2em]">Masukkan identitas admin Anda.</p>
          </div>

          {errorMsg && (
            <div className="p-5 bg-black text-white text-[10px] font-black uppercase tracking-widest border-l-[8px] border-red-600 shadow-2xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-8 lg:space-y-10">
            
            {/* Input Email */}
            <div className="group space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Email Admin</label>
              <div className="relative">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-black" size={20} strokeWidth={4} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  // Teks input dan border sekarang Hitam Pekat
                  className="w-full border-b-[4px] border-black py-4 pl-10 text-lg font-black text-black outline-none placeholder:text-black/20 transition-all uppercase"
                  placeholder="EMAIL@BEEFIRST.COM"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="group space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Security Password</label>
              <div className="relative">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-black" size={20} strokeWidth={4} />
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-b-[4px] border-black py-4 pl-10 pr-12 text-lg font-black text-black outline-none placeholder:text-black/20 transition-all"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-black"
                >
                  {showPassword ? <EyeOff size={22} strokeWidth={4} /> : <Eye size={22} strokeWidth={4} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="group relative w-full bg-black text-white p-6 font-black uppercase text-xs tracking-[0.4em] flex items-center justify-center gap-4 transition-all active:scale-95 disabled:bg-black/30"
            >
              {loading ? 'MEMVERIFIKASI...' : 'AUTHENTICATE'}
              <ArrowRight className="group-hover:translate-x-4 transition-transform" size={20} strokeWidth={4}/>
            </button>
          </form>

          {/* Teks Footer sekarang Hitam Pekat */}
          <p className="text-center text-[8px] font-black text-black uppercase tracking-[0.4em] pt-10 opacity-40">
            Secure Terminal — Beefirst Visual Agency
          </p>
        </div>
      </div>
    </div>
  )
}