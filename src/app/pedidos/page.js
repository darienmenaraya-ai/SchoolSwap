'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Pedidos() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarPedidos() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data } = await supabase
        .from('pedido')
        .select('*, detalle_pedido(*, producto(nombre, imagen, precio))')
        .eq('id_usuario', user.id)
        .order('created_at', { ascending: false })

      setPedidos(data || [])
      setLoading(false)
    }
    cargarPedidos()
  }, [])

  function getEstadoColor(estado) {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-900/50 border-yellow-500 text-yellow-300'
      case 'procesando': return 'bg-blue-900/50 border-blue-500 text-blue-300'
      case 'completado': return 'bg-green-900/50 border-green-500 text-green-300'
      case 'cancelado': return 'bg-red-900/50 border-red-500 text-red-300'
      default: return 'bg-gray-900/50 border-gray-500 text-gray-300'
    }
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <nav className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-400">🏫 Marketplace Escolar</Link>
        <Link href="/" className="text-gray-400 hover:text-white text-sm transition">← Volver</Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">📦 Mis Pedidos</h1>

        {loading ? (
          <p className="text-gray-400">Cargando pedidos...</p>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📦</p>
            <p className="text-gray-400 text-lg">No tenés pedidos aún</p>
            <Link href="/" className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {pedidos.map((pedido) => (
              <div key={pedido.id_pedido} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
                <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Pedido #{pedido.id_pedido.slice(0, 8).toUpperCase()}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(pedido.created_at).toLocaleDateString('es-CR', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getEstadoColor(pedido.estado)}`}>
                      {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                    </span>
                    <span className="text-blue-400 font-bold">₡{Number(pedido.precio_total).toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {pedido.detalle_pedido?.map((detalle) => (
                    <div key={detalle.id_detalle} className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#2a2a2a] rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {detalle.producto?.imagen ? (
                          <img src={detalle.producto.imagen} alt={detalle.producto.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">📦</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{detalle.producto?.nombre}</p>
                        <p className="text-gray-400 text-xs">Cantidad: {detalle.cantidad} × ₡{Number(detalle.precio_unitario).toLocaleString()}</p>
                      </div>
                      <p className="text-white font-medium text-sm">
                        ₡{Number(detalle.cantidad * detalle.precio_unitario).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
