'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react'
import { validatePassword } from '@/lib/security'
import { useApp } from '@/lib/context'

export default function NuevaContrasena() {
  const router = useRouter()
  const { idioma } = useApp()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [linkInvalid, setLinkInvalid] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function verificarSesion() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLinkInvalid(true)
        setError(idioma === 'es' ? 'El enlace de recuperación no es válido o ya venció.' : 'The recovery link is invalid or has expired.')
      }
      setCheckingSession(false)
    }
    verificarSesion()
  }, [idioma])

  async function handleSubmit(e) {
    e.preventDefault()
    const passwordErrors = validatePassword(password)
    if (passwordErrors.length > 0) {
      setError(idioma === 'es' ? `Contraseña inválida: ${passwordErrors.join(', ')}.` : `Invalid password: ${passwordErrors.join(', ')}.`)
      return
    }
    if (password !== confirmPassword) {
      setError(idioma === 'es' ? 'Las contraseñas no coinciden.' : 'Passwords do not match.')
      return
    }

    setLoading(true)
    setError('')
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(idioma === 'es' ? 'No se pudo actualizar la contraseña. Solicitá un enlace nuevo.' : 'Unable to update the password. Request a new link.')
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.replace('/auth/login'), 1800)
  }

  const inputStyle = { borderColor: 'var(--borde-input)', color: 'var(--texto-principal)', backgroundColor: 'var(--bg-input)' }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: 'var(--bg-principal)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-2xl px-8 py-3 shadow-lg">
            <img src="/logo.png" alt="SchoolSwap" style={{ height: '88px', width: 'auto' }} />
          </div>
        </div>
        <div className="rounded-3xl shadow-xl p-8 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#f0fdf4' }}>
                <CheckCircle size={32} style={{ color: '#166534' }} />
              </div>
              <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--azul)' }}>{idioma === 'es' ? '¡Contraseña actualizada!' : 'Password updated!'}</h1>
              <p className="text-sm" style={{ color: 'var(--texto-suave)' }}>{idioma === 'es' ? 'Te redirigiremos para que iniciés sesión.' : 'We will redirect you to sign in.'}</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--azul)' }}>{idioma === 'es' ? 'Crear nueva contraseña' : 'Create new password'}</h1>
              <p className="text-sm mb-6" style={{ color: 'var(--texto-suave)' }}>{idioma === 'es' ? 'Elegí una contraseña segura para tu cuenta.' : 'Choose a secure password for your account.'}</p>
              {error && <div className="p-3 rounded-xl mb-4 text-sm" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>{error}</div>}
              {checkingSession ? (
                <p className="text-sm text-center py-8" style={{ color: 'var(--texto-suave)' }}>{idioma === 'es' ? 'Verificando enlace...' : 'Checking link...'}</p>
              ) : !linkInvalid ? (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {[{ key: 'password', label: idioma === 'es' ? 'Nueva contraseña' : 'New password', value: password, setValue: setPassword, show: showPassword, setShow: setShowPassword }, { key: 'confirm', label: idioma === 'es' ? 'Confirmar contraseña' : 'Confirm password', value: confirmPassword, setValue: setConfirmPassword, show: showConfirmPassword, setShow: setShowConfirmPassword }].map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-principal)' }}>{field.label}</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-suave)' }} />
                        <input type={field.show ? 'text' : 'password'} value={field.value} onChange={(e) => { field.setValue(e.target.value); setError('') }} className="w-full pl-10 pr-11 py-3 rounded-xl text-sm border-2 outline-none" style={inputStyle} placeholder="••••••••" maxLength={128} autoComplete={field.key === 'password' ? 'new-password' : 'new-password'} />
                        <button type="button" onClick={() => field.setShow(!field.show)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-suave)' }} aria-label={field.show ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{field.show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs" style={{ color: 'var(--texto-suave)' }}>{idioma === 'es' ? 'Mínimo 8 caracteres, una mayúscula y un número.' : 'At least 8 characters, one uppercase letter and one number.'}</p>
                  <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-bold text-sm transition-all" style={{ backgroundColor: loading ? '#6b7280' : 'var(--azul)', color: 'white', cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? (idioma === 'es' ? 'Actualizando...' : 'Updating...') : (idioma === 'es' ? 'Actualizar contraseña' : 'Update password')}</button>
                </form>
              ) : (
                <Link href="/auth/recuperar" className="flex items-center justify-center gap-2 text-sm font-bold" style={{ color: 'var(--azul-medio)' }}><ArrowLeft size={16} /> {idioma === 'es' ? 'Solicitar otro enlace' : 'Request another link'}</Link>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
