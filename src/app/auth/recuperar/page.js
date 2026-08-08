'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'
import { validateEmail } from '@/lib/security'
import { useApp } from '@/lib/context'

export default function RecuperarContrasena() {
  const { t, idioma, tema } = useApp()
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRecuperar(e) {
    e.preventDefault()
    if (!validateEmail(email)) {
      setError(idioma === 'es' ? 'Ingresá un correo válido' : 'Enter a valid email')
      return
    }
    setLoading(true)
    setError('')
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/nueva-contrasena`,
    })
    if (authError) {
      setError(idioma === 'es' ? 'Error al enviar el correo. Intentá de nuevo.' : 'Error sending email. Try again.')
    } else {
      setEnviado(true)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-principal)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-2xl px-8 py-3 shadow-lg">
            <img src="/logo.png" alt="SchoolSwap" style={{ height: '88px', width: 'auto' }} />
          </div>
        </div>

        <div className="rounded-3xl shadow-xl p-8 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
          {enviado ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#f0fdf4' }}>
                <Mail size={32} style={{ color: '#166534' }} />
              </div>
              <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--azul)' }}>
                {idioma === 'es' ? '¡Correo enviado!' : 'Email sent!'}
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--texto-suave)' }}>
                {idioma === 'es'
                  ? `Revisá tu bandeja de entrada en ${email} y seguí las instrucciones para recuperar tu contraseña.`
                  : `Check your inbox at ${email} and follow the instructions to recover your password.`}
              </p>
              <Link href="/auth/login" className="flex items-center justify-center gap-2 text-sm font-bold"
                style={{ color: 'var(--azul-medio)' }}>
                <ArrowLeft size={16} /> {idioma === 'es' ? 'Volver al login' : 'Back to login'}
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--azul)' }}>
                {idioma === 'es' ? '¿Olvidaste tu contraseña?' : 'Forgot your password?'}
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--texto-suave)' }}>
                {idioma === 'es'
                  ? 'Ingresá tu correo y te enviamos un enlace para recuperarla.'
                  : 'Enter your email and we\'ll send you a recovery link.'}
              </p>

              {error && (
                <div className="p-3 rounded-xl mb-4 text-sm" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleRecuperar} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-principal)' }}>
                    {idioma === 'es' ? 'Correo electrónico' : 'Email address'}
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-suave)' }} />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border-2 outline-none"
                      style={{ borderColor: 'var(--borde-input)', color: 'var(--texto-principal)', backgroundColor: 'var(--bg-input)' }}
                      placeholder="tucorreo@ejemplo.com" maxLength={254} />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                  style={{ backgroundColor: loading ? '#6b7280' : 'var(--azul)', color: 'white', cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading
                    ? (idioma === 'es' ? 'Enviando...' : 'Sending...')
                    : (idioma === 'es' ? 'Enviar enlace de recuperación' : 'Send recovery link')}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/auth/login" className="flex items-center justify-center gap-2 text-sm font-semibold"
                  style={{ color: 'var(--texto-suave)' }}>
                  <ArrowLeft size={14} /> {idioma === 'es' ? 'Volver al login' : 'Back to login'}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}