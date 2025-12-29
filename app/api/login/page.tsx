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
      if (data.session) window.location.replace('/admin')
    }
    checkSession()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      window.location.replace('/admin') 
    } catch (err: any) {
      setErrorMsg("AKSES DITOLAK: KREDENSIAL SALAH.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white font-sans">
      <style jsx global>{`
        input { color: #000 !important; -webkit-text-fill-color: #000 !important; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0px 1000px white inset !important; -webkit-text-fill-color: #000 !important; }
      `}</style>

      {/* SISI KIRI: BRANDING */}
      <div className="lg:w-5/12 bg-black flex flex-col justify-between p-12 text-white border-r-[12px] border-black">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white text-black"><Camera size={32} strokeWidth={3} /></div>
          <span className="text-2xl font-black tracking-widest uppercase">Beefirst</span>
        </div>
        <h1 className="text-7xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.85]">Visual<br/>Access.</h1>
        <div className="border-l-4 border-white pl-6 text-[10px] font-black uppercase tracking-widest">Internal System v3.0</div>
      </div>

      {/* SISI KANAN: FORM */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-12">
          <div className="space-y-4">
            <h2 className="text-5xl font-black text-black uppercase italic">Log In.</h2>
            <div className="h-2 w-20 bg-black"></div>
          </div>

          {errorMsg && <div className="p-5 bg-black text-white text-[10px] font-black uppercase border-l-[8px] border-red-600">{errorMsg}</div>}

          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-[0.4em] text-black">Email Admin</label>
              <div className="relative border-b-[4px] border-black">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-black" size={20} strokeWidth={3} />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full py-4 pl-10 text-xl font-black outline-none bg-white" placeholder="ADMIN@BEEFIRST.COM" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-[0.4em] text-black">Password</label>
              <div className="relative border-b-[4px] border-black">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-black" size={20} strokeWidth={3} />
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full py-4 pl-10 pr-12 text-xl font-black outline-none bg-white" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 text-black">{showPassword ? <EyeOff size={22} strokeWidth={3} /> : <Eye size={22} strokeWidth={3} />}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-black text-white p-7 font-black uppercase text-sm tracking-[0.5em] flex items-center justify-center gap-4 active:scale-95 transition-all">
              {loading ? 'VERIFYING...' : 'AUTHENTICATE'} <ArrowRight size={20} strokeWidth={3}/>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}