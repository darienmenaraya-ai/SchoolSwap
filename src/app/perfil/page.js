'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Perfil() {
  const router = useRouter()
  const [perfil, setPerfil] = useState(null)
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    correo: '',
  })

  useEffect(() => {
    async function cargarPerfil() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data } = await supabase
        .from('usuario')
        .select('*')
        .eq('id_usuario', user.id)
        .single()

      if (data) {
        setPerfil(data)
        setForm({
          nombre: data.nombre,
          apellido: data.apellido,
          correo: data.correo,
        })
      }

      const { data: misProductos } = await supabase
        .from('producto')
        .select('*, categoria(nombre)')
        .eq('id_usuario', user.id)
        .order('created_at', { ascending: false })

      setProductos(misProductos || [])
      setLoading(false)
    }
    cargarPerfil()
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleGuardar(e) {
    e.preventDefault()
    setGuardando(true)

    const { error } = await supabase
      .from('usuario')
      .update({
        nombre: form.nombre,
        apellido: form.apellido,
      })
      .eq('id_usuario', perfil.id_usuario)

    if (error) {
      setMensaje('❌ Error al guardar: ' + error.message)
    } else {
      setMensaje('✅ Perfil actualizado correctamente')
    }

    setTimeout(() => setMensaje(''), 3000)
    setGuardando(false)
  }

  async function eliminarProducto(id_producto) {
    if (!confirm('¿Estás seguro que querés eliminar este producto?')) return

    await supabase.from('producto').delete().eq('id_producto', id_producto)
    setProductos(productos.filter(p => p.id_producto !== id_producto))
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-gray-400">Cargando perfil...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <nav className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-400">🏫 Marketplace Escolar</Link>
        <Link href="/" className="text-gray-400 hover:text-white text-sm transition">← Volver</Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">👤 Mi Perfil</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* DATOS PERSONALES */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Datos personales</h2>

            {mensaje && (
              <div className={`p-3 rounded-lg mb-4 text-sm border ${mensaje.includes('✅') ? 'bg-green-900/50 border-green-500 text-green-300' : 'bg-red-900/50 border-red-500 text-red-300'}`}>
                {mensaje}
              </div>
            )}

            <form onSubmit={handleGuardar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Apellido</label>
                <input
                  type="text"
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Correo</label>
                <input
                  type="email"
                  value={form.correo}
                  disabled
                  className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rol</label>
                <input
                  type="text"
                  value={perfil?.rol}
                  disabled
                  className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3 text-gray-500 cursor-not-allowed capitalize"
                />
              </div>

              <button
                type="submit"
                disabled={guardando}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition"
              >
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </div>

          {/* MIS PRODUCTOS */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Mis productos</h2>
              <Link href="/productos/nuevo" className="text-blue-400 hover:text-blue-300 text-sm transition">
                + Publicar
              </Link>
            </div>

            {productos.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No tenés productos publicados</p>
            ) : (
              <div className="space-y-3">
                {productos.map((producto) => (
                  <div key={producto.id_producto} className="flex items-center gap-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3">
                    <div className="w-12 h-12 bg-[#2a2a2a] rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {producto.imagen ? (
                        <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">📦</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{producto.nombre}</p>
                      <p className="text-blue-400 text-xs">₡{Number(producto.precio).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => eliminarProducto(producto.id_producto)}
                      className="text-gray-500 hover:text-red-400 transition text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
