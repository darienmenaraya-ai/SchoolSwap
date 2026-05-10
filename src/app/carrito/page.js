'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, ShoppingCart, Trash2, CheckCircle } from 'lucide-react'

export default function Carrito() {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState({ text: '', type: '' })

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
    if (!user) { router.push('/auth/login'); return }
    const total = items.reduce((acc, item) => acc + (item.cantidad * item.producto.precio), 0)
    const { data: pedido, error: pedidoError } = await supabase.from('pedido')
      .insert({ id_usuario: user.id, precio_total: total, estado: 'pendiente' }).select().single()
    if (pedidoError) { setMensaje({ text: 'Error al crear el pedido', type: 'error' }); setProcesando(false); return }
    for (const item of items) {
      const { error: detalleError } = await supabase.from('detalle_pedido').insert({
        id_pedido: pedido.id_pedido, id_producto: item.producto.id_producto,
        cantidad: item.cantidad, precio_unitario: item.producto.precio,
      })
      if (detalleError) { setMensaje({ text: 'Error al procesar el pedido', type: 'error' }); setProcesando(false); return }
    }
    const { data: carrito } = await supabase.from('carrito').select('*').eq('id_usuario', user.id).single()
    await supabase.from('carrito_item').delete().eq('id_carrito', carrito.id_carrito)
    setItems([])
    setMensaje({ text: 'Pedido realizado exitosamente', type: 'success' })
    setTimeout(() => router.push('/pedidos'), 2000)
    setProcesando(false)
  }

  const total = items.reduce((acc, item) => acc + (item.cantidad * item.producto.precio), 0)

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#f0f4ff' }}>
      <nav style={{ backgroundColor: '#1a1f6e', boxShadow: '0 2px 20px rgba(26,31,110,0.3)' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between">
          <Link href="/">
            <div className="bg-white rounded-xl px-3 py-1 shadow-md">
              <img src="/logo.png" alt="SchoolSwap" style={{ height: '80px', width: 'auto', display: 'block' }} />
            </div>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-white hover:opacity-80 transition-opacity">
            <ArrowLeft size={16} /> Volver
          </Link>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: '#1a1f6e' }}>
          <ShoppingCart size={28} /> Mi Carrito
        </h1>
        {mensaje.text && (
          <div className="flex items-center gap-2 p-4 rounded-xl mb-6 text-sm"
            style={{ backgroundColor: mensaje.type === 'success' ? '#f0fdf4' : '#fef2f2', color: mensaje.type === 'success' ? '#166534' : '#dc2626', border: `1px solid ${mensaje.type === 'success' ? '#86efac' : '#fecaca'}` }}>
            <CheckCircle size={16} /> {mensaje.text}
          </div>
        )}
        {loading ? (
          <div className="space-y-4">
            {[1,2].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse flex gap-4" style={{ height: '96px' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: '#e5e7eb', borderRadius: '12px' }} />
                <div className="flex-1 space-y-2 pt-2">
                  <div style={{ height: '16px', backgroundColor: '#e5e7eb', borderRadius: '6px', width: '60%' }} />
                  <div style={{ height: '14px', backgroundColor: '#e5e7eb', borderRadius: '6px', width: '30%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border shadow-sm" style={{ borderColor: '#e5e7eb' }}>
            <ShoppingCart size={64} className="mx-auto mb-4" style={{ color: '#d1d5db' }} />
            <p className="text-lg font-semibold" style={{ color: '#374151' }}>Tu carrito está vacío</p>
            <p className="text-sm mt-1 mb-6" style={{ color: '#9ca3af' }}>Agregá productos para empezar</p>
            <Link href="/" className="px-6 py-3 rounded-xl text-sm font-bold transition-all"
              style={{ backgroundColor: '#1a1f6e', color: 'white', boxShadow: '0 4px 15px rgba(26,31,110,0.3)' }}>
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id_item} className="bg-white border rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
                style={{ borderColor: '#e5e7eb' }}>
                <div className="w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0" style={{ backgroundColor: '#f8faff' }}>
                  {item.producto.imagen ? (
                    <img src={item.producto.imagen} alt={item.producto.nombre} className="w-full h-full object-cover" />
                  ) : <Package size={32} style={{ color: '#d1d5db' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate" style={{ color: '#111827' }}>{item.producto.nombre}</h3>
                  <p className="font-bold text-sm mt-0.5" style={{ color: '#3b4fd8' }}>₡{Number(item.producto.precio).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => actualizarCantidad(item.id_item, item.cantidad - 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg border-2 transition-all hover:bg-gray-50"
                    style={{ borderColor: '#e5e7eb', color: '#374151' }}>−</button>
                  <span className="w-8 text-center font-bold text-sm" style={{ color: '#111827' }}>{item.cantidad}</span>
                  <button onClick={() => actualizarCantidad(item.id_item, item.cantidad + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg border-2 transition-all hover:bg-gray-50"
                    style={{ borderColor: '#e5e7eb', color: '#374151' }}>+</button>
                </div>
                <p className="font-extrabold text-sm w-24 text-right" style={{ color: '#1a1f6e' }}>
                  ₡{Number(item.cantidad * item.producto.precio).toLocaleString()}
                </p>
                <button onClick={() => eliminarItem(item.id_item)} className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 size={16} style={{ color: '#9ca3af' }} />
                </button>
              </div>
            ))}
            <div className="bg-white border rounded-3xl p-6 mt-4 shadow-sm" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-base font-semibold" style={{ color: '#6b7280' }}>Total a pagar</span>
                <span className="text-3xl font-extrabold" style={{ color: '#1a1f6e' }}>₡{Number(total).toLocaleString()}</span>
              </div>
              <button onClick={realizarPedido} disabled={procesando}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                style={{ backgroundColor: procesando ? '#6b7280' : '#1a1f6e', color: 'white', cursor: procesando ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(26,31,110,0.3)' }}>
                {procesando ? 'Procesando pedido...' : 'Confirmar Pedido'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}