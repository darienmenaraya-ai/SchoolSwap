'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function DetalleProducto() {
  const router = useRouter()
  const { id } = useParams()
  const [producto, setProducto] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
  const [agregando, setAgregando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    async function cargarDatos() {
      const { data: { user } } = await supabase.auth.getUser()
      setUsuario(user)

      const { data } = await supabase
        .from('producto')
        .select('*, categoria(nombre), usuario(nombre, apellido)')
        .eq('id_producto', id)
        .single()

      setProducto(data)
      setLoading(false)
    }
    cargarDatos()
  }, [id])

  async function agregarAlCarrito() {
    if (!usuario) {
      router.push('/auth/login')
      return
    }

    setAgregando(true)

    let { data: carrito } = await supabase
      .from('carrito')
      .select('*')
      .eq('id_usuario', usuario.id)
      .single()

    if (!carrito) {
      const { data: nuevoCarrito } = await supabase
        .from('carrito')
        .insert({ id_usuario: usuario.id })
        .select()
        .single()
      carrito = nuevoCarrito
    }

    const { data: itemExistente } = await supabase
      .from('carrito_item')
      .select('*')
      .eq('id_carrito', carrito.id_carrito)
      .eq('id_producto', id)
      .single()

    if (itemExistente) {
      await supabase
        .from('carrito_item')
        .update({ cantidad: itemExistente.cantidad + 1 })
        .eq('id_item', itemExistente.id_item)
    } else {
      await supabase
        .from('carrito_item')
        .insert({
          id_carrito: carrito.id_carrito,
          id_producto: id,
          cantidad: 1,
        })
    }

    setMensaje('✅ Producto agregado al carrito')
    setTimeout(() => setMensaje(''), 3000)
    setAgregando(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-gray-400">Cargando producto...</p>
      </main>
    )
  }

  if (!producto) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-gray-400">Producto no encontrado.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <nav className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-400">🏫 Marketplace Escolar</Link>
        <Link href="/" className="text-gray-400 hover:text-white text-sm transition">← Volver</Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* IMAGEN */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden h-96 flex items-center justify-center">
            {producto.imagen ? (
              <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
            ) : (
              <span className="text-8xl">📦</span>
            )}
          </div>

          {/* INFO */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-blue-400 text-sm font-medium">{producto.categoria?.nombre}</span>
              <h1 className="text-3xl font-bold text-white mt-2">{producto.nombre}</h1>
              <p className="text-gray-400 mt-4 leading-relaxed">{producto.descripcion}</p>

              <div className="mt-6 space-y-2">
                <p className="text-4xl font-bold text-blue-400">₡{Number(producto.precio).toLocaleString()}</p>
                <p className="text-gray-500 text-sm">Stock disponible: {producto.stock} unidades</p>
                <p className="text-gray-500 text-sm">Vendido por: {producto.usuario?.nombre} {producto.usuario?.apellido}</p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {mensaje && (
                <div className="bg-green-900/50 border border-green-500 text-green-300 p-3 rounded-lg text-sm">
                  {mensaje}
                </div>
              )}

              {usuario?.id !== producto.id_usuario && (
                <div className="space-y-3">
                  <button
                    onClick={agregarAlCarrito}
                    disabled={agregando || producto.stock === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white py-3 rounded-xl font-semibold text-lg transition"
                  >
                    {agregando ? 'Agregando...' : producto.stock === 0 ? 'Sin stock' : '🛒 Agregar al carrito'}
                  </button>
                  <Link
                    href={`/mensajes?usuario=${producto.id_usuario}`}
                    className="w-full bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white py-3 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2"
                  >
                    💬 Contactar vendedor
                  </Link>
                  <Link
                    href={`/trueque/proponer?producto=${producto.id_producto}&vendedor=${producto.id_usuario}`}
                    className="w-full bg-yellow-700 hover:bg-yellow-600 text-white py-3 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2"
                  >
                    🔄 Proponer Trueque
                  </Link>
                </div>
              )}

              {usuario?.id === producto.id_usuario && (
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 rounded-xl text-center text-gray-400 text-sm">
                  Este es tu producto
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}