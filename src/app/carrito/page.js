'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, ShoppingCart, Trash2 } from 'lucide-react'

export default function Carrito() {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    async function cargarCarrito() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: carrito } = await supabase.from('carrito').select('*').eq('id_usuario', user.id).single()
      if (!carrito) { setLoading(false); return }
      const { data } = await supabase.from('carrito_item')
        .select('*, producto(id_producto, nombre, precio, imagen, stock)')
        .eq('id_carrito', carrito.id_carrito)
      setItems(data || [])
      setLoading(false)
    }
    cargarCarrito()
  }, [])

  async function eliminarItem(id_item) {
    await supabase.from('carrito_item').delete().eq('id_item', id_item)
    setItems(items.filter(i => i.id_item !== id_item))
  }

  async function actualizarCantidad(id_item, nueva_cantidad) {
    if (nueva_cantidad < 1) return
    await supabase.from('carrito_item').update({ cantidad: nueva_cantidad }).eq('id_item', id_item)
    setItems(items.map(i => i.id_item === id_item ? { ...i, cantidad: nueva_cantidad } : i))
  }

  async function realizarPedido() {
    setProcesando(true)
    const { data: { user } } = await supabase.auth.getUser()
    const total = items.reduce((acc, item) => acc + (item.cantidad * item.producto.precio), 0)
    const { data: pedido, error: pedidoError } = await supabase.from('pedido')
      .insert({ id_usuario: user.id, precio_total: total, estado: 'pendiente' }).select().single()
    if (pedidoError) { setMensaje('Error al crear el pedido'); setProcesando(false); return }
    for (const item of items) {
      const { error: detalleError } = await supabase.from('detalle_pedido').insert({
        id_pedido: pedido.id_pedido, id_producto: item.producto.id_producto,
        cantidad: item.cantidad, precio_unitario: item.producto.precio,
      })
      if (detalleError) { setMensaje('Error: ' + detalleError.message); setProcesando(false); return }
    }
    const { data: carrito } = await supabase.from('carrito').select('*').eq('id_usuario', user.id).single()
    await supabase.from('carrito_item').delete().eq('id_carrito', carrito.id_carrito)
    setItems([])
    setMensaje('Pedido realizado exitosamente')
    setTimeout(() => router.push('/pedidos'), 2000)
    setProcesando(false)
  }

  const total = items.reduce((acc, item) => acc + (item.cantidad * item.producto.precio), 0)

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#f5f7fa' }}>
      <nav className="px-6 py-3 flex items-center justify-between shadow-lg" style={{ backgroundColor: '#1a3a6b' }}>
        <Link href="/" className="text-2xl font-extrabold" style={{ color: '#c9a84c' }}>Market-cedes</Link>
        <Link href="/" className="flex items-center gap-2 text-sm font-medium" style={{ color: 'white' }}>
          <ArrowLeft size={16} /> Volver
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-extrabold mb-8 flex items-center gap-3" style={{ color: '#1a3a6b' }}>
          <ShoppingCart size={28} /> Mi Carrito
        </h1>

        {mensaje && (
          <div className="p-4 rounded-xl mb-6 text-sm border" style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac', color: '#16a34a' }}>
            {mensaje}
          </div>
        )}

        {loading ? (
          <p style={{ color: '#64748b' }}>Cargando carrito...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart size={56} className="mx-auto mb-4" style={{ color: '#64748b' }} />
            <p className="text-lg" style={{ color: '#64748b' }}>Tu carrito está vacío</p>
            <Link href="/" className="mt-4 inline-block px-6 py-2 rounded-lg text-sm font-bold transition"
              style={{ backgroundColor: '#1a3a6b', color: 'white' }}>Ver productos</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id_item} className="bg-white border rounded-xl p-4 flex items-center gap-4 shadow-sm" style={{ borderColor: '#e2e8f0' }}>
                <div className="w-20 h-20 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0" style={{ backgroundColor: '#f5f7fa' }}>
                  {item.producto.imagen ? (
                    <img src={item.producto.imagen} alt={item.producto.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={32} style={{ color: '#64748b' }} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold" style={{ color: '#1e293b' }}>{item.producto.nombre}</h3>
                  <p className="font-bold text-sm" style={{ color: '#c9a84c' }}>₡{Number(item.producto.precio).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => actualizarCantidad(item.id_item, item.cantidad - 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold border transition"
                    style={{ borderColor: '#e2e8f0', color: '#1a3a6b' }}>-</button>
                  <span className="w-8 text-center font-bold" style={{ color: '#1e293b' }}>{item.cantidad}</span>
                  <button onClick={() => actualizarCantidad(item.id_item, item.cantidad + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold border transition"
                    style={{ borderColor: '#e2e8f0', color: '#1a3a6b' }}>+</button>
                </div>
                <p className="font-extrabold w-24 text-right" style={{ color: '#1a3a6b' }}>
                  ₡{Number(item.cantidad * item.producto.precio).toLocaleString()}
                </p>
                <button onClick={() => eliminarItem(item.id_item)} className="transition" style={{ color: '#94a3b8' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

            <div className="bg-white border rounded-xl p-6 mt-6 shadow-sm" style={{ borderColor: '#e2e8f0' }}>
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold" style={{ color: '#64748b' }}>Total</span>
                <span className="text-3xl font-extrabold" style={{ color: '#c9a84c' }}>₡{Number(total).toLocaleString()}</span>
              </div>
              <button onClick={realizarPedido} disabled={procesando}
                className="w-full py-3 rounded-xl font-bold text-sm transition"
                style={{ backgroundColor: '#1a3a6b', color: 'white' }}>
                {procesando ? 'Procesando...' : 'Realizar Pedido'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}