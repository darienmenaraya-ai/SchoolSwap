'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, Package, Sun, Moon, Globe } from 'lucide-react'
import { useApp } from '@/lib/context'

function ProponerTruequeContenido() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, cambiarIdioma, cambiarTema, idioma, tema } = useApp()
  const [usuario, setUsuario] = useState(null)
  const [productoSolicitado, setProductoSolicitado] = useState(null)
  const [misProductos, setMisProductos] = useState([])
  const [productoOfrecido, setProductoOfrecido] = useState('')
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargarDatos() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUsuario(user)
      const productoId = searchParams.get('producto')
      const vendedorId = searchParams.get('vendedor')
      if (!productoId || !vendedorId) { router.push('/'); return }
      const { data: prod } = await supabase.from('producto').select('*, categoria(nombre), usuario(nombre, apellido)').eq('id_producto', productoId).single()
      setProductoSolicitado(prod)
      const { data: misProd } = await supabase.from('producto').select('*').eq('id_usuario', user.id).eq('estado', 'publicado')
      setMisProductos(misProd || [])
      setLoading(false)
    }
    cargarDatos()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!productoOfrecido) { setError(t('trades', 'selectProduct')); return }
    setEnviando(true)
    setError('')
    const vendedorId = searchParams.get('vendedor')
    const { error: dbError } = await supabase.from('trueque').insert({ id_producto_ofrecido: productoOfrecido, id_producto_solicitado: productoSolicitado.id_producto, id_usuario_oferta: usuario.id, id_usuario_receptor: vendedorId, estado: 'pendiente' })
    if (dbError) { setError(dbError.message); setEnviando(false); return }
    router.push('/trueque')
  }

  if (loading) return <div className="flex items-center justify-center h-96"><p style={{ color: 'var(--texto-suave)' }}>{t('common', 'loading')}</p></div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="rounded-3xl shadow-xl p-8 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-3" style={{ color: 'var(--azul)' }}><RefreshCw size={24} /> {t('trades', 'propose')}</h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--texto-suave)' }}>{t('trades', 'proposeDesc')}</p>
        {error && <div className="p-3 rounded-xl mb-4 text-sm" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>{error}</div>}
        <div className="border rounded-2xl p-5 mb-6" style={{ backgroundColor: tema === 'oscuro' ? '#252840' : '#f8faff', borderColor: 'var(--borde)' }}>
          <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--azul)' }}>{t('trades', 'wantToGet')}</h2>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--azul-claro)' }}>
              {productoSolicitado?.imagen ? <img src={productoSolicitado.imagen} alt={productoSolicitado.nombre} className="w-full h-full object-cover" /> : <Package size={32} style={{ color: 'var(--azul-medio)' }} />}
            </div>
            <div>
              <p className="font-bold text-lg" style={{ color: 'var(--texto-principal)' }}>{productoSolicitado?.nombre}</p>
              <p className="font-bold text-sm" style={{ color: 'var(--azul-medio)' }}>₡{Number(productoSolicitado?.precio).toLocaleString()}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--texto-suave)' }}>{idioma === 'es' ? 'De:' : 'From:'} {productoSolicitado?.usuario?.nombre} {productoSolicitado?.usuario?.apellido}</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--azul)' }}>{t('trades', 'offerInReturn')}</h2>
          {misProductos.length === 0 ? (
            <div className="border rounded-2xl p-8 text-center mb-6" style={{ borderColor: 'var(--borde)', backgroundColor: tema === 'oscuro' ? '#252840' : '#f9fafb' }}>
              <Package size={40} className="mx-auto mb-3" style={{ color: 'var(--borde)' }} />
              <p className="mb-4 text-sm" style={{ color: 'var(--texto-suave)' }}>{t('trades', 'noProducts')}</p>
              <Link href="/productos/nuevo" className="px-6 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor: 'var(--azul)', color: 'white' }}>{t('trades', 'publishProduct')}</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {misProductos.map((prod) => (
                <div key={prod.id_producto} onClick={() => setProductoOfrecido(prod.id_producto)} className="border-2 rounded-2xl p-4 cursor-pointer transition-all shadow-sm" style={{ borderColor: productoOfrecido === prod.id_producto ? 'var(--azul)' : 'var(--borde)', backgroundColor: productoOfrecido === prod.id_producto ? 'var(--azul-claro)' : 'var(--bg-card)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--azul-claro)' }}>
                      {prod.imagen ? <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover" /> : <Package size={22} style={{ color: 'var(--azul-medio)' }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: 'var(--texto-principal)' }}>{prod.nombre}</p>
                      <p className="text-xs font-bold" style={{ color: 'var(--azul-medio)' }}>₡{Number(prod.precio).toLocaleString()}</p>
                      <p className="text-xs" style={{ color: 'var(--texto-suave)' }}>{idioma === 'es' ? 'Stock:' : 'Stock:'} {prod.stock}</p>
                    </div>
                    {productoOfrecido === prod.id_producto && <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--azul)' }}><span className="text-white text-xs font-bold">✓</span></div>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {misProductos.length > 0 && (
            <button type="submit" disabled={enviando || !productoOfrecido} className="w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2" style={{ backgroundColor: productoOfrecido ? 'var(--azul)' : 'var(--borde)', color: productoOfrecido ? 'white' : 'var(--texto-suave)', cursor: productoOfrecido ? 'pointer' : 'not-allowed', boxShadow: productoOfrecido ? '0 4px 15px rgba(26,31,110,0.3)' : 'none' }}>
              <RefreshCw size={16} />
              {enviando ? t('trades', 'sending') : t('trades', 'sendProposal')}
            </button>
          )}
        </form>
      </div>
    </div>
  )
}

export default function ProponerTrueque() {
  const { cambiarIdioma, cambiarTema, idioma, tema, t } = useApp()
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
      <Suspense fallback={<div className="flex items-center justify-center h-96"><p style={{ color: 'var(--texto-suave)' }}>Cargando...</p></div>}>
        <ProponerTruequeContenido />
      </Suspense>
    </main>
  )
}