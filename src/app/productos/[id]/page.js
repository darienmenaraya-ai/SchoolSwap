'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, MessageCircle, RefreshCw, Package } from 'lucide-react'

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
    setAgregando(false)
  }

  if (loading) return <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f7fa' }}><p style={{ color: '#64748b' }}>Cargando producto...</p></main>
  if (!producto) return <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f7fa' }}><p style={{ color: '#64748b' }}>Producto no encontrado.</p></main>

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#f5f7fa' }}>
      <nav className="px-6 py-3 flex items-center justify-between shadow-lg" style={{ backgroundColor: '#1a3a6b' }}>
        <Link href="/" className="text-2xl font-extrabold" style={{ color: '#c9a84c' }}>Market-cedes</Link>
        <Link href="/" className="flex items-center gap-2 text-sm font-medium" style={{ color: 'white' }}>
          <ArrowLeft size={16} /> Volver
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white rounded-2xl overflow-hidden h-96 flex items-center justify-center border shadow-sm" style={{ borderColor: '#e2e8f0' }}>
            {producto.imagen ? (
              <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
            ) : (
              <Package size={80} style={{ color: '#64748b' }} />
            )}
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: '#e8eef7', color: '#1a3a6b' }}>{producto.categoria?.nombre}</span>
              <h1 className="text-3xl font-extrabold mt-3" style={{ color: '#1e293b' }}>{producto.nombre}</h1>
              <p className="mt-4 leading-relaxed" style={{ color: '#64748b' }}>{producto.descripcion}</p>
              <div className="mt-6 space-y-2">
                <p className="text-4xl font-extrabold" style={{ color: '#c9a84c' }}>₡{Number(producto.precio).toLocaleString()}</p>
                <p className="text-sm" style={{ color: '#64748b' }}>Stock disponible: {producto.stock} unidades</p>
                <p className="text-sm" style={{ color: '#64748b' }}>Vendido por: {producto.usuario?.nombre} {producto.usuario?.apellido}</p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {mensaje && (
                <div className="p-3 rounded-lg text-sm border" style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac', color: '#16a34a' }}>
                  {mensaje}
                </div>
              )}
              {usuario?.id !== producto.id_usuario && (
                <div className="space-y-3">
                  <button onClick={agregarAlCarrito} disabled={agregando || producto.stock === 0}
                    className="w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                    style={{ backgroundColor: producto.stock === 0 ? '#e2e8f0' : '#1a3a6b', color: producto.stock === 0 ? '#94a3b8' : 'white' }}>
                    <ShoppingCart size={18} />
                    {agregando ? 'Agregando...' : producto.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                  </button>
                  <Link href={`/mensajes?usuario=${producto.id_usuario}`}
                    className="w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 border"
                    style={{ borderColor: '#1a3a6b', color: '#1a3a6b', backgroundColor: 'white' }}>
                    <MessageCircle size={18} />
                    Contactar vendedor
                  </Link>
                  <Link href={`/trueque/proponer?producto=${producto.id_producto}&vendedor=${producto.id_usuario}`}
                    className="w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#c9a84c', color: '#0f2548' }}>
                    <RefreshCw size={18} />
                    Proponer Trueque
                  </Link>
                </div>
              )}
              {usuario?.id === producto.id_usuario && (
                <div className="p-4 rounded-xl text-center text-sm border" style={{ backgroundColor: '#e8eef7', borderColor: '#1a3a6b', color: '#1a3a6b' }}>
                  Este es tu producto
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}