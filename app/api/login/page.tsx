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
      setErrorMsg("AKSES DITOLAK: Kredensial Salah.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white font-sans selection:bg-black selection:text-white">
      
      {/* --- SISI KIRI: VISUAL KONTRAS TINGGI --- */}
      <div className="lg:w-5/12 bg-black relative flex flex-col justify-between p-12 md:p-20 text-white border-r-[12px] border-black">
        <div className="relative z-10">
           <div className="flex items-center gap-4 mb-12">
             <div className="p-3 bg-white text-black rounded-none shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)]">
               <Camera size={32} strokeWidth={3} />
             </div>
             <span className="text-2xl font-black tracking-[0.2em] uppercase">Beefirst</span>
           </div>
           
           <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase italic italic">
            Visual<br/>Access.
           </h1>
        </div>
        
        <div className="relative z-10 border-l-4 border-white pl-6">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-white">Internal Management System v3.0</p>
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-2">Restricted Area - Beefirst Visual Agency</p>
        </div>

        {/* Background Pattern Minimalis */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        </div>
      </div>

      {/* --- SISI KANAN: FORM LOGIN TAJAM --- */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-12">
          
          <div className="space-y-4">
            <h2 className="text-5xl font-black text-black tracking-tighter uppercase leading-none">Log In.</h2>
            <div className="h-2 w-20 bg-black"></div>
            <p className="text-black font-black text-xs uppercase tracking-widest">Masukkan identitas admin Anda untuk melanjutkan.</p>
          </div>

          {errorMsg && (
            <div className="p-5 bg-black text-white text-xs font-black uppercase tracking-widest border-l-[8px] border-red-600 shadow-2xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-10">
            
            {/* Input Email */}
            <div className="group space-y-3">
              <label className="text-[11px] font-black uppercase tracking-[0.4em] text-black">Email Admin</label>
              <div className="relative">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-black" size={20} strokeWidth={3} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-b-[4px] border-black py-4 pl-10 text-xl font-black text-black outline-none placeholder:text-slate-200 focus:placeholder:opacity-0 transition-all uppercase"
                  placeholder="admin@beefirst.com"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="group space-y-3">
              <label className="text-[11px] font-black uppercase tracking-[0.4em] text-black">Security Password</label>
              <div className="relative">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-black" size={20} strokeWidth={3} />
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-b-[4px] border-black py-4 pl-10 pr-12 text-xl font-black text-black outline-none placeholder:text-slate-200 focus:placeholder:opacity-0 transition-all"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-black hover:scale-125 transition-transform"
                >
                  {showPassword ? <EyeOff size={22} strokeWidth={3} /> : <Eye size={22} strokeWidth={3} />}
                </button>
              </div>
            </div>

            {/* Tombol Login Kontras Tinggi */}
            <button 
              type="submit" 
              disabled={loading}
              className="group relative w-full bg-black text-white p-7 font-black uppercase text-sm tracking-[0.5em] flex items-center justify-center gap-4 hover:bg-slate-800 transition-all active:scale-95 disabled:bg-slate-300"
            >
              {loading ? 'Verifying...' : 'Authenticate'}
              <ArrowRight className="group-hover:translate-x-4 transition-transform" size={20} strokeWidth={3}/>
            </button>
          </form>

          <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] pt-10">
            Secure Terminal — Beefirst Visual Agency
          </p>
        </div>
      </div>
    </div>
  )
}