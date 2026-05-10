'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { validateEmail, checkRateLimit, safeErrorMessage } from '@/lib/security'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  function validate() {
    const errors = {}
    if (!email) errors.email = 'El correo es requerido'
    else if (!validateEmail(email)) errors.email = 'Correo inválido'
    if (!password) errors.password = 'La contraseña es requerida'
    else if (password.length < 6) errors.password = 'Contraseña muy corta'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!validate()) return
    const rateLimitKey = `login_${email.toLowerCase()}`
    if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
      setError('Demasiados intentos. Esperá 15 minutos.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (authError) { setError(safeErrorMessage(authError)); return }
      if (data?.user) { router.push('/'); router.refresh() }
    } catch {
      setError('Ocurrió un error inesperado. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-2xl px-8 py-3 shadow-lg">
            <img src="/logo.png" alt="SchoolSwap" style={{ height: '88px', width: 'auto' }} />
          </div>
          <p className="mt-3 text-sm font-medium" style={{ color: '#6b7280' }}>CEDES Don Bosco</p>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-8 border" style={{ borderColor: '#e2e8ff' }}>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#1a1f6e' }}>Bienvenido de vuelta</h1>
          <p className="text-sm mb-6" style={{ color: '#6b7280' }}>Iniciá sesión para continuar</p>
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
              style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              <span>⚠</span> {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>Correo electrónico</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
                <input type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })) }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border-2 outline-none"
                  style={{ borderColor: fieldErrors.email ? '#fca5a5' : '#e5e7eb', color: '#111827', backgroundColor: '#fafafa' }}
                  placeholder="tucorreo@ejemplo.com" autoComplete="email" maxLength={254} />
              </div>
              {fieldErrors.email && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })) }}
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm border-2 outline-none"
                  style={{ borderColor: fieldErrors.password ? '#fca5a5' : '#e5e7eb', color: '#111827', backgroundColor: '#fafafa' }}
                  placeholder="••••••••" autoComplete="current-password" maxLength={128} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.password}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all mt-2"
              style={{ backgroundColor: loading ? '#6b7280' : '#1a1f6e', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(26,31,110,0.3)' }}>
              <LogIn size={16} />
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: '#f3f4f6' }}>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              ¿No tienes una cuenta?{' '}
              <Link href="/auth/registro" className="font-bold" style={{ color: '#3b4fd8' }}>Registrate gratis</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}