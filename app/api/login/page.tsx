'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Proses autentikasi ke Supabase
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      alert("Login Gagal: " + error.message)
    } else {
      // Jika berhasil, arahkan ke dashboard admin
      router.push('/admin')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center mb-6 shadow-xl">
            <Lock size={30} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">Admin Access</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 text-center">Beefirst Visual Management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-500">Email Admin</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-slate-100 p-5 rounded-2xl font-bold bg-slate-50 focus:border-slate-900 focus:bg-white outline-none transition-all" 
              placeholder="email@beefirst.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-500">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-slate-100 p-5 rounded-2xl font-bold bg-slate-50 focus:border-slate-900 focus:bg-white outline-none transition-all" 
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.4em] shadow-2xl hover:brightness-125 transition-all active:scale-95 disabled:bg-slate-300"
          >
            {loading ? 'Authenticating...' : 'Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}