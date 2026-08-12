'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Eye, EyeOff, Mail, Lock, User, Sun, Moon, Globe } from 'lucide-react'
import { validateEmail, validatePassword, validateName, checkRateLimit, safeErrorMessage, sanitizeText } from '@/lib/security'
import { useApp } from '@/lib/context'

export default function Registro() {
  const router = useRouter()
  const { t, cambiarIdioma, cambiarTema, idioma, tema } = useApp()
  const [form, setForm] = useState({ nombre: '', apellido: '', correo: '', contrasena: '', confirmarContrasena: '', rol: 'estudiante' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function validarCampo(nombre, valor, datos = form) {
    const esEs = idioma === 'es'
    if (nombre === 'nombre') return !validateName(valor) ? (esEs ? 'Nombre inválido (solo letras, 2-50 caracteres)' : 'Invalid name (letters only, 2-50 chars)') : ''
    if (nombre === 'apellido') return !validateName(valor) ? (esEs ? 'Apellido inválido' : 'Invalid last name') : ''
    if (nombre === 'correo') return !validateEmail(valor) ? (esEs ? 'Correo inválido' : 'Invalid email') : ''
    if (nombre === 'contrasena') {
      const errores = validatePassword(valor)
      return errores.length ? errores.join(', ') : ''
    }
    if (nombre === 'confirmarContrasena') return valor !== datos.contrasena ? (esEs ? 'Las contraseñas no coinciden' : 'Passwords do not match') : ''
    return ''
  }

  function handleChange(e) {
    const siguiente = { ...form, [e.target.name]: e.target.value }
    setForm(siguiente)
    setFieldErrors(p => ({ ...p, [e.target.name]: validarCampo(e.target.name, e.target.value, siguiente), ...(e.target.name === 'contrasena' ? { confirmarContrasena: validarCampo('confirmarContrasena', siguiente.confirmarContrasena, siguiente) } : {}) }))
  }

  function validate() {
    const errors = {}
    const esEs = idioma === 'es'
    if (!form.nombre || !validateName(form.nombre)) errors.nombre = esEs ? 'Nombre inválido (solo letras, 2-50 caracteres)' : 'Invalid name (letters only, 2-50 chars)'
    if (!form.apellido || !validateName(form.apellido)) errors.apellido = esEs ? 'Apellido inválido' : 'Invalid last name'
    if (!form.correo || !validateEmail(form.correo)) errors.correo = esEs ? 'Correo inválido' : 'Invalid email'
    const pwErrors = validatePassword(form.contrasena)
    if (pwErrors.length > 0) errors.contrasena = pwErrors.join(', ')
    if (form.contrasena !== form.confirmarContrasena) errors.confirmarContrasena = esEs ? 'Las contraseñas no coinciden' : 'Passwords do not match'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleRegistro(e) {
    e.preventDefault()
    if (!validate()) return
    const rateLimitKey = `register_${form.correo.toLowerCase()}`
    if (!checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)) {
      setError(idioma === 'es' ? 'Demasiados intentos. Esperá 1 hora.' : 'Too many attempts. Wait 1 hour.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const cleanEmail = form.correo.trim().toLowerCase()
      const { data, error: authError } = await supabase.auth.signUp({
        email: cleanEmail, password: form.contrasena,
        options: { emailRedirectTo: `${window.location.origin}/` },
      })
      if (authError) { setError(safeErrorMessage(authError)); return }
      if (data?.user) {
        const { error: dbError } = await supabase.from('usuario').insert({
          id_usuario: data.user.id,
          nombre: sanitizeText(form.nombre),
          apellido: sanitizeText(form.apellido),
          correo: cleanEmail,
          contrasena: '***',
          rol: form.rol,
        })
        if (dbError) { setError(idioma === 'es' ? 'Error al crear el perfil.' : 'Error creating profile.'); return }
        router.push('/')
        router.refresh()
      }
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
    <main className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: 'var(--bg-principal)' }}>
      <div className="w-full max-w-md">

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
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--azul)' }}>{t('auth', 'createAccount')}</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--texto-suave)' }}>{t('auth', 'registerDesc')}</p>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
              style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleRegistro} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-principal)' }}>{t('auth', 'nameLabel')}</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-suave)' }} />
                  <input type="text" name="nombre" value={form.nombre} onChange={handleChange}
                    className="w-full pl-9 pr-3 py-3 rounded-xl text-sm border-2 outline-none"
                    style={estiloInput('nombre')} placeholder={idioma === 'es' ? 'Tu nombre' : 'Your name'} maxLength={50} />
                </div>
                {fieldErrors.nombre && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.nombre}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-principal)' }}>{t('auth', 'lastNameLabel')}</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-suave)' }} />
                  <input type="text" name="apellido" value={form.apellido} onChange={handleChange}
                    className="w-full pl-9 pr-3 py-3 rounded-xl text-sm border-2 outline-none"
                    style={estiloInput('apellido')} placeholder={idioma === 'es' ? 'Tu apellido' : 'Your last name'} maxLength={50} />
                </div>
                {fieldErrors.apellido && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.apellido}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-principal)' }}>{t('auth', 'emailLabel')}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-suave)' }} />
                <input type="email" name="correo" value={form.correo} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border-2 outline-none"
                  style={estiloInput('correo')} placeholder="tucorreo@ejemplo.com" maxLength={254} />
              </div>
              {fieldErrors.correo && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.correo}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-principal)' }}>{t('auth', 'passwordLabel')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-suave)' }} />
                <input type={showPassword ? 'text' : 'password'} name="contrasena" value={form.contrasena} onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm border-2 outline-none"
                  style={estiloInput('contrasena')} placeholder={idioma === 'es' ? 'Mín. 8 caracteres, 1 mayúscula, 1 número' : 'Min. 8 chars, 1 uppercase, 1 number'} maxLength={128} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-suave)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.contrasena && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.contrasena}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-principal)' }}>{t('auth', 'confirmPassword')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-suave)' }} />
                <input type={showConfirm ? 'text' : 'password'} name="confirmarContrasena" value={form.confirmarContrasena} onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm border-2 outline-none"
                  style={estiloInput('confirmarContrasena')} placeholder="••••••••" maxLength={128} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-suave)' }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.confirmarContrasena && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.confirmarContrasena}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-principal)' }}>{t('auth', 'roleLabel')}</label>
              <select name="rol" value={form.rol} onChange={handleChange}
                className="w-full py-3 px-4 rounded-xl text-sm border-2 outline-none"
                style={{ borderColor: 'var(--borde-input)', color: 'var(--texto-principal)', backgroundColor: 'var(--bg-input)' }}>
                <option value="estudiante">{t('auth', 'student')}</option>
                <option value="padre">{t('auth', 'parent')}</option>
              </select>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              style={{ backgroundColor: loading ? '#6b7280' : 'var(--azul)', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(26,31,110,0.3)' }}>
              <UserPlus size={16} />
              {loading ? t('auth', 'creating') : t('auth', 'createBtn')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: 'var(--borde)' }}>
            <p className="text-sm" style={{ color: 'var(--texto-suave)' }}>
              {t('auth', 'haveAccount')}{' '}
              <Link href="/auth/login" className="font-bold" style={{ color: 'var(--azul-medio)' }}>
                {t('auth', 'loginLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
