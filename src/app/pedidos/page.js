'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Sun, Moon, Globe } from 'lucide-react'
import { useApp } from '@/lib/context'

export default function Pedidos() {
  const router = useRouter()
  const { t, cambiarIdioma, cambiarTema, idioma, tema } = useApp()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarPedidos() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('pedido').select('*, detalle_pedido(*, producto(nombre, imagen, precio))').eq('id_usuario', user.id).order('created_at', { ascending: false })
      setPedidos(data || [])
      setLoading(false)
    }
    cargarPedidos()
  }, [])

  function getEstadoStyle(estado) {
    switch (estado) {
      case 'pendiente': return { bg: '#fefce8', border: '#fde047', text: '#854d0e', label: t('orders', 'pending') }
      case 'procesando': return { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', label: t('orders', 'processing') }
      case 'completado': return { bg: '#f0fdf4', border: '#86efac', text: '#166534', label: t('orders', 'completed') }
      case 'cancelado': return { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626', label: t('orders', 'cancelled') }
      default: return { bg: '#f9fafb', border: '#e5e7eb', text: '#6b7280', label: estado }
    }
  }

  function ProgresoPedido({ estado }) {
    const pasos = [
      { id: 'pendiente', label: t('orders', 'pending') },
      { id: 'procesando', label: t('orders', 'processing') },
      { id: 'completado', label: t('orders', 'completed') },
    ]
    const actual = estado === 'cancelado' ? -1 : pasos.findIndex(p => p.id === estado)
    return (
      <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--borde)' }}>
        {estado === 'cancelado' ? (
          <p className="text-xs font-semibold" style={{ color: '#dc2626' }}>{t('orders', 'cancelled')}</p>
        ) : (
          <div className="flex items-start">
            {pasos.map((paso, index) => (
              <div key={paso.id} className="flex-1 flex items-start last:flex-none">
                <div className="flex flex-col items-center min-w-[54px]">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: index <= actual ? 'var(--azul)' : 'var(--borde)', color: index <= actual ? 'white' : 'var(--texto-suave)' }}>{index + 1}</span>
                  <span className="text-[10px] sm:text-xs text-center mt-1 leading-tight" style={{ color: index <= actual ? 'var(--azul)' : 'var(--texto-suave)' }}>{paso.label}</span>
                </div>
                {index < pasos.length - 1 && <span className="h-1 flex-1 mt-3 mx-1 rounded-full" style={{ backgroundColor: index < actual ? 'var(--azul)' : 'var(--borde)' }} />}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <main style={{ backgroundColor: 'var(--bg-principal)', minHeight: '100vh' }}>
      <nav style={{ backgroundColor: 'var(--bg-nav)', boxShadow: '0 2px 20px rgba(26,31,110,0.3)' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between">
          <Link href="/"><div className="bg-white rounded-xl px-3 py-1 shadow-md"><img src="/logo.png" alt="SchoolSwap" style={{ height: '80px', width: 'auto', display: 'block' }} /></div></Link>
          <div className="flex items-center gap-2">
            <button onClick={cambiarIdioma} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-white text-xs font-bold border border-white border-opacity-30"><Globe size={13} /> {idioma === 'es' ? 'EN' : 'ES'}</button>
            <button onClick={cambiarTema} className="p-1.5 rounded-lg text-white border border-white border-opacity-30">{tema === 'claro' ? <Moon size={15} /> : <Sun size={15} />}</button>
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-white hover:opacity-80"><ArrowLeft size={16} /> {t('common', 'back')}</Link>
          </div>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--azul)' }}><Package size={28} /> {t('orders', 'title')}</h1>
        {loading ? (
          <div className="space-y-4">{[1,2].map(i => <div key={i} className="rounded-2xl p-6 animate-pulse" style={{ height: '120px', backgroundColor: 'var(--bg-card)' }} />)}</div>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
            <Package size={64} className="mx-auto mb-4" style={{ color: 'var(--borde)' }} />
            <p className="text-lg font-semibold" style={{ color: 'var(--texto-principal)' }}>{t('orders', 'empty')}</p>
            <p className="text-sm mt-1 mb-6" style={{ color: 'var(--texto-suave)' }}>{t('orders', 'emptyDesc')}</p>
            <Link href="/" className="px-6 py-3 rounded-xl text-sm font-bold" style={{ backgroundColor: 'var(--azul)', color: 'white', boxShadow: '0 4px 15px rgba(26,31,110,0.3)' }}>{t('orders', 'seeProducts')}</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => {
              const estado = getEstadoStyle(pedido.estado)
              return (
                <div key={pedido.id_pedido} className="border rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
                  <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--borde)', backgroundColor: tema === 'oscuro' ? '#252840' : '#fafbff' }}>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--azul)' }}>{t('orders', 'order')} #{pedido.id_pedido.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--texto-suave)' }}>{new Date(pedido.created_at).toLocaleDateString(idioma === 'es' ? 'es-CR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-3 py-1 rounded-full border" style={{ backgroundColor: estado.bg, borderColor: estado.border, color: estado.text }}>{estado.label}</span>
                      <span className="font-extrabold text-sm" style={{ color: 'var(--azul)' }}>₡{Number(pedido.precio_total).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {pedido.detalle_pedido?.map((detalle) => (
                      <div key={detalle.id_detalle} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0" style={{ backgroundColor: tema === 'oscuro' ? '#252840' : '#f8faff' }}>
                          {detalle.producto?.imagen ? <img src={detalle.producto.imagen} alt={detalle.producto.nombre} className="w-full h-full object-cover" /> : <Package size={18} style={{ color: 'var(--borde)' }} />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold" style={{ color: 'var(--texto-principal)' }}>{detalle.producto?.nombre}</p>
                          <p className="text-xs" style={{ color: 'var(--texto-suave)' }}>{detalle.cantidad} × ₡{Number(detalle.precio_unitario).toLocaleString()}</p>
                        </div>
                        <p className="font-bold text-sm" style={{ color: 'var(--azul)' }}>₡{Number(detalle.cantidad * detalle.precio_unitario).toLocaleString()}</p>
                      </div>
                    ))}
                    <ProgresoPedido estado={pedido.estado} />
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
