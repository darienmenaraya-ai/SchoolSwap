'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, MessageCircle, RefreshCw, Package, CheckCircle } from 'lucide-react'

export default function DetalleProducto() {
  const router = useRouter()
  const { id } = useParams()
  const [producto, setProducto] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
  const [agregando, setAgregando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    async function cargarDatos() {
      const { data: { user } } = await supabase.auth.getUser()
      setUsuario(user)
      const { data } = await supabase.from('producto')
        .select('*, categoria(nombre), usuario(nombre, apellido)')
        .eq('id_producto', id).single()
      setProducto(data)
      setLoading(false)
    }
    cargarDatos()
  }, [id])

  async function agregarAlCarrito() {
    if (!usuario) { router.push('/auth/login'); return }
    setAgregando(true)
    try {
      let { data: carrito } = await supabase.from('carrito').select('*').eq('id_usuario', usuario.id).single()
      if (!carrito) {
        const { data: nuevo } = await supabase.from('carrito').insert({ id_usuario: usuario.id }).select().single()
        carrito = nuevo
      }
      const { data: itemExistente } = await supabase.from('carrito_item').select('*')
        .eq('id_carrito', carrito.id_carrito).eq('id_producto', id).single()
      if (itemExistente) {
        await supabase.from('carrito_item').update({ cantidad: itemExistente.cantidad + 1 }).eq('id_item', itemExistente.id_item)
      } else {
        await supabase.from('carrito_item').insert({ id_carrito: carrito.id_carrito, id_producto: id, cantidad: 1 })
      }
      setMensaje('Producto agregado al carrito')
      setTimeout(() => setMensaje(''), 3000)
    } catch {
      setMensaje('Error al agregar al carrito')
    } finally {
      setAgregando(false)
    }
  }

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f0f4ff' }}>
      <div className="text-center">
        <Package size={48} style={{ color: '#d1d5db' }} className="mx-auto mb-2" />
        <p style={{ color: '#6b7280' }}>Cargando producto...</p>
      </div>
    </main>
  )

  if (!producto) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f0f4ff' }}>
      <div className="text-center">
        <Package size={48} style={{ color: '#d1d5db' }} className="mx-auto mb-2" />
        <p style={{ color: '#6b7280' }}>Producto no encontrado.</p>
        <Link href="/" className="mt-4 inline-block text-sm font-bold" style={{ color: '#3b4fd8' }}>Volver al inicio</Link>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#f0f4ff' }}>
      <nav style={{ backgroundColor: '#1a1f6e', boxShadow: '0 2px 20px rgba(26,31,110,0.3)' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/">
            <div className="bg-white rounded-xl px-4 py-2 shadow-md">
              <img src="/logo.png" alt="SchoolSwap" style={{ height: '48px', width: 'auto', display: 'block' }} />
            </div>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-white hover:opacity-80 transition-opacity">
            <ArrowLeft size={16} /> Volver
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border" style={{ borderColor: '#e5e7eb' }}>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* IMAGEN */}
            <div className="h-80 md:h-full flex items-center justify-center" style={{ backgroundColor: '#f8faff', minHeight: '320px' }}>
              {producto.imagen ? (
                <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <Package size={80} style={{ color: '#d1d5db' }} />
                  <p className="text-sm mt-2" style={{ color: '#9ca3af' }}>Sin imagen</p>
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: '#e8eaff', color: '#3b4fd8' }}>
                    {producto.categoria?.nombre}
                  </span>
                  {producto.stock > 0 ? (
                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: '#f0fdf4', color: '#166534' }}>
                      En stock
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
                      Agotado
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold mb-3" style={{ color: '#111827' }}>{producto.nombre}</h1>
                <p className="leading-relaxed text-sm" style={{ color: '#6b7280' }}>{producto.descripcion}</p>

                <div className="mt-6 p-4 rounded-2xl" style={{ backgroundColor: '#f0f4ff' }}>
                  <p className="text-4xl font-extrabold" style={{ color: '#1a1f6e' }}>₡{Number(producto.precio).toLocaleString()}</p>
                  <p className="text-sm mt-1" style={{ color: '#6b7280' }}>{producto.stock} unidades disponibles</p>
                  <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
                    Vendido por: <span className="font-semibold" style={{ color: '#1a1f6e' }}>{producto.usuario?.nombre} {producto.usuario?.apellido}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {mensaje && (
                  <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #86efac' }}>
                    <CheckCircle size={16} /> {mensaje}
                  </div>
                )}

                {usuario?.id !== producto.id_usuario ? (
                  <div className="space-y-3">
                    <button onClick={agregarAlCarrito} disabled={agregando || producto.stock === 0}
                      className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                      style={{
                        backgroundColor: producto.stock === 0 ? '#e5e7eb' : '#1a1f6e',
                        color: producto.stock === 0 ? '#9ca3af' : 'white',
                        cursor: (agregando || producto.stock === 0) ? 'not-allowed' : 'pointer',
                        boxShadow: producto.stock > 0 ? '0 4px 15px rgba(26,31,110,0.3)' : 'none',
                      }}>
                      <ShoppingCart size={18} />
                      {agregando ? 'Agregando...' : producto.stock === 0 ? 'Sin stock disponible' : 'Agregar al carrito'}
                    </button>
                    <Link href={`/mensajes?usuario=${producto.id_usuario}`}
                      className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all hover:bg-blue-50"
                      style={{ borderColor: '#1a1f6e', color: '#1a1f6e', backgroundColor: 'white' }}>
                      <MessageCircle size={18} /> Contactar vendedor
                    </Link>
                    <Link href={`/trueque/proponer?producto=${producto.id_producto}&vendedor=${producto.id_usuario}`}
                      className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
                      style={{ backgroundColor: '#3b4fd8', color: 'white', boxShadow: '0 4px 15px rgba(59,79,216,0.3)' }}>
                      <RefreshCw size={18} /> Proponer Trueque
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl text-center text-sm border-2" style={{ backgroundColor: '#f0f4ff', borderColor: '#c7d2fe', color: '#1a1f6e' }}>
                    Este es tu producto
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}