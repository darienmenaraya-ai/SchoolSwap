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
      case 'pendiente': return { bg: '#fefce8', border: '#fde047', text: '#854d0e', label: 'Pendiente' }
      case 'procesando': return { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', label: 'Procesando' }
      case 'completado': return { bg: '#f0fdf4', border: '#86efac', text: '#166534', label: 'Completado' }
      case 'cancelado': return { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626', label: 'Cancelado' }
      default: return { bg: '#f9fafb', border: '#e5e7eb', text: '#6b7280', label: estado }
    }
  }

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
          <Package size={28} /> Mis Pedidos
        </h1>
        {loading ? (
          <div className="space-y-4">
            {[1,2].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse" style={{ height: '120px' }} />
            ))}
          </div>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border shadow-sm" style={{ borderColor: '#e5e7eb' }}>
            <Package size={64} className="mx-auto mb-4" style={{ color: '#d1d5db' }} />
            <p className="text-lg font-semibold" style={{ color: '#374151' }}>No tenés pedidos aún</p>
            <p className="text-sm mt-1 mb-6" style={{ color: '#9ca3af' }}>Tus pedidos aparecerán acá</p>
            <Link href="/" className="px-6 py-3 rounded-xl text-sm font-bold"
              style={{ backgroundColor: '#1a1f6e', color: 'white', boxShadow: '0 4px 15px rgba(26,31,110,0.3)' }}>
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => {
              const estado = getEstadoStyle(pedido.estado)
              return (
                <div key={pedido.id_pedido} className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  style={{ borderColor: '#e5e7eb' }}>
                  <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#f3f4f6', backgroundColor: '#fafbff' }}>
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#1a1f6e' }}>Pedido #{pedido.id_pedido.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
                        {new Date(pedido.created_at).toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-3 py-1 rounded-full border"
                        style={{ backgroundColor: estado.bg, borderColor: estado.border, color: estado.text }}>
                        {estado.label}
                      </span>
                      <span className="font-extrabold text-sm" style={{ color: '#1a1f6e' }}>₡{Number(pedido.precio_total).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {pedido.detalle_pedido?.map((detalle) => (
                      <div key={detalle.id_detalle} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0" style={{ backgroundColor: '#f8faff' }}>
                          {detalle.producto?.imagen ? (
                            <img src={detalle.producto.imagen} alt={detalle.producto.nombre} className="w-full h-full object-cover" />
                          ) : <Package size={18} style={{ color: '#d1d5db' }} />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold" style={{ color: '#111827' }}>{detalle.producto?.nombre}</p>
                          <p className="text-xs" style={{ color: '#9ca3af' }}>{detalle.cantidad} × ₡{Number(detalle.precio_unitario).toLocaleString()}</p>
                        </div>
                        <p className="font-bold text-sm" style={{ color: '#1a1f6e' }}>₡{Number(detalle.cantidad * detalle.precio_unitario).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}