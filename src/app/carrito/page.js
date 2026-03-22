'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Carrito() {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    async function cargarCarrito() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: carrito } = await supabase
        .from('carrito')
        .select('*')
        .eq('id_usuario', user.id)
        .single()

      if (!carrito) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('carrito_item')
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
    await supabase
      .from('carrito_item')
      .update({ cantidad: nueva_cantidad })
      .eq('id_item', id_item)
    setItems(items.map(i => i.id_item === id_item ? { ...i, cantidad: nueva_cantidad } : i))
  }

  async function realizarPedido() {
    setProcesando(true)
    const { data: { user } } = await supabase.auth.getUser()

    const total = items.reduce((acc, item) => acc + (item.cantidad * item.producto.precio), 0)

    const { data: pedido, error: pedidoError } = await supabase
      .from('pedido')
      .insert({
        id_usuario: user.id,
        precio_total: total,
        estado: 'pendiente',
      })
      .select()
      .single()

    if (pedidoError) {
      setMensaje('❌ Error al crear el pedido: ' + pedidoError.message)
      setProcesando(false)
      return
    }

    for (const item of items) {
      const { error: detalleError } = await supabase
        .from('detalle_pedido')
        .insert({
          id_pedido: pedido.id_pedido,
          id_producto: item.producto.id_producto,
          cantidad: item.cantidad,
          precio_unitario: item.producto.precio,
        })

      if (detalleError) {
        setMensaje('❌ Error: ' + detalleError.message)
        setProcesando(false)
        return
      }
    }

    const { data: carrito } = await supabase
      .from('carrito')
      .select('*')
      .eq('id_usuario', user.id)
      .single()

    await supabase
      .from('carrito_item')
      .delete()
      .eq('id_carrito', carrito.id_carrito)

    setItems([])
    setMensaje('✅ Pedido realizado exitosamente!')
    setTimeout(() => router.push('/pedidos'), 2000)
    setProcesando(false)
  }

  const total = items.reduce((acc, item) => acc + (item.cantidad * item.producto.precio), 0)

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <nav className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-400">🏫 Marketplace Escolar</Link>
        <Link href="/" className="text-gray-400 hover:text-white text-sm transition">← Volver</Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">🛒 Mi Carrito</h1>

        {mensaje && (
          <div className={`p-4 rounded-xl mb-6 text-sm border ${mensaje.includes('✅') ? 'bg-green-900/50 border-green-500 text-green-300' : 'bg-red-900/50 border-red-500 text-red-300'}`}>
            {mensaje}
          </div>
        )}

        {loading ? (
          <p className="text-gray-400">Cargando carrito...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🛒</p>
            <p className="text-gray-400 text-lg">Tu carrito está vacío</p>
            <Link href="/" className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id_item} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-4">
                <div className="w-20 h-20 bg-[#2a2a2a] rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {item.producto.imagen ? (
                    <img src={item.producto.imagen} alt={item.producto.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">📦</span>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-white">{item.producto.nombre}</h3>
                  <p className="text-blue-400 font-bold">₡{Number(item.producto.precio).toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => actualizarCantidad(item.id_item, item.cantidad - 1)}
                    className="w-8 h-8 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg flex items-center justify-center transition"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{item.cantidad}</span>
                  <button
                    onClick={() => actualizarCantidad(item.id_item, item.cantidad + 1)}
                    className="w-8 h-8 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg flex items-center justify-center transition"
                  >
                    +
                  </button>
                </div>

                <p className="text-white font-bold w-24 text-right">
                  ₡{Number(item.cantidad * item.producto.precio).toLocaleString()}
                </p>

                <button
                  onClick={() => eliminarItem(item.id_item)}
                  className="text-gray-500 hover:text-red-400 transition ml-2"
                >
                  🗑️
                </button>
              </div>
            ))}

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 mt-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-400 text-lg">Total</span>
                <span className="text-3xl font-bold text-blue-400">₡{Number(total).toLocaleString()}</span>
              </div>
              <button
                onClick={realizarPedido}
                disabled={procesando}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-3 rounded-xl font-semibold text-lg transition"
              >
                {procesando ? 'Procesando...' : 'Realizar Pedido'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}