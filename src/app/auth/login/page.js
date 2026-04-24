'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn } from 'lucide-react'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Correo o contraseña incorrectos'); setLoading(false) }
    else router.push('/')
  }

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f7ff' }}>
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border" style={{ borderColor: '#e2e6ff' }}>
        <div className="text-center mb-8">
          <img src="/logo.png" alt="SchoolSwap" className="h-16 w-auto mx-auto mb-4" />
          <p className="text-sm font-semibold" style={{ color: '#6b7280' }}>Cedes Don Bosco</p>
        </div>
        {error && (
          <div className="p-3 rounded-lg mb-4 text-sm border" style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#dc2626' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#1a1f6e' }}>Correo</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg p-3 text-sm border focus:outline-none"
              style={{ borderColor: '#e2e6ff', color: '#1a1f6e' }}
              placeholder="tucorreo@ejemplo.com" required />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#1a1f6e' }}>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg p-3 text-sm border focus:outline-none"
              style={{ borderColor: '#e2e6ff', color: '#1a1f6e' }}
              placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2"
            style={{ backgroundColor: '#1a1f6e', color: 'white' }}>
            <LogIn size={16} />
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <p className="text-center text-sm mt-6" style={{ color: '#6b7280' }}>
          ¿No tenés cuenta?{' '}
          <Link href="/auth/registro" className="font-bold" style={{ color: '#3b4fd8' }}>Registrate</Link>
        </p>
      </div>
    </main>
  )
}