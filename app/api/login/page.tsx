'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase' // Pastikan path ini benar sesuai struktur folder Anda
import { Lock, Mail, Eye, EyeOff, ArrowRight, Hexagon } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  // Cek sesi jika user iseng buka halaman login padahal sudah login
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
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      if (error) throw error
      // Login sukses, router/middleware akan menangani redirect
      router.refresh() 
    } catch (err: any) {
      setErrorMsg(err.message || "Kredensial tidak valid.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white font-sans selection:bg-slate-900 selection:text-white">
      
      {/* --- BAGIAN KIRI: BRANDING VISUAL (Hidden di Mobile kecil) --- */}
      <div className="lg:w-1/2 bg-slate-900 relative overflow-hidden hidden lg:flex flex-col justify-between p-20 text-white">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            {/* Ganti src ini dengan gambar portfolio agensi Anda jika ada */}
            <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop" alt="Agency Background" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50"></div>

        {/* Content Kiri */}
        <div className="relative z-10">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-3 bg-white rounded-2xl text-slate-900 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
               <Hexagon size={28} strokeWidth={2.5} />
             </div>
             <span className="text-xl font-black tracking-tighter uppercase">Beefirst Visual</span>
           </div>
        </div>
        
        <div className="relative z-10 mb-20">
          <h1 className="text-6xl font-black tracking-tighter leading-none mb-6"> Let's <br/>Create.</h1>
          <p className="text-lg text-slate-300 max-w-sm leading-relaxed font-medium">Selamat datang kembali di panel manajemen. Kelola proyek dan klien Anda dengan presisi.</p>
        </div>

        <div className="relative z-10 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <p>© 2025 Beefirst Visual</p>
          <p>Agency Internal System</p>
        </div>
      </div>

      {/* --- BAGIAN KANAN: FORM LOGIN --- */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-20 bg-slate-50 lg:bg-white">
        <div className="w-full max-w-md space-y-12 bg-white p-10 md:p-0 rounded-[3rem] md:rounded-none shadow-2xl md:shadow-none">
          
          {/* Header Form (Muncul di Mobile juga) */}
          <div className="text-center lg:text-left">
             <div className="lg:hidden flex justify-center mb-6">
                <div className="p-4 bg-slate-900 rounded-3xl text-white shadow-xl">
                   <Hexagon size={32} strokeWidth={2.5} />
                </div>
             </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-3">Welcome Back!</h2>
            <p className="text-slate-400 font-bold text-sm">Silakan masuk untuk mengakses dashboard.</p>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border-l-4 border-red-500 animate-pulse">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-8">
            
            {/* Input Email dengan Ikon */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-900 ml-3">Email Admin</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                  <Mail size={20} />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-100 border-2 border-slate-100 p-5 pl-14 rounded-3xl font-bold text-slate-900 outline-none focus:bg-white focus:border-slate-900 focus:shadow-xl transition-all placeholder:text-slate-400"
                  placeholder="nama@beefirst.com"
                />
              </div>
            </div>

            {/* Input Password dengan Ikon & Toggle View */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-900 ml-3">Password</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-100 border-2 border-slate-100 p-5 pl-14 pr-14 rounded-3xl font-bold text-slate-900 outline-none focus:bg-white focus:border-slate-900 focus:shadow-xl transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Tombol Login */}
            <button 
              type="submit" 
              disabled={loading}
              className="group w-full bg-slate-900 text-white p-5 rounded-3xl font-black uppercase text-sm tracking-[0.3em] shadow-2xl hover:shadow-slate-900/30 hover:scale-[1.02] active:scale-95 transition-all disabled:bg-slate-400 disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-4"
            >
              {loading ? 'Memverifikasi...' : <>Masuk Dashboard <ArrowRight className="group-hover:translate-x-2 transition-transform" size={20}/></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}