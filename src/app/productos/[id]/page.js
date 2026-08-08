'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, MessageCircle, RefreshCw, Package, CheckCircle, Sun, Moon, Globe } from 'lucide-react'
import { useApp } from '@/lib/context'

export default function DetalleProducto() {
  const router = useRouter()
  const { id } = useParams()
  const { t, cambiarIdioma, cambiarTema, idioma, tema } = useApp()
  const [producto, setProducto] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
  const [agregando, setAgregando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    async function cargarDatos() {
      const { data: { user } } = await supabase.auth.getUser()
      setUsuario(user)
      const { data } = await supabase.from('producto').select('*, categoria(nombre), usuario(nombre, apellido)').eq('id_producto', id).single()
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
      if (!carrito) { const { data: nuevo } = await supabase.from('carrito').insert({ id_usuario: usuario.id }).select().single(); carrito = nuevo }
      const { data: itemExistente } = await supabase.from('carrito_item').select('*').eq('id_carrito', carrito.id_carrito).eq('id_producto', id).single()
      if (itemExistente) { await supabase.from('carrito_item').update({ cantidad: itemExistente.cantidad + 1 }).eq('id_item', itemExistente.id_item) }
      else { await supabase.from('carrito_item').insert({ id_carrito: carrito.id_carrito, id_producto: id, cantidad: 1 }) }
      setMensaje(t('product', 'addedToCart'))
      setTimeout(() => setMensaje(''), 3000)
    } catch { setMensaje(idioma === 'es' ? 'Error al agregar' : 'Error adding') }
    finally { setAgregando(false) }
  }

  if (loading) return <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-principal)' }}><p style={{ color: 'var(--texto-suave)' }}>{t('common', 'loading')}</p></main>
  if (!producto) return <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-principal)' }}><div className="text-center"><Package size={48} style={{ color: 'var(--borde)' }} className="mx-auto mb-2" /><p style={{ color: 'var(--texto-suave)' }}>{idioma === 'es' ? 'Producto no encontrado' : 'Product not found'}</p><Link href="/" className="mt-4 inline-block text-sm font-bold" style={{ color: 'var(--azul-medio)' }}>{idioma === 'es' ? 'Volver al inicio' : 'Back to home'}</Link></div></main>

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="rounded-3xl shadow-xl overflow-hidden border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="h-80 md:h-full flex items-center justify-center" style={{ backgroundColor: tema === 'oscuro' ? '#252840' : '#f8faff', minHeight: '320px' }}>
              {producto.imagen ? <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" /> : <div className="text-center"><Package size={80} style={{ color: 'var(--borde)' }} /><p className="text-sm mt-2" style={{ color: 'var(--texto-suave)' }}>{idioma === 'es' ? 'Sin imagen' : 'No image'}</p></div>}
            </div>
            <div className="p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--azul-claro)', color: 'var(--azul-medio)' }}>{producto.categoria?.nombre}</span>
                  {producto.stock > 0 ? <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: '#f0fdf4', color: '#166534' }}>{t('product', 'inStock')}</span> : <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>{t('product', 'soldOut')}</span>}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold mb-3" style={{ color: 'var(--texto-principal)' }}>{producto.nombre}</h1>
                <p className="leading-relaxed text-sm" style={{ color: 'var(--texto-suave)' }}>{producto.descripcion}</p>
                <div className="mt-6 p-4 rounded-2xl" style={{ backgroundColor: tema === 'oscuro' ? '#252840' : '#f0f4ff' }}>
                  <p className="text-4xl font-extrabold" style={{ color: 'var(--azul)' }}>₡{Number(producto.precio).toLocaleString()}</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--texto-suave)' }}>{producto.stock} {t('product', 'available')}</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--texto-suave)' }}>{t('product', 'soldBy')}: <span className="font-semibold" style={{ color: 'var(--azul)' }}>{producto.usuario?.nombre} {producto.usuario?.apellido}</span></p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {mensaje && <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #86efac' }}><CheckCircle size={16} /> {mensaje}</div>}
                {usuario?.id !== producto.id_usuario ? (
                  <div className="space-y-3">
                    <button onClick={agregarAlCarrito} disabled={agregando || producto.stock === 0} className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all" style={{ backgroundColor: producto.stock === 0 ? 'var(--borde)' : 'var(--azul)', color: producto.stock === 0 ? 'var(--texto-suave)' : 'white', cursor: (agregando || producto.stock === 0) ? 'not-allowed' : 'pointer', boxShadow: producto.stock > 0 ? '0 4px 15px rgba(26,31,110,0.3)' : 'none' }}>
                      <ShoppingCart size={18} />
                      {agregando ? t('product', 'adding') : producto.stock === 0 ? t('product', 'noStock') : t('product', 'addToCart')}
                    </button>
                    <Link href={`/mensajes?usuario=${producto.id_usuario}`} className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all" style={{ borderColor: 'var(--azul)', color: 'var(--azul)', backgroundColor: 'var(--bg-card)' }}>
                      <MessageCircle size={18} /> {t('product', 'contactSeller')}
                    </Link>
                    <Link href={`/trueque/proponer?producto=${producto.id_producto}&vendedor=${producto.id_usuario}`} className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all" style={{ backgroundColor: 'var(--azul-medio)', color: 'white', boxShadow: '0 4px 15px rgba(59,79,216,0.3)' }}>
                      <RefreshCw size={18} /> {t('product', 'proposeTrade')}
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl text-center text-sm border-2" style={{ backgroundColor: tema === 'oscuro' ? '#252840' : '#f0f4ff', borderColor: 'var(--azul-claro)', color: 'var(--azul)' }}>{t('product', 'myProduct')}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}