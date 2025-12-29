'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
// Coba gunakan @/ jika ../../ masih error
import { supabase } from '@/lib/supabase' 
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Cek jika user sudah login, langsung lempar ke admin
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) router.push('/admin')
    }
    checkSession()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })

      if (error) throw error

      if (data.session) {
        router.push('/admin')
        router.refresh()
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Email atau Password salah!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-2xl">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center mb-4 shadow-xl">
            <Lock size={30} />
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Beefirst Admin</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Secure Access Point</p>
        </div>

        {/* Notifikasi Error jika login gagal */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold flex items-center gap-3 rounded-r-xl">
            <AlertCircle size={16} />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-slate-100 p-4 rounded-2xl font-bold bg-slate-50 focus:border-slate-900 outline-none transition-all" 
              placeholder="admin@beefirst.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-slate-100 p-4 rounded-2xl font-bold bg-slate-50 focus:border-slate-900 outline-none transition-all" 
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:brightness-125 transition-all active:scale-95 disabled:bg-slate-300"
          >
            {loading ? 'Verifying...' : 'Login Sekarang'}
          </button>
        </form>
      </div>
    </div>
  )
}