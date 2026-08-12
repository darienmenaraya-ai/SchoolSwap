'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Eye, EyeOff, Mail, Lock, Sun, Moon, Globe } from 'lucide-react'
import { validateEmail, checkRateLimit, safeErrorMessage } from '@/lib/security'
import { useApp } from '@/lib/context'

export default function Login() {
  const router = useRouter()
  const { t, cambiarIdioma, cambiarTema, idioma, tema } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  function validarCampo(nombre, valor) {
    if (nombre === 'email') return !validateEmail(valor) ? (idioma === 'es' ? 'Correo inválido' : 'Invalid email') : ''
    if (nombre === 'password') return !valor ? (idioma === 'es' ? 'La contraseña es requerida' : 'Password is required') : valor.length < 6 ? (idioma === 'es' ? 'Contraseña muy corta' : 'Password too short') : ''
    return ''
  }

  function validate() {
    const errors = {}
    if (!email) errors.email = idioma === 'es' ? 'El correo es requerido' : 'Email is required'
    else if (!validateEmail(email)) errors.email = idioma === 'es' ? 'Correo inválido' : 'Invalid email'
    if (!password) errors.password = idioma === 'es' ? 'La contraseña es requerida' : 'Password is required'
    else if (password.length < 6) errors.password = idioma === 'es' ? 'Contraseña muy corta' : 'Password too short'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!validate()) return
    const rateLimitKey = `login_${email.toLowerCase()}`
    if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
      setError(idioma === 'es' ? 'Demasiados intentos. Esperá 15 minutos.' : 'Too many attempts. Wait 15 minutes.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password,
      })
      if (authError) { setError(safeErrorMessage(authError)); return }
      if (data?.user) { router.push('/'); router.refresh() }
    } catch {
      setError(idioma === 'es' ? 'Ocurrió un error inesperado.' : 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const estiloInput = (field) => ({
    borderColor: fieldErrors[field] ? '#fca5a5' : 'var(--borde-input)',
    color: 'var(--texto-principal)',
    backgroundColor: 'var(--bg-input)',
  })

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-principal)' }}>
      <div className="w-full max-w-md">

        {/* Controles idioma y tema */}
        <div className="flex justify-end gap-2 mb-4">
          <button onClick={cambiarIdioma} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)', color: 'var(--texto-principal)' }}>
            <Globe size={13} /> {idioma === 'es' ? 'EN' : 'ES'}
          </button>
          <button onClick={cambiarTema} className="p-1.5 rounded-lg border"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)', color: 'var(--texto-principal)' }}>
            {tema === 'claro' ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-2xl px-8 py-3 shadow-lg">
            <img src="/logo.png" alt="SchoolSwap" style={{ height: '88px', width: 'auto' }} />
          </div>
          <p className="mt-3 text-sm font-medium" style={{ color: 'var(--texto-suave)' }}>{t('auth', 'institution')}</p>
        </div>

        <div className="rounded-3xl shadow-xl p-8 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--azul)' }}>{t('auth', 'welcome')}</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--texto-suave)' }}>{t('auth', 'loginDesc')}</p>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
              style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-principal)' }}>{t('auth', 'emailLabel')}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-suave)' }} />
                <input type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: validarCampo('email', e.target.value) })) }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border-2 outline-none"
                  style={estiloInput('email')}
                  placeholder="tucorreo@ejemplo.com" autoComplete="email" maxLength={254} />
              </div>
              {fieldErrors.email && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-principal)' }}>{t('auth', 'passwordLabel')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-suave)' }} />
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: validarCampo('password', e.target.value) })) }}
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm border-2 outline-none"
                  style={estiloInput('password')}
                  placeholder="••••••••" autoComplete="current-password" maxLength={128} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-suave)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.password}</p>}
            </div>

            <div className="text-right">
              <Link href="/auth/recuperar" className="text-xs font-semibold" style={{ color: 'var(--azul-medio)' }}>
                {t('auth', 'forgotPassword')}
              </Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              style={{ backgroundColor: loading ? '#6b7280' : 'var(--azul)', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(26,31,110,0.3)' }}>
              <LogIn size={16} />
              {loading ? t('auth', 'loggingIn') : t('auth', 'loginBtn')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: 'var(--borde)' }}>
            <p className="text-sm" style={{ color: 'var(--texto-suave)' }}>
              {t('auth', 'noAccount')}{' '}
              <Link href="/auth/registro" className="font-bold" style={{ color: 'var(--azul-medio)' }}>
                {t('auth', 'registerFree')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
