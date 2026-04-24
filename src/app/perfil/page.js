'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Package, Trash2, Plus } from 'lucide-react'

export default function Perfil() {
  const router = useRouter()
  const [perfil, setPerfil] = useState(null)
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [form, setForm] = useState({ nombre: '', apellido: '', correo: '' })

  useEffect(() => {
    async function cargarPerfil() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('usuario').select('*').eq('id_usuario', user.id).single()
      if (data) { setPerfil(data); setForm({ nombre: data.nombre, apellido: data.apellido, correo: data.correo }) }
      const { data: misProd } = await supabase.from('producto').select('*, categoria(nombre)')
        .eq('id_usuario', user.id).order('created_at', { ascending: false })
      setProductos(misProd || [])
      setLoading(false)
    }
    cargarPerfil()
  }, [])

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  async function handleGuardar(e) {
    e.preventDefault()
    setGuardando(true)
    const { error } = await supabase.from('usuario').update({ nombre: form.nombre, apellido: form.apellido }).eq('id_usuario', perfil.id_usuario)
    setMensaje(error ? 'Error al guardar' : 'Perfil actualizado correctamente')
    setTimeout(() => setMensaje(''), 3000)
    setGuardando(false)
  }

  async function eliminarProducto(id_producto) {
    if (!confirm('¿Estás seguro que querés eliminar este producto?')) return
    await supabase.from('producto').delete().eq('id_producto', id_producto)
    setProductos(productos.filter(p => p.id_producto !== id_producto))
  }

  if (loading) return <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f7ff' }}><p style={{ color: '#6b7280' }}>Cargando...</p></main>

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#f5f7ff' }}>
      <nav className="px-6 py-3 flex items-center justify-between shadow-lg" style={{ backgroundColor: '#1a1f6e' }}>
        <Link href="/"><img src="/logo.png" alt="SchoolSwap" className="h-12 w-auto" /></Link>
        <Link href="/" className="flex items-center gap-2 text-sm font-medium text-white"><ArrowLeft size={16} /> Volver</Link>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-extrabold mb-8 flex items-center gap-3" style={{ color: '#1a1f6e' }}>
          <User size={28} /> Mi Perfil
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border rounded-xl p-6 shadow-sm" style={{ borderColor: '#e2e6ff' }}>
            <h2 className="text-lg font-bold mb-6" style={{ color: '#1a1f6e' }}>Datos personales</h2>
            {mensaje && (
              <div className="p-3 rounded-lg mb-4 text-sm border" style={{ backgroundColor: '#eff6ff', borderColor: '#93c5fd', color: '#1e40af' }}>{mensaje}</div>
            )}
            <form onSubmit={handleGuardar} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#1a1f6e' }}>Nombre</label>
                <input type="text" name="nombre" value={form.nombre} onChange={handleChange}
                  className="w-full rounded-lg p-3 text-sm border focus:outline-none" style={{ borderColor: '#e2e6ff', color: '#1a1f6e' }} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#1a1f6e' }}>Apellido</label>
                <input type="text" name="apellido" value={form.apellido} onChange={handleChange}
                  className="w-full rounded-lg p-3 text-sm border focus:outline-none" style={{ borderColor: '#e2e6ff', color: '#1a1f6e' }} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#1a1f6e' }}>Correo</label>
                <input type="email" value={form.correo} disabled
                  className="w-full rounded-lg p-3 text-sm border" style={{ borderColor: '#e2e6ff', color: '#94a3b8', backgroundColor: '#f8fafc' }} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#1a1f6e' }}>Rol</label>
                <input type="text" value={perfil?.rol} disabled className="w-full rounded-lg p-3 text-sm border capitalize"
                  style={{ borderColor: '#e2e6ff', color: '#94a3b8', backgroundColor: '#f8fafc' }} />
              </div>
              <button type="submit" disabled={guardando}
                className="w-full py-2.5 rounded-lg font-bold text-sm transition"
                style={{ backgroundColor: '#1a1f6e', color: 'white' }}>
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </div>
          <div className="bg-white border rounded-xl p-6 shadow-sm" style={{ borderColor: '#e2e6ff' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: '#1a1f6e' }}>Mis productos</h2>
              <Link href="/productos/nuevo" className="flex items-center gap-1 text-sm font-bold" style={{ color: '#3b4fd8' }}>
                <Plus size={16} /> Publicar
              </Link>
            </div>
            {productos.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: '#6b7280' }}>No tenés productos publicados</p>
            ) : (
              <div className="space-y-3">
                {productos.map((producto) => (
                  <div key={producto.id_producto} className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: '#e2e6ff' }}>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0" style={{ backgroundColor: '#f5f7ff' }}>
                      {producto.imagen ? (
                        <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
                      ) : <Package size={20} style={{ color: '#6b7280' }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#1a1f6e' }}>{producto.nombre}</p>
                      <p className="text-xs font-bold" style={{ color: '#3b4fd8' }}>₡{Number(producto.precio).toLocaleString()}</p>
                    </div>
                    <button onClick={() => eliminarProducto(producto.id_producto)} style={{ color: '#94a3b8' }}><Trash2 size={16} /></button>
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