'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function MensajesContenido() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [usuario, setUsuario] = useState(null)
  const [conversaciones, setConversaciones] = useState([])
  const [mensajes, setMensajes] = useState([])
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null)
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const mensajesEndRef = useRef(null)

  useEffect(() => {
    async function cargarDatos() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUsuario(user)

      const convs = await cargarConversaciones(user.id)

      const usuarioParam = searchParams.get('usuario')
      if (usuarioParam) {
        const { data: otroUsuario } = await supabase
          .from('usuario')
          .select('id_usuario, nombre, apellido')
          .eq('id_usuario', usuarioParam)
          .single()

        if (otroUsuario) {
          setUsuarioSeleccionado(otroUsuario)
          await cargarMensajes(user.id, otroUsuario.id_usuario)

          setConversaciones(prev => {
            const yaExiste = prev.find(c => c.usuario.id_usuario === otroUsuario.id_usuario)
            if (yaExiste) return prev
            return [{
              usuario: otroUsuario,
              ultimoMensaje: { contenido: 'Nueva conversación' }
            }, ...prev]
          })
        }
      }

      setLoading(false)
    }
    cargarDatos()
  }, [])

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  async function cargarConversaciones(userId) {
    const { data } = await supabase
      .from('mensaje')
      .select('*, remitente:id_remitente(id_usuario, nombre, apellido), receptor:id_receptor(id_usuario, nombre, apellido)')
      .or(`id_remitente.eq.${userId},id_receptor.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (!data) return []

    const conversacionesMap = {}
    data.forEach((msg) => {
      const otroUsuario = msg.id_remitente === userId ? msg.receptor : msg.remitente
      if (otroUsuario && !conversacionesMap[otroUsuario.id_usuario]) {
        conversacionesMap[otroUsuario.id_usuario] = {
          usuario: otroUsuario,
          ultimoMensaje: msg,
        }
      }
    })

    const convs = Object.values(conversacionesMap)
    setConversaciones(convs)
    return convs
  }

  async function cargarMensajes(userId, otroUsuarioId) {
    const { data } = await supabase
      .from('mensaje')
      .select('*, remitente:id_remitente(id_usuario, nombre, apellido)')
      .or(
        `and(id_remitente.eq.${userId},id_receptor.eq.${otroUsuarioId}),and(id_remitente.eq.${otroUsuarioId},id_receptor.eq.${userId})`
      )
      .order('created_at', { ascending: true })

    setMensajes(data || [])

    await supabase
      .from('mensaje')
      .update({ leido: true })
      .eq('id_receptor', userId)
      .eq('id_remitente', otroUsuarioId)
  }

  async function seleccionarConversacion(conv) {
    setUsuarioSeleccionado(conv.usuario)
    const { data: { user } } = await supabase.auth.getUser()
    await cargarMensajes(user.id, conv.usuario.id_usuario)
  }

  async function enviarMensaje(e) {
    e.preventDefault()
    if (!nuevoMensaje.trim() || !usuarioSeleccionado) return
    setEnviando(true)

    const { error } = await supabase.from('mensaje').insert({
      contenido: nuevoMensaje.trim(),
      id_remitente: usuario.id,
      id_receptor: usuarioSeleccionado.id_usuario,
    })

    if (!error) {
      setNuevoMensaje('')
      await cargarMensajes(usuario.id, usuarioSeleccionado.id_usuario)
      await cargarConversaciones(usuario.id)
    }

    setEnviando(false)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">💬 Mensajes</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">

        {/* LISTA DE CONVERSACIONES */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#2a2a2a]">
            <h2 className="font-semibold text-gray-300">Conversaciones</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="text-gray-500 text-sm p-4">Cargando...</p>
            ) : conversaciones.length === 0 ? (
              <p className="text-gray-500 text-sm p-4 text-center">No tenés conversaciones aún</p>
            ) : (
              conversaciones.map((conv) => (
                <button
                  key={conv.usuario.id_usuario}
                  onClick={() => seleccionarConversacion(conv)}
                  className={`w-full p-4 text-left hover:bg-[#2a2a2a] transition border-b border-[#2a2a2a] ${usuarioSeleccionado?.id_usuario === conv.usuario.id_usuario ? 'bg-[#2a2a2a]' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold">
                        {conv.usuario.nombre?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{conv.usuario.nombre} {conv.usuario.apellido}</p>
                      <p className="text-gray-500 text-xs truncate">{conv.ultimoMensaje.contenido}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* CHAT */}
        <div className="md:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden flex flex-col">
          {!usuarioSeleccionado ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-5xl mb-4">💬</p>
                <p className="text-gray-500">Seleccioná una conversación para chatear</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-[#2a2a2a] flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">
                    {usuarioSeleccionado.nombre?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {mensajes.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-sm">Enviá un mensaje para iniciar la conversación</p>
                  </div>
                ) : (
                  mensajes.map((msg) => {
                    const esMio = msg.id_remitente === usuario?.id
                    return (
                      <div key={msg.id_mensaje} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${esMio ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#2a2a2a] text-gray-200 rounded-bl-none'}`}>
                          <p>{msg.contenido}</p>
                          <p className={`text-xs mt-1 ${esMio ? 'text-blue-200' : 'text-gray-500'}`}>
                            {new Date(msg.created_at).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={mensajesEndRef} />
              </div>

              <form onSubmit={enviarMensaje} className="p-4 border-t border-[#2a2a2a] flex gap-3">
                <input
                  type="text"
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  placeholder="Escribí un mensaje..."
                  className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none text-sm"
                />
                <button
                  type="submit"
                  disabled={enviando || !nuevoMensaje.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-xl transition"
                >
                  {enviando ? '...' : '➤'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Mensajes() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <nav className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-400">🏫 Marketplace Escolar</Link>
        <Link href="/" className="text-gray-400 hover:text-white text-sm transition">← Volver</Link>
      </nav>
      <Suspense fallback={<div className="flex items-center justify-center h-96"><p className="text-gray-400">Cargando...</p></div>}>
        <MensajesContenido />
      </Suspense>
    </main>
  )
}