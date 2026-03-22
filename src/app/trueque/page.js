'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUsuario(user)

      const { data: recibidas } = await supabase
        .from('trueque')
        .select('*, producto_ofrecido:id_producto_ofrecido(nombre, imagen, precio), producto_solicitado:id_producto_solicitado(nombre, imagen, precio), usuario_oferta:id_usuario_oferta(nombre, apellido)')
        .eq('id_usuario_receptor', user.id)
        .order('created_at', { ascending: false })

      const { data: enviadas } = await supabase
        .from('trueque')
        .select('*, producto_ofrecido:id_producto_ofrecido(nombre, imagen, precio), producto_solicitado:id_producto_solicitado(nombre, imagen, precio), usuario_receptor:id_usuario_receptor(nombre, apellido)')
        .eq('id_usuario_oferta', user.id)
        .order('created_at', { ascending: false })

      setPropuestasRecibidas(recibidas || [])
      setPropuestasEnviadas(enviadas || [])
      setLoading(false)
    }
    cargarDatos()
  }, [])

  async function responderTrueque(id_trueque, nuevoEstado) {
    await supabase
      .from('trueque')
      .update({ estado: nuevoEstado })
      .eq('id_trueque', id_trueque)

    setPropuestasRecibidas(propuestasRecibidas.map(t =>
      t.id_trueque === id_trueque ? { ...t, estado: nuevoEstado } : t
    ))

    setMensaje(nuevoEstado === 'aceptado' ? '✅ Trueque aceptado!' : '❌ Trueque rechazado')
    setTimeout(() => setMensaje(''), 3000)
  }

  function getEstadoColor(estado) {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-900/50 border-yellow-500 text-yellow-300'
      case 'aceptado': return 'bg-green-900/50 border-green-500 text-green-300'
      case 'rechazado': return 'bg-red-900/50 border-red-500 text-red-300'
      default: return 'bg-gray-900/50 border-gray-500 text-gray-300'
    }
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <nav className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-400"> Marketplace Cedes Don Bosco</Link>
        <Link href="/" className="text-gray-400 hover:text-white text-sm transition">← Volver</Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">🔄 Trueques</h1>
        <p className="text-gray-400 mb-8">Intercambiá productos sin usar dinero</p>

        {mensaje && (
          <div className={`p-4 rounded-xl mb-6 text-sm border ${mensaje.includes('✅') ? 'bg-green-900/50 border-green-500 text-green-300' : 'bg-red-900/50 border-red-500 text-red-300'}`}>
            {mensaje}
          </div>
        )}

        {loading ? (
          <p className="text-gray-400">Cargando trueques...</p>
        ) : (
          <div className="space-y-12">

            {/* PROPUESTAS RECIBIDAS */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-200">📬 Propuestas recibidas ({propuestasRecibidas.length})</h2>
              {propuestasRecibidas.length === 0 ? (
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 text-center">
                  <p className="text-gray-500">No tenés propuestas de trueque recibidas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {propuestasRecibidas.map((t) => (
                    <div key={t.id_trueque} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-400 text-sm">
                          Propuesta de <span className="text-white font-medium">{t.usuario_oferta?.nombre} {t.usuario_oferta?.apellido}</span>
                        </p>
                        <span className={`text-xs px-3 py-1 rounded-full border ${getEstadoColor(t.estado)}`}>
                          {t.estado.charAt(0).toUpperCase() + t.estado.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 items-center">
                        {/* PRODUCTO OFRECIDO */}
                        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-4 text-center">
                          <p className="text-gray-400 text-xs mb-2">Te ofrecen</p>
                          <div className="w-20 h-20 bg-[#2a2a2a] rounded-lg mx-auto mb-2 overflow-hidden flex items-center justify-center">
                            {t.producto_ofrecido?.imagen ? (
                              <img src={t.producto_ofrecido.imagen} alt={t.producto_ofrecido.nombre} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-3xl">📦</span>
                            )}
                          </div>
                          <p className="text-white text-sm font-medium">{t.producto_ofrecido?.nombre}</p>
                          <p className="text-blue-400 text-xs">₡{Number(t.producto_ofrecido?.precio).toLocaleString()}</p>
                        </div>

                        {/* FLECHA */}
                        <div className="text-center">
                          <p className="text-4xl">🔄</p>
                          <p className="text-gray-500 text-xs mt-1">a cambio de</p>
                        </div>

                        {/* PRODUCTO SOLICITADO */}
                        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-4 text-center">
                          <p className="text-gray-400 text-xs mb-2">Tu producto</p>
                          <div className="w-20 h-20 bg-[#2a2a2a] rounded-lg mx-auto mb-2 overflow-hidden flex items-center justify-center">
                            {t.producto_solicitado?.imagen ? (
                              <img src={t.producto_solicitado.imagen} alt={t.producto_solicitado.nombre} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-3xl">📦</span>
                            )}
                          </div>
                          <p className="text-white text-sm font-medium">{t.producto_solicitado?.nombre}</p>
                          <p className="text-blue-400 text-xs">₡{Number(t.producto_solicitado?.precio).toLocaleString()}</p>
                        </div>
                      </div>

                      {t.estado === 'pendiente' && (
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => responderTrueque(t.id_trueque, 'aceptado')}
                            className="flex-1 bg-green-700 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition"
                          >
                            ✅ Aceptar
                          </button>
                          <button
                            onClick={() => responderTrueque(t.id_trueque, 'rechazado')}
                            className="flex-1 bg-red-900 hover:bg-red-800 text-white py-2 rounded-lg font-medium transition"
                          >
                            ❌ Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PROPUESTAS ENVIADAS */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-200">📤 Propuestas enviadas ({propuestasEnviadas.length})</h2>
              {propuestasEnviadas.length === 0 ? (
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 text-center">
                  <p className="text-gray-500">No has enviado propuestas de trueque aún</p>
                  <Link href="/" className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition text-sm">
                    Ver productos
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {propuestasEnviadas.map((t) => (
                    <div key={t.id_trueque} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-400 text-sm">
                          Enviada a <span className="text-white font-medium">{t.usuario_receptor?.nombre} {t.usuario_receptor?.apellido}</span>
                        </p>
                        <span className={`text-xs px-3 py-1 rounded-full border ${getEstadoColor(t.estado)}`}>
                          {t.estado.charAt(0).toUpperCase() + t.estado.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 items-center">
                        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-4 text-center">
                          <p className="text-gray-400 text-xs mb-2">Ofreciste</p>
                          <div className="w-20 h-20 bg-[#2a2a2a] rounded-lg mx-auto mb-2 overflow-hidden flex items-center justify-center">
                            {t.producto_ofrecido?.imagen ? (
                              <img src={t.producto_ofrecido.imagen} alt={t.producto_ofrecido.nombre} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-3xl">📦</span>
                            )}
                          </div>
                          <p className="text-white text-sm font-medium">{t.producto_ofrecido?.nombre}</p>
                          <p className="text-blue-400 text-xs">₡{Number(t.producto_ofrecido?.precio).toLocaleString()}</p>
                        </div>

                        <div className="text-center">
                          <p className="text-4xl">🔄</p>
                          <p className="text-gray-500 text-xs mt-1">a cambio de</p>
                        </div>

                        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-4 text-center">
                          <p className="text-gray-400 text-xs mb-2">Solicitaste</p>
                          <div className="w-20 h-20 bg-[#2a2a2a] rounded-lg mx-auto mb-2 overflow-hidden flex items-center justify-center">
                            {t.producto_solicitado?.imagen ? (
                              <img src={t.producto_solicitado.imagen} alt={t.producto_solicitado.nombre} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-3xl">📦</span>
                            )}
                          </div>
                          <p className="text-white text-sm font-medium">{t.producto_solicitado?.nombre}</p>
                          <p className="text-blue-400 text-xs">₡{Number(t.producto_solicitado?.precio).toLocaleString()}</p>
                        </div>
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