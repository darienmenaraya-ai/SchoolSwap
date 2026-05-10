'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, MessageCircle } from 'lucide-react'
import { sanitizeText } from '@/lib/security'

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
      if (!user) { router.push('/auth/login'); return }
      setUsuario(user)
      const convs = await cargarConversaciones(user.id)
      const usuarioParam = searchParams.get('usuario')
      if (usuarioParam) {
        const { data: otroUsuario } = await supabase.from('usuario')
          .select('id_usuario, nombre, apellido').eq('id_usuario', usuarioParam).single()
        if (otroUsuario) {
          setUsuarioSeleccionado(otroUsuario)
          await cargarMensajes(user.id, otroUsuario.id_usuario)
          setConversaciones(prev => {
            const yaExiste = prev.find(c => c.usuario.id_usuario === otroUsuario.id_usuario)
            if (yaExiste) return prev
            return [{ usuario: otroUsuario, ultimoMensaje: { contenido: 'Nueva conversación' } }, ...prev]
          })
        }
      }
      setLoading(false)
    }
    cargarDatos()
  }, [])

  useEffect(() => { mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [mensajes])

  async function cargarConversaciones(userId) {
    const { data } = await supabase.from('mensaje')
      .select('*, remitente:id_remitente(id_usuario, nombre, apellido), receptor:id_receptor(id_usuario, nombre, apellido)')
      .or(`id_remitente.eq.${userId},id_receptor.eq.${userId}`)
      .order('created_at', { ascending: false })
    if (!data) return []
    const conversacionesMap = {}
    data.forEach((msg) => {
      const otroUsuario = msg.id_remitente === userId ? msg.receptor : msg.remitente
      if (otroUsuario && !conversacionesMap[otroUsuario.id_usuario]) {
        conversacionesMap[otroUsuario.id_usuario] = { usuario: otroUsuario, ultimoMensaje: msg }
      }
    })
    const convs = Object.values(conversacionesMap)
    setConversaciones(convs)
    return convs
  }

  async function cargarMensajes(userId, otroUsuarioId) {
    const { data } = await supabase.from('mensaje')
      .select('*, remitente:id_remitente(id_usuario, nombre, apellido)')
      .or(`and(id_remitente.eq.${userId},id_receptor.eq.${otroUsuarioId}),and(id_remitente.eq.${otroUsuarioId},id_receptor.eq.${userId})`)
      .order('created_at', { ascending: true })
    setMensajes(data || [])
    await supabase.from('mensaje').update({ leido: true }).eq('id_receptor', userId).eq('id_remitente', otroUsuarioId)
  }

  async function seleccionarConversacion(conv) {
    setUsuarioSeleccionado(conv.usuario)
    const { data: { user } } = await supabase.auth.getUser()
    await cargarMensajes(user.id, conv.usuario.id_usuario)
  }

  async function enviarMensaje(e) {
    e.preventDefault()
    const texto = nuevoMensaje.trim()
    if (!texto || !usuarioSeleccionado || texto.length > 1000) return
    setEnviando(true)
    const { error } = await supabase.from('mensaje').insert({
      contenido: sanitizeText(texto),
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: '#1a1f6e' }}>
        <MessageCircle size={28} /> Mensajes
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
        <div className="bg-white border rounded-2xl overflow-hidden flex flex-col shadow-sm" style={{ borderColor: '#e5e7eb' }}>
          <div className="p-4 border-b" style={{ borderColor: '#f3f4f6', backgroundColor: '#fafbff' }}>
            <h2 className="font-bold text-sm" style={{ color: '#1a1f6e' }}>Conversaciones</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="text-sm p-4" style={{ color: '#9ca3af' }}>Cargando...</p>
            ) : conversaciones.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle size={32} className="mx-auto mb-2" style={{ color: '#d1d5db' }} />
                <p className="text-sm" style={{ color: '#9ca3af' }}>Sin conversaciones aún</p>
              </div>
            ) : (
              conversaciones.map((conv) => (
                <button key={conv.usuario.id_usuario} onClick={() => seleccionarConversacion(conv)}
                  className="w-full p-4 text-left transition-colors border-b hover:bg-gray-50"
                  style={{ borderColor: '#f3f4f6', backgroundColor: usuarioSeleccionado?.id_usuario === conv.usuario.id_usuario ? '#f0f4ff' : 'white' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-sm"
                      style={{ backgroundColor: '#1a1f6e' }}>
                      {conv.usuario.nombre?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: '#111827' }}>
                        {conv.usuario.nombre} {conv.usuario.apellido}
                      </p>
                      <p className="text-xs truncate" style={{ color: '#9ca3af' }}>{conv.ultimoMensaje.contenido}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
        <div className="md:col-span-2 bg-white border rounded-2xl overflow-hidden flex flex-col shadow-sm" style={{ borderColor: '#e5e7eb' }}>
          {!usuarioSeleccionado ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle size={48} className="mx-auto mb-3" style={{ color: '#d1d5db' }} />
                <p className="font-medium" style={{ color: '#6b7280' }}>Seleccioná una conversación</p>
                <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>para empezar a chatear</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: '#f3f4f6', backgroundColor: '#fafbff' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
                  style={{ backgroundColor: '#1a1f6e' }}>
                  {usuarioSeleccionado.nombre?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#111827' }}>{usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}</p>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>En línea</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundColor: '#fafbff' }}>
                {mensajes.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm" style={{ color: '#9ca3af' }}>Enviá un mensaje para iniciar</p>
                  </div>
                ) : (
                  mensajes.map((msg) => {
                    const esMio = msg.id_remitente === usuario?.id
                    return (
                      <div key={msg.id_mensaje} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-xs lg:max-w-md px-4 py-2.5 text-sm"
                          style={{ backgroundColor: esMio ? '#1a1f6e' : 'white', color: esMio ? 'white' : '#111827', borderRadius: esMio ? '18px 18px 4px 18px' : '18px 18px 18px 4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: esMio ? 'none' : '1px solid #e5e7eb' }}>
                          <p>{msg.contenido}</p>
                          <p className="text-xs mt-1" style={{ color: esMio ? '#a5b4fc' : '#9ca3af' }}>
                            {new Date(msg.created_at).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={mensajesEndRef} />
              </div>
              <form onSubmit={enviarMensaje} className="p-4 border-t flex gap-3 items-center" style={{ borderColor: '#e5e7eb' }}>
                <input type="text" value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value.slice(0, 1000))}
                  placeholder="Escribí un mensaje..."
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm border-2 outline-none transition-all"
                  style={{ borderColor: '#e5e7eb', color: '#111827', backgroundColor: '#fafafa' }}
                  maxLength={1000} />
                <button type="submit" disabled={enviando || !nuevoMensaje.trim()}
                  className="px-4 py-2.5 rounded-xl transition-all flex items-center justify-center"
                  style={{ backgroundColor: nuevoMensaje.trim() ? '#1a1f6e' : '#e5e7eb', color: nuevoMensaje.trim() ? 'white' : '#9ca3af', cursor: (enviando || !nuevoMensaje.trim()) ? 'not-allowed' : 'pointer' }}>
                  <Send size={16} />
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
      <Suspense fallback={<div className="flex items-center justify-center h-96"><p style={{ color: '#6b7280' }}>Cargando...</p></div>}>
        <MensajesContenido />
      </Suspense>
    </main>
  )
}