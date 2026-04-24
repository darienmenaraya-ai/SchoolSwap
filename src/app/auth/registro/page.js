'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'

export default function Registro() {
  const router = useRouter()
  const [form, setForm] = useState({ nombre: '', apellido: '', correo: '', contrasena: '', rol: 'estudiante' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  async function handleRegistro(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error: authError } = await supabase.auth.signUp({ email: form.correo, password: form.contrasena })
    if (authError) { setError(authError.message); setLoading(false); return }
    const { error: dbError } = await supabase.from('usuario').insert({
      id_usuario: data.user.id, nombre: form.nombre, apellido: form.apellido,
      correo: form.correo, contrasena: form.contrasena, rol: form.rol,
    })
    if (dbError) { setError(dbError.message); setLoading(false); return }
    router.push('/')
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-12" style={{ backgroundColor: '#f5f7ff' }}>
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border" style={{ borderColor: '#e2e6ff' }}>
        <div className="text-center mb-8">
          <img src="/logo.png" alt="SchoolSwap" className="h-16 w-auto mx-auto mb-4" />
          <p className="text-sm font-semibold" style={{ color: '#6b7280' }}>Creá tu cuenta</p>
        </div>
        {error && (
          <div className="p-3 rounded-lg mb-4 text-sm border" style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#dc2626' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleRegistro} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#1a1f6e' }}>Nombre</label>
              <input type="text" name="nombre" value={form.nombre} onChange={handleChange}
                className="w-full rounded-lg p-3 text-sm border focus:outline-none" style={{ borderColor: '#e2e6ff', color: '#1a1f6e' }}
                placeholder="Tu nombre" required />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#1a1f6e' }}>Apellido</label>
              <input type="text" name="apellido" value={form.apellido} onChange={handleChange}
                className="w-full rounded-lg p-3 text-sm border focus:outline-none" style={{ borderColor: '#e2e6ff', color: '#1a1f6e' }}
                placeholder="Tu apellido" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#1a1f6e' }}>Correo</label>
            <input type="email" name="correo" value={form.correo} onChange={handleChange}
              className="w-full rounded-lg p-3 text-sm border focus:outline-none" style={{ borderColor: '#e2e6ff', color: '#1a1f6e' }}
              placeholder="tucorreo@ejemplo.com" required />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#1a1f6e' }}>Contraseña</label>
            <input type="password" name="contrasena" value={form.contrasena} onChange={handleChange}
              className="w-full rounded-lg p-3 text-sm border focus:outline-none" style={{ borderColor: '#e2e6ff', color: '#1a1f6e' }}
              placeholder="••••••••" required />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#1a1f6e' }}>Rol</label>
            <select name="rol" value={form.rol} onChange={handleChange}
              className="w-full rounded-lg p-3 text-sm border focus:outline-none" style={{ borderColor: '#e2e6ff', color: '#1a1f6e' }}>
              <option value="estudiante">Estudiante</option>
              <option value="padre">Padre</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2"
            style={{ backgroundColor: '#1a1f6e', color: 'white' }}>
            <UserPlus size={16} />
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>
        <p className="text-center text-sm mt-6" style={{ color: '#6b7280' }}>
          ¿Ya tenés cuenta?{' '}
          <Link href="/auth/login" className="font-bold" style={{ color: '#3b4fd8' }}>Iniciá sesión</Link>
        </p>
      </div>
    </main>
  )
}