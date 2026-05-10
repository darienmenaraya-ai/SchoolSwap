'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, Package } from 'lucide-react'

export default function Trueque() {
  const router = useRouter()
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
      const { data: recibidas } = await supabase.from('trueque')
        .select('*, producto_ofrecido:id_producto_ofrecido(nombre, imagen, precio), producto_solicitado:id_producto_solicitado(nombre, imagen, precio), usuario_oferta:id_usuario_oferta(nombre, apellido)')
        .eq('id_usuario_receptor', user.id).order('created_at', { ascending: false })
      const { data: enviadas } = await supabase.from('trueque')
        .select('*, producto_ofrecido:id_producto_ofrecido(nombre, imagen, precio), producto_solicitado:id_producto_solicitado(nombre, imagen, precio), usuario_receptor:id_usuario_receptor(nombre, apellido)')
        .eq('id_usuario_oferta', user.id).order('created_at', { ascending: false })
      setPropuestasRecibidas(recibidas || [])
      setPropuestasEnviadas(enviadas || [])
      setLoading(false)
    }
    cargarDatos()
  }, [])

  async function responderTrueque(id_trueque, nuevoEstado) {
    await supabase.from('trueque').update({ estado: nuevoEstado }).eq('id_trueque', id_trueque)
    setPropuestasRecibidas(propuestasRecibidas.map(t => t.id_trueque === id_trueque ? { ...t, estado: nuevoEstado } : t))
    setMensaje(nuevoEstado === 'aceptado' ? 'Trueque aceptado' : 'Trueque rechazado')
    setTimeout(() => setMensaje(''), 3000)
  }

  function getEstadoStyle(estado) {
    switch (estado) {
      case 'pendiente': return { backgroundColor: '#fefce8', borderColor: '#fde047', color: '#854d0e' }
      case 'aceptado': return { backgroundColor: '#f0fdf4', borderColor: '#86efac', color: '#166534' }
      case 'rechazado': return { backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#dc2626' }
      default: return { backgroundColor: '#f9fafb', borderColor: '#e5e7eb', color: '#6b7280' }
    }
  }

  function ProductoCard({ producto, label }) {
    return (
      <div className="rounded-2xl p-4 text-center border" style={{ backgroundColor: '#f8faff', borderColor: '#e5e7eb' }}>
        <p className="text-xs font-bold mb-2" style={{ color: '#9ca3af' }}>{label}</p>
        <div className="w-20 h-20 rounded-xl mx-auto mb-2 overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#e8eaff' }}>
          {producto?.imagen ? (
            <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
          ) : <Package size={28} style={{ color: '#3b4fd8' }} />}
        </div>
        <p className="text-sm font-bold" style={{ color: '#1a1f6e' }}>{producto?.nombre}</p>
        <p className="text-xs font-bold mt-0.5" style={{ color: '#3b4fd8' }}>₡{Number(producto?.precio).toLocaleString()}</p>
      </div>
    )
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
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-3" style={{ color: '#1a1f6e' }}>
          <RefreshCw size={28} /> Trueques
        </h1>
        <p className="mb-8 text-sm" style={{ color: '#6b7280' }}>Intercambiá productos sin usar dinero</p>
        {mensaje && (
          <div className="p-4 rounded-xl mb-6 text-sm border" style={{ backgroundColor: '#eff6ff', borderColor: '#93c5fd', color: '#1e40af' }}>{mensaje}</div>
        )}
        {loading ? <p style={{ color: '#6b7280' }}>Cargando trueques...</p> : (
          <div className="space-y-12">
            <div>
              <h2 className="text-lg font-bold mb-4" style={{ color: '#1a1f6e' }}>Propuestas recibidas ({propuestasRecibidas.length})</h2>
              {propuestasRecibidas.length === 0 ? (
                <div className="bg-white border rounded-2xl p-8 text-center shadow-sm" style={{ borderColor: '#e5e7eb' }}>
                  <RefreshCw size={40} className="mx-auto mb-3" style={{ color: '#d1d5db' }} />
                  <p style={{ color: '#9ca3af' }}>No tenés propuestas recibidas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {propuestasRecibidas.map((t) => (
                    <div key={t.id_trueque} className="bg-white border rounded-2xl p-6 shadow-sm" style={{ borderColor: '#e5e7eb' }}>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm" style={{ color: '#6b7280' }}>
                          Propuesta de <span className="font-bold" style={{ color: '#1a1f6e' }}>{t.usuario_oferta?.nombre} {t.usuario_oferta?.apellido}</span>
                        </p>
                        <span className="text-xs font-bold px-3 py-1 rounded-full border" style={getEstadoStyle(t.estado)}>
                          {t.estado.charAt(0).toUpperCase() + t.estado.slice(1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 items-center">
                        <ProductoCard producto={t.producto_ofrecido} label="Te ofrecen" />
                        <div className="text-center">
                          <RefreshCw size={28} className="mx-auto" style={{ color: '#3b4fd8' }} />
                          <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>a cambio de</p>
                        </div>
                        <ProductoCard producto={t.producto_solicitado} label="Tu producto" />
                      </div>
                      {t.estado === 'pendiente' && (
                        <div className="flex gap-3 mt-4">
                          <button onClick={() => responderTrueque(t.id_trueque, 'aceptado')}
                            className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all"
                            style={{ backgroundColor: '#1a1f6e', color: 'white', boxShadow: '0 4px 15px rgba(26,31,110,0.3)' }}>
                            Aceptar
                          </button>
                          <button onClick={() => responderTrueque(t.id_trueque, 'rechazado')}
                            className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all border-2"
                            style={{ borderColor: '#fca5a5', color: '#dc2626', backgroundColor: 'white' }}>
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold mb-4" style={{ color: '#1a1f6e' }}>Propuestas enviadas ({propuestasEnviadas.length})</h2>
              {propuestasEnviadas.length === 0 ? (
                <div className="bg-white border rounded-2xl p-8 text-center shadow-sm" style={{ borderColor: '#e5e7eb' }}>
                  <RefreshCw size={40} className="mx-auto mb-3" style={{ color: '#d1d5db' }} />
                  <p style={{ color: '#9ca3af' }}>No has enviado propuestas aún</p>
                  <Link href="/" className="mt-4 inline-block px-6 py-2 rounded-xl text-sm font-bold"
                    style={{ backgroundColor: '#1a1f6e', color: 'white' }}>Ver productos</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {propuestasEnviadas.map((t) => (
                    <div key={t.id_trueque} className="bg-white border rounded-2xl p-6 shadow-sm" style={{ borderColor: '#e5e7eb' }}>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm" style={{ color: '#6b7280' }}>
                          Enviada a <span className="font-bold" style={{ color: '#1a1f6e' }}>{t.usuario_receptor?.nombre} {t.usuario_receptor?.apellido}</span>
                        </p>
                        <span className="text-xs font-bold px-3 py-1 rounded-full border" style={getEstadoStyle(t.estado)}>
                          {t.estado.charAt(0).toUpperCase() + t.estado.slice(1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 items-center">
                        <ProductoCard producto={t.producto_ofrecido} label="Ofreciste" />
                        <div className="text-center">
                          <RefreshCw size={28} className="mx-auto" style={{ color: '#3b4fd8' }} />
                          <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>a cambio de</p>
                        </div>
                        <ProductoCard producto={t.producto_solicitado} label="Solicitaste" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}