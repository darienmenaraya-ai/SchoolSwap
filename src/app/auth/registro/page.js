'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { validateEmail, validatePassword, validateName, checkRateLimit, safeErrorMessage, sanitizeText } from '@/lib/security'

export default function Registro() {
  const router = useRouter()
  const [form, setForm] = useState({ nombre: '', apellido: '', correo: '', contrasena: '', rol: 'estudiante' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFieldErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  function validate() {
    const errors = {}
    if (!form.nombre || !validateName(form.nombre)) errors.nombre = 'Nombre inválido (solo letras, 2-50 caracteres)'
    if (!form.apellido || !validateName(form.apellido)) errors.apellido = 'Apellido inválido'
    if (!form.correo || !validateEmail(form.correo)) errors.correo = 'Correo inválido'
    const pwErrors = validatePassword(form.contrasena)
    if (pwErrors.length > 0) errors.contrasena = pwErrors.join(', ')
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleRegistro(e) {
    e.preventDefault()
    if (!validate()) return
    const rateLimitKey = `register_${form.correo.toLowerCase()}`
    if (!checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)) {
      setError('Demasiados intentos de registro. Esperá 1 hora.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const cleanEmail = form.correo.trim().toLowerCase()
      const cleanNombre = sanitizeText(form.nombre)
      const cleanApellido = sanitizeText(form.apellido)
      const { data, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: form.contrasena,
        options: { emailRedirectTo: `${window.location.origin}/` },
      })
      if (authError) { setError(safeErrorMessage(authError)); return }
      if (data?.user) {
        const { error: dbError } = await supabase.from('usuario').insert({
          id_usuario: data.user.id,
          nombre: cleanNombre,
          apellido: cleanApellido,
          correo: cleanEmail,
          contrasena: '***',
          rol: form.rol,
        })
        if (dbError) { setError('Error al crear el perfil. Intentá de nuevo.'); return }
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('Ocurrió un error inesperado. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (field) => ({
    borderColor: fieldErrors[field] ? '#fca5a5' : '#e5e7eb',
    color: '#111827', backgroundColor: '#fafafa',
  })

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-2xl px-8 py-3 shadow-lg">
            <img src="/logo.png" alt="SchoolSwap" style={{ height: '88px', width: 'auto' }} />
          </div>
          <p className="mt-3 text-sm font-medium" style={{ color: '#6b7280' }}>CEDES Don Bosco</p>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-8 border" style={{ borderColor: '#e2e8ff' }}>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#1a1f6e' }}>Crea tu cuenta</h1>
          <p className="text-sm mb-6" style={{ color: '#6b7280' }}>Únete al marketplace de tu colegio</p>
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
              style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              <span>⚠</span> {error}
            </div>
          )}
          <form onSubmit={handleRegistro} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>Nombre</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
                  <input type="text" name="nombre" value={form.nombre} onChange={handleChange}
                    className="w-full pl-9 pr-3 py-3 rounded-xl text-sm border-2 outline-none"
                    style={inputStyle('nombre')} placeholder="Tu nombre" maxLength={50} />
                </div>
                {fieldErrors.nombre && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.nombre}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>Apellido</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
                  <input type="text" name="apellido" value={form.apellido} onChange={handleChange}
                    className="w-full pl-9 pr-3 py-3 rounded-xl text-sm border-2 outline-none"
                    style={inputStyle('apellido')} placeholder="Tu apellido" maxLength={50} />
                </div>
                {fieldErrors.apellido && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.apellido}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>Correo electrónico</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
                <input type="email" name="correo" value={form.correo} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border-2 outline-none"
                  style={inputStyle('correo')} placeholder="tucorreo@ejemplo.com" maxLength={254} />
              </div>
              {fieldErrors.correo && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.correo}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
                <input type={showPassword ? 'text' : 'password'} name="contrasena" value={form.contrasena} onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm border-2 outline-none"
                  style={inputStyle('contrasena')} placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número" maxLength={128} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.contrasena && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.contrasena}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>Rol</label>
              <select name="rol" value={form.rol} onChange={handleChange}
                className="w-full py-3 px-4 rounded-xl text-sm border-2 outline-none"
                style={{ borderColor: '#e5e7eb', color: '#111827', backgroundColor: '#fafafa' }}>
                <option value="estudiante">Estudiante</option>
                <option value="padre">Padre de familia</option>
              </select>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              style={{ backgroundColor: loading ? '#6b7280' : '#1a1f6e', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(26,31,110,0.3)' }}>
              <UserPlus size={16} />
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: '#f3f4f6' }}>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              ¿Ya tenés cuenta?{' '}
              <Link href="/auth/login" className="font-bold" style={{ color: '#3b4fd8' }}>Iniciá sesión</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}