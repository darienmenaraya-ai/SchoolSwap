'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Package, Trash2, Plus, CheckCircle } from 'lucide-react'
import { validateName, sanitizeText } from '@/lib/security'

export default function Perfil() {
  const router = useRouter()
  const [perfil, setPerfil] = useState(null)
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFieldErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  function validate() {
    const errors = {}
    if (!validateName(form.nombre)) errors.nombre = 'Nombre inválido'
    if (!validateName(form.apellido)) errors.apellido = 'Apellido inválido'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleGuardar(e) {
    e.preventDefault()
    if (!validate()) return
    setGuardando(true)
    const { error } = await supabase.from('usuario').update({
      nombre: sanitizeText(form.nombre),
      apellido: sanitizeText(form.apellido),
    }).eq('id_usuario', perfil.id_usuario)
    setMensaje(error ? 'Error al guardar' : 'Perfil actualizado correctamente')
    setTimeout(() => setMensaje(''), 3000)
    setGuardando(false)
  }

  async function eliminarProducto(id_producto) {
    if (!confirm('¿Estás seguro que querés eliminar este producto?')) return
    await supabase.from('producto').delete().eq('id_producto', id_producto)
    setProductos(productos.filter(p => p.id_producto !== id_producto))
  }

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f0f4ff' }}>
      <p style={{ color: '#6b7280' }}>Cargando perfil...</p>
    </main>
  )

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#f0f4ff' }}>
      <nav style={{ backgroundColor: '#1a1f6e', boxShadow: '0 2px 20px rgba(26,31,110,0.3)' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between">
          <Link href="/">
            <div className="bg-white rounded-xl px-3 py-1 shadow-md">
              <img src="/logo.png" alt="SchoolSwap" style={{ height: '80px', width: 'auto', display: 'block' }} />
            </div>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-white hover:opacity-80">
            <ArrowLeft size={16} /> Volver
          </Link>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: '#1a1f6e' }}>
          <User size={28} /> Mi Perfil
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border rounded-3xl p-6 shadow-sm" style={{ borderColor: '#e5e7eb' }}>
            <h2 className="text-lg font-bold mb-5" style={{ color: '#1a1f6e' }}>Datos personales</h2>
            {mensaje && (
              <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
                style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #86efac' }}>
                <CheckCircle size={16} /> {mensaje}
              </div>
            )}
            <form onSubmit={handleGuardar} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>Nombre</label>
                <input type="text" name="nombre" value={form.nombre} onChange={handleChange}
                  className="w-full rounded-xl p-3 text-sm border-2 outline-none"
                  style={{ borderColor: fieldErrors.nombre ? '#fca5a5' : '#e5e7eb', color: '#111827', backgroundColor: '#fafafa' }}
                  maxLength={50} />
                {fieldErrors.nombre && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.nombre}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>Apellido</label>
                <input type="text" name="apellido" value={form.apellido} onChange={handleChange}
                  className="w-full rounded-xl p-3 text-sm border-2 outline-none"
                  style={{ borderColor: fieldErrors.apellido ? '#fca5a5' : '#e5e7eb', color: '#111827', backgroundColor: '#fafafa' }}
                  maxLength={50} />
                {fieldErrors.apellido && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.apellido}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>Correo</label>
                <input type="email" value={form.correo} disabled
                  className="w-full rounded-xl p-3 text-sm border-2"
                  style={{ borderColor: '#e5e7eb', color: '#9ca3af', backgroundColor: '#f3f4f6', cursor: 'not-allowed' }} />
                <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>El correo no se puede modificar</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>Rol</label>
                <input type="text" value={perfil?.rol} disabled
                  className="w-full rounded-xl p-3 text-sm border-2 capitalize"
                  style={{ borderColor: '#e5e7eb', color: '#9ca3af', backgroundColor: '#f3f4f6', cursor: 'not-allowed' }} />
              </div>
              <button type="submit" disabled={guardando}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                style={{ backgroundColor: '#1a1f6e', color: 'white', boxShadow: '0 4px 15px rgba(26,31,110,0.3)' }}>
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </div>
          <div className="bg-white border rounded-3xl p-6 shadow-sm" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: '#1a1f6e' }}>Mis productos</h2>
              <Link href="/productos/nuevo" className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg transition-all"
                style={{ backgroundColor: '#f0f4ff', color: '#3b4fd8' }}>
                <Plus size={14} /> Publicar
              </Link>
            </div>
            {productos.length === 0 ? (
              <div className="text-center py-10">
                <Package size={40} className="mx-auto mb-2" style={{ color: '#d1d5db' }} />
                <p className="text-sm" style={{ color: '#9ca3af' }}>No tenés productos publicados</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {productos.map((producto) => (
                  <div key={producto.id_producto} className="flex items-center gap-3 rounded-xl p-3 border hover:bg-gray-50 transition-colors"
                    style={{ borderColor: '#f3f4f6' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0" style={{ backgroundColor: '#f8faff' }}>
                      {producto.imagen ? (
                        <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
                      ) : <Package size={20} style={{ color: '#d1d5db' }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#111827' }}>{producto.nombre}</p>
                      <p className="text-xs font-bold" style={{ color: '#3b4fd8' }}>₡{Number(producto.precio).toLocaleString()}</p>
                    </div>
                    <button onClick={() => eliminarProducto(producto.id_producto)} className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 size={15} style={{ color: '#9ca3af' }} />
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