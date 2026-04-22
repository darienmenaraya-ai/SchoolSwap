'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'

export default function Pedidos() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarPedidos() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('pedido')
        .select('*, detalle_pedido(*, producto(nombre, imagen, precio))')
        .eq('id_usuario', user.id).order('created_at', { ascending: false })
      setPedidos(data || [])
      setLoading(false)
    }
    cargarPedidos()
  }, [])

  function getEstadoStyle(estado) {
    switch (estado) {
      case 'pendiente': return { backgroundColor: '#fefce8', borderColor: '#fde047', color: '#854d0e' }
      case 'procesando': return { backgroundColor: '#eff6ff', borderColor: '#93c5fd', color: '#1e40af' }
      case 'completado': return { backgroundColor: '#f0fdf4', borderColor: '#86efac', color: '#166534' }
      case 'cancelado': return { backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#dc2626' }
      default: return { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }
    }
  }

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
          <Package size={28} /> Mis Pedidos
        </h1>

        {loading ? (
          <p style={{ color: '#64748b' }}>Cargando pedidos...</p>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-20">
            <Package size={56} className="mx-auto mb-4" style={{ color: '#64748b' }} />
            <p className="text-lg" style={{ color: '#64748b' }}>No tenés pedidos aún</p>
            <Link href="/" className="mt-4 inline-block px-6 py-2 rounded-lg text-sm font-bold transition"
              style={{ backgroundColor: '#1a3a6b', color: 'white' }}>Ver productos</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {pedidos.map((pedido) => (
              <div key={pedido.id_pedido} className="bg-white border rounded-xl overflow-hidden shadow-sm" style={{ borderColor: '#e2e8f0' }}>
                <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#e2e8f0' }}>
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#1a3a6b' }}>Pedido #{pedido.id_pedido.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                      {new Date(pedido.created_at).toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full border" style={getEstadoStyle(pedido.estado)}>
                      {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                    </span>
                    <span className="font-extrabold" style={{ color: '#c9a84c' }}>₡{Number(pedido.precio_total).toLocaleString()}</span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {pedido.detalle_pedido?.map((detalle) => (
                    <div key={detalle.id_detalle} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0" style={{ backgroundColor: '#f5f7fa' }}>
                        {detalle.producto?.imagen ? (
                          <img src={detalle.producto.imagen} alt={detalle.producto.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={20} style={{ color: '#64748b' }} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>{detalle.producto?.nombre}</p>
                        <p className="text-xs" style={{ color: '#64748b' }}>Cantidad: {detalle.cantidad} × ₡{Number(detalle.precio_unitario).toLocaleString()}</p>
                      </div>
                      <p className="font-bold text-sm" style={{ color: '#1a3a6b' }}>
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