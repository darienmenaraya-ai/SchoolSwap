'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 rounded-xl shadow-2xl w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Iniciar Sesión</h1>
          <p className="text-gray-400 text-sm mt-2">Marketplace Escolar Cedes Don Bosco</p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="tucorreo@ejemplo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold text-lg transition mt-2"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-400">
          ¿No tenés cuenta?{' '}
          <Link href="/auth/registro" className="text-blue-400 hover:text-blue-300 transition">
            Registrate
          </Link>
        </p>
      </div>
    </main>
  )
}