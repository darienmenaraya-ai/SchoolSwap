'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, ShoppingCart, Trash2, CheckCircle, Sun, Moon, Globe } from 'lucide-react'
import { useApp } from '@/lib/context'

export default function Carrito() {
  const router = useRouter()
  const { t, cambiarIdioma, cambiarTema, idioma, tema } = useApp()
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
      const { data } = await supabase.from('carrito_item').select('*, producto(id_producto, nombre, precio, imagen, stock)').eq('id_carrito', carrito.id_carrito)
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
    const { data: pedido, error: pedidoError } = await supabase.from('pedido').insert({ id_usuario: user.id, precio_total: total, estado: 'pendiente' }).select().single()
    if (pedidoError) { setMensaje({ text: t('cart', 'error'), type: 'error' }); setProcesando(false); return }
    for (const item of items) {
      const { error: detalleError } = await supabase.from('detalle_pedido').insert({ id_pedido: pedido.id_pedido, id_producto: item.producto.id_producto, cantidad: item.cantidad, precio_unitario: item.producto.precio })
      if (detalleError) { setMensaje({ text: t('cart', 'error'), type: 'error' }); setProcesando(false); return }
    }
    const { data: carrito } = await supabase.from('carrito').select('*').eq('id_usuario', user.id).single()
    await supabase.from('carrito_item').delete().eq('id_carrito', carrito.id_carrito)
    setItems([])
    setMensaje({ text: t('cart', 'success'), type: 'success' })
    setTimeout(() => router.push('/pedidos'), 2000)
    setProcesando(false)
  }

  const total = items.reduce((acc, item) => acc + (item.cantidad * item.producto.precio), 0)

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
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--azul)' }}><ShoppingCart size={28} /> {t('cart', 'title')}</h1>
        {mensaje.text && (
          <div className="flex items-center gap-2 p-4 rounded-xl mb-6 text-sm" style={{ backgroundColor: mensaje.type === 'success' ? '#f0fdf4' : '#fef2f2', color: mensaje.type === 'success' ? '#166534' : '#dc2626', border: `1px solid ${mensaje.type === 'success' ? '#86efac' : '#fecaca'}` }}>
            <CheckCircle size={16} /> {mensaje.text}
          </div>
        )}
        {loading ? (
          <div className="space-y-4">{[1,2].map(i => (<div key={i} className="rounded-2xl p-4 animate-pulse flex gap-4" style={{ height: '96px', backgroundColor: 'var(--bg-card)' }}><div style={{ width: '80px', height: '80px', backgroundColor: 'var(--borde)', borderRadius: '12px' }} /><div className="flex-1 space-y-2 pt-2"><div style={{ height: '16px', backgroundColor: 'var(--borde)', borderRadius: '6px', width: '60%' }} /><div style={{ height: '14px', backgroundColor: 'var(--borde)', borderRadius: '6px', width: '30%' }} /></div></div>))}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
            <ShoppingCart size={64} className="mx-auto mb-4" style={{ color: 'var(--borde)' }} />
            <p className="text-lg font-semibold" style={{ color: 'var(--texto-principal)' }}>{t('cart', 'empty')}</p>
            <p className="text-sm mt-1 mb-6" style={{ color: 'var(--texto-suave)' }}>{t('cart', 'emptyDesc')}</p>
            <Link href="/" className="px-6 py-3 rounded-xl text-sm font-bold" style={{ backgroundColor: 'var(--azul)', color: 'white', boxShadow: '0 4px 15px rgba(26,31,110,0.3)' }}>{t('cart', 'seeProducts')}</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id_item} className="border rounded-2xl p-4 flex items-center gap-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
                <div className="w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0" style={{ backgroundColor: tema === 'oscuro' ? '#252840' : '#f8faff' }}>
                  {item.producto.imagen ? <img src={item.producto.imagen} alt={item.producto.nombre} className="w-full h-full object-cover" /> : <Package size={32} style={{ color: 'var(--borde)' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate" style={{ color: 'var(--texto-principal)' }}>{item.producto.nombre}</h3>
                  <p className="font-bold text-sm mt-0.5" style={{ color: 'var(--azul-medio)' }}>₡{Number(item.producto.precio).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => actualizarCantidad(item.id_item, item.cantidad - 1)} className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg border-2" style={{ borderColor: 'var(--borde)', color: 'var(--texto-principal)', backgroundColor: 'var(--bg-card)' }}>−</button>
                  <span className="w-8 text-center font-bold text-sm" style={{ color: 'var(--texto-principal)' }}>{item.cantidad}</span>
                  <button onClick={() => actualizarCantidad(item.id_item, item.cantidad + 1)} className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg border-2" style={{ borderColor: 'var(--borde)', color: 'var(--texto-principal)', backgroundColor: 'var(--bg-card)' }}>+</button>
                </div>
                <p className="font-extrabold text-sm w-24 text-right" style={{ color: 'var(--azul)' }}>₡{Number(item.cantidad * item.producto.precio).toLocaleString()}</p>
                <button onClick={() => eliminarItem(item.id_item)} className="p-2 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={16} style={{ color: 'var(--texto-suave)' }} /></button>
              </div>
            ))}
            <div className="border rounded-3xl p-6 mt-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-base font-semibold" style={{ color: 'var(--texto-suave)' }}>{t('cart', 'total')}</span>
                <span className="text-3xl font-extrabold" style={{ color: 'var(--azul)' }}>₡{Number(total).toLocaleString()}</span>
              </div>
              <button onClick={realizarPedido} disabled={procesando} className="w-full py-3 rounded-xl font-bold text-sm transition-all" style={{ backgroundColor: procesando ? '#6b7280' : 'var(--azul)', color: 'white', cursor: procesando ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(26,31,110,0.3)' }}>
                {procesando ? t('cart', 'processing') : t('cart', 'confirm')}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}