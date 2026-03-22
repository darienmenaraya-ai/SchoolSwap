'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Registro() {
  const router = useRouter()
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    rol: 'estudiante'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleRegistro(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.correo,
      password: form.contrasena,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const { error: dbError } = await supabase.from('usuario').insert({
      id_usuario: data.user.id,
      nombre: form.nombre,
      apellido: form.apellido,
      correo: form.correo,
      contrasena: form.contrasena,
      rol: form.rol,
    })

    if (dbError) {
      setError(dbError.message)
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center py-12">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 rounded-xl shadow-2xl w-full max-w-md">

        <div className="text-center mb-8">
          <p className="text-4xl mb-3">🏫</p>
          <h1 className="text-2xl font-bold text-white">Crear Cuenta</h1>
          <p className="text-gray-400 text-sm mt-2">Marketplace Escolar Cedes Don Bosco</p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegistro} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Tu nombre"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Apellido</label>
              <input
                type="text"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Tu apellido"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Correo</label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="tucorreo@ejemplo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
            <input
              type="password"
              name="contrasena"
              value={form.contrasena}
              onChange={handleChange}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Rol</label>
            <select
              name="rol"
              value={form.rol}
              onChange={handleChange}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="estudiante">Estudiante</option>
              <option value="padre">Padre</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold text-lg transition mt-2"
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-400">
          ¿Ya tenés cuenta?{' '}
          <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 transition">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </main>
  )
}