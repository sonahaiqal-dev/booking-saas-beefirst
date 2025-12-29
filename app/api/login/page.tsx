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
      window.location.replace('/admin') // Gunakan replace agar tidak bisa back ke login
    } catch (err: any) {
      setErrorMsg("AKSES DITOLAK: DATA SALAH.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white font-sans">
      {/* CSS KHUSUS UNTUK MEMAKSA WARNA HITAM DI MOBILE */}
      <style jsx global>{`
        input {
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
          opacity: 1 !important;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: #000000 !important;
          -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      <div className="lg:w-5/12 bg-black flex flex-col justify-between p-10 md:p-20 text-white lg:border-r-[12px] border-black">
        <div>
           <div className="flex items-center gap-4 mb-8">
             <div className="p-2 bg-white text-black"><Camera size={28} strokeWidth={4} /></div>
             <span className="text-xl font-black tracking-widest uppercase">Beefirst</span>
           </div>
           <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic">Visual<br/>Access.</h1>
        </div>
        <div className="mt-10 border-l-4 border-white pl-6 text-[10px] font-black uppercase tracking-widest">Beefirst Visual Agency © 2025</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-black uppercase italic">Log In.</h2>
            <div className="h-2 w-16 bg-black"></div>
          </div>

          {errorMsg && <div className="p-4 bg-black text-white text-[10px] font-black uppercase border-l-8 border-red-600">{errorMsg}</div>}

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-black">Email Admin</label>
              <div className="relative border-b-4 border-black">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-black" size={20} strokeWidth={4} />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} 
                className="w-full py-4 pl-10 text-lg font-black bg-white outline-none uppercase" placeholder="ADMIN@BEEFIRST.COM" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-black">Security Password</label>
              <div className="relative border-b-4 border-black">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-black" size={20} strokeWidth={4} />
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} 
                className="w-full py-4 pl-10 pr-12 text-lg font-black bg-white outline-none" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 text-black">
                  {showPassword ? <EyeOff size={22} strokeWidth={4} /> : <Eye size={22} strokeWidth={4} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-black text-white p-6 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-4 active:scale-95 disabled:bg-black/40 transition-all">
              {loading ? 'WAIT...' : 'AUTHENTICATE'} <ArrowRight size={20} strokeWidth={4}/>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}