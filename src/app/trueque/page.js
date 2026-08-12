'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, Package, Sun, Moon, Globe } from 'lucide-react'
import { useApp } from '@/lib/context'

export default function Trueque() {
  const router = useRouter()
  const { t, cambiarIdioma, cambiarTema, idioma, tema, mostrarToast } = useApp()
  const [usuario, setUsuario] = useState(null)
  const [propuestasRecibidas, setPropuestasRecibidas] = useState([])
  const [propuestasEnviadas, setPropuestasEnviadas] = useState([])
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    async function cargarDatos() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUsuario(user)
      const { data: recibidas } = await supabase.from('trueque').select('*, producto_ofrecido:id_producto_ofrecido(nombre, imagen, precio), producto_solicitado:id_producto_solicitado(nombre, imagen, precio), usuario_oferta:id_usuario_oferta(nombre, apellido)').eq('id_usuario_receptor', user.id).order('created_at', { ascending: false })
      const { data: enviadas } = await supabase.from('trueque').select('*, producto_ofrecido:id_producto_ofrecido(nombre, imagen, precio), producto_solicitado:id_producto_solicitado(nombre, imagen, precio), usuario_receptor:id_usuario_receptor(nombre, apellido)').eq('id_usuario_oferta', user.id).order('created_at', { ascending: false })
      setPropuestasRecibidas(recibidas || [])
      setPropuestasEnviadas(enviadas || [])
      setLoading(false)
    }
    cargarDatos()
  }, [])

  async function responderTrueque(id_trueque, nuevoEstado) {
    const { error } = await supabase.rpc('responder_trueque', { p_id_trueque: id_trueque, p_aceptar: nuevoEstado === 'aceptado' })
    if (error) {
      setMensaje(idioma === 'es' ? 'No se pudo responder el trueque porque uno de los productos ya no está disponible.' : 'Unable to respond because one of the products is no longer available.')
      return
    }
    setPropuestasRecibidas(propuestasRecibidas.map(tr => tr.id_trueque === id_trueque ? { ...tr, estado: nuevoEstado } : tr))
    setMensaje(nuevoEstado === 'aceptado' ? t('trades', 'tradeAccepted') : t('trades', 'tradeRejected'))
    mostrarToast(nuevoEstado === 'aceptado' ? t('trades', 'tradeAccepted') : t('trades', 'tradeRejected'))
    setTimeout(() => setMensaje(''), 3000)
  }

  function getEstadoStyle(estado) {
    switch (estado) {
      case 'pendiente': return { backgroundColor: '#fefce8', borderColor: '#fde047', color: '#854d0e', label: t('trades', 'pending') }
      case 'aceptado': return { backgroundColor: '#f0fdf4', borderColor: '#86efac', color: '#166534', label: t('trades', 'accepted') }
      case 'rechazado': return { backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#dc2626', label: t('trades', 'rejected') }
      default: return { backgroundColor: '#f9fafb', borderColor: '#e5e7eb', color: '#6b7280', label: estado }
    }
  }

  function ProgresoTrueque({ estado }) {
    const finalizado = estado === 'aceptado' || estado === 'rechazado'
    return (
      <div className="mt-4 pt-4 border-t flex items-center gap-2" style={{ borderColor: 'var(--borde)' }}>
        <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--azul)' }}>1</span>
        <span className="h-1 flex-1 rounded-full" style={{ backgroundColor: finalizado ? 'var(--azul)' : 'var(--borde)' }} />
        <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: finalizado ? (estado === 'aceptado' ? '#16a34a' : '#dc2626') : 'var(--borde)', color: finalizado ? 'white' : 'var(--texto-suave)' }}>2</span>
        <span className="text-xs font-semibold ml-1" style={{ color: 'var(--texto-suave)' }}>{finalizado ? (estado === 'aceptado' ? t('trades', 'accepted') : t('trades', 'rejected')) : t('trades', 'pending')}</span>
      </div>
    )
  }

  function ProductoCard({ producto, label }) {
    return (
      <div className="rounded-2xl p-4 text-center border" style={{ backgroundColor: tema === 'oscuro' ? '#252840' : '#f8faff', borderColor: 'var(--borde)' }}>
        <p className="text-xs font-bold mb-2" style={{ color: 'var(--texto-suave)' }}>{label}</p>
        <div className="w-20 h-20 rounded-xl mx-auto mb-2 overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'var(--azul-claro)' }}>
          {producto?.imagen ? <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" /> : <Package size={28} style={{ color: 'var(--azul-medio)' }} />}
        </div>
        <p className="text-sm font-bold" style={{ color: 'var(--texto-principal)' }}>{producto?.nombre}</p>
        <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--azul-medio)' }}>₡{Number(producto?.precio).toLocaleString()}</p>
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
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-3" style={{ color: 'var(--azul)' }}><RefreshCw size={28} /> {t('trades', 'title')}</h1>
        <p className="mb-8 text-sm" style={{ color: 'var(--texto-suave)' }}>{t('trades', 'description')}</p>
        {mensaje && <div className="p-4 rounded-xl mb-6 text-sm border" style={{ backgroundColor: '#eff6ff', borderColor: '#93c5fd', color: '#1e40af' }}>{mensaje}</div>}
        {loading ? <p style={{ color: 'var(--texto-suave)' }}>{t('common', 'loading')}</p> : (
          <div className="space-y-12">
            <div>
              <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--azul)' }}>{t('trades', 'received')} ({propuestasRecibidas.length})</h2>
              {propuestasRecibidas.length === 0 ? (
                <div className="border rounded-2xl p-8 text-center shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
                  <RefreshCw size={40} className="mx-auto mb-3" style={{ color: 'var(--borde)' }} />
                  <p style={{ color: 'var(--texto-suave)' }}>{t('trades', 'noReceived')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {propuestasRecibidas.map((tr) => {
                    const estado = getEstadoStyle(tr.estado)
                    return (
                      <div key={tr.id_trueque} className="border rounded-2xl p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm" style={{ color: 'var(--texto-suave)' }}>{t('trades', 'proposedBy')} <span className="font-bold" style={{ color: 'var(--texto-principal)' }}>{tr.usuario_oferta?.nombre} {tr.usuario_oferta?.apellido}</span></p>
                          <span className="text-xs font-bold px-3 py-1 rounded-full border" style={estado}>{estado.label}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 items-center">
                          <ProductoCard producto={tr.producto_ofrecido} label={t('trades', 'theyOffer')} />
                          <div className="text-center"><RefreshCw size={28} className="mx-auto" style={{ color: 'var(--azul-medio)' }} /><p className="text-xs mt-1" style={{ color: 'var(--texto-suave)' }}>{t('trades', 'inExchangeFor')}</p></div>
                          <ProductoCard producto={tr.producto_solicitado} label={t('trades', 'yourProduct')} />
                        </div>
                        <ProgresoTrueque estado={tr.estado} />
                        {tr.estado === 'pendiente' && (
                          <div className="flex gap-3 mt-4">
                            <button onClick={() => responderTrueque(tr.id_trueque, 'aceptado')} className="flex-1 py-2.5 rounded-xl font-bold text-sm" style={{ backgroundColor: 'var(--azul)', color: 'white', boxShadow: '0 4px 15px rgba(26,31,110,0.3)' }}>{t('trades', 'accept')}</button>
                            <button onClick={() => responderTrueque(tr.id_trueque, 'rechazado')} className="flex-1 py-2.5 rounded-xl font-bold text-sm border-2" style={{ borderColor: '#fca5a5', color: '#dc2626', backgroundColor: 'var(--bg-card)' }}>{t('trades', 'reject')}</button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--azul)' }}>{t('trades', 'sent')} ({propuestasEnviadas.length})</h2>
              {propuestasEnviadas.length === 0 ? (
                <div className="border rounded-2xl p-8 text-center shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
                  <RefreshCw size={40} className="mx-auto mb-3" style={{ color: 'var(--borde)' }} />
                  <p style={{ color: 'var(--texto-suave)' }}>{t('trades', 'noSent')}</p>
                  <Link href="/" className="mt-4 inline-block px-6 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor: 'var(--azul)', color: 'white' }}>{t('trades', 'seeProducts')}</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {propuestasEnviadas.map((tr) => {
                    const estado = getEstadoStyle(tr.estado)
                    return (
                      <div key={tr.id_trueque} className="border rounded-2xl p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm" style={{ color: 'var(--texto-suave)' }}>{t('trades', 'sentTo')} <span className="font-bold" style={{ color: 'var(--texto-principal)' }}>{tr.usuario_receptor?.nombre} {tr.usuario_receptor?.apellido}</span></p>
                          <span className="text-xs font-bold px-3 py-1 rounded-full border" style={estado}>{estado.label}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 items-center">
                          <ProductoCard producto={tr.producto_ofrecido} label={t('trades', 'youOffer')} />
                          <div className="text-center"><RefreshCw size={28} className="mx-auto" style={{ color: 'var(--azul-medio)' }} /><p className="text-xs mt-1" style={{ color: 'var(--texto-suave)' }}>{t('trades', 'inExchangeFor')}</p></div>
                          <ProductoCard producto={tr.producto_solicitado} label={t('trades', 'youRequested')} />
                        </div>
                        <ProgresoTrueque estado={tr.estado} />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
