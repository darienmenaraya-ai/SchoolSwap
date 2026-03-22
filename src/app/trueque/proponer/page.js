'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ProponerTruequeContenido() {
  const router = useRouter()
  const searchParams = useSearchParams()
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
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUsuario(user)

      const productoId = searchParams.get('producto')
      const vendedorId = searchParams.get('vendedor')

      if (!productoId || !vendedorId) {
        router.push('/')
        return
      }

      const { data: prod } = await supabase
        .from('producto')
        .select('*, categoria(nombre), usuario(nombre, apellido)')
        .eq('id_producto', productoId)
        .single()

      setProductoSolicitado(prod)

      const { data: misProd } = await supabase
        .from('producto')
        .select('*')
        .eq('id_usuario', user.id)
        .eq('estado', 'publicado')

      setMisProductos(misProd || [])
      setLoading(false)
    }
    cargarDatos()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!productoOfrecido) {
      setError('Seleccioná un producto para ofrecer')
      return
    }

    setEnviando(true)
    setError('')

    const vendedorId = searchParams.get('vendedor')

    const { error: dbError } = await supabase.from('trueque').insert({
      id_producto_ofrecido: productoOfrecido,
      id_producto_solicitado: productoSolicitado.id_producto,
      id_usuario_oferta: usuario.id,
      id_usuario_receptor: vendedorId,
      estado: 'pendiente',
    })

    if (dbError) {
      setError(dbError.message)
      setEnviando(false)
      return
    }

    router.push('/trueque')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-400">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">🔄 Proponer Trueque</h1>
      <p className="text-gray-400 mb-8">Seleccioná uno de tus productos para intercambiar</p>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {/* PRODUCTO SOLICITADO */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-300 mb-4">Querés obtener</h2>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-[#2a2a2a] rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
            {productoSolicitado?.imagen ? (
              <img src={productoSolicitado.imagen} alt={productoSolicitado.nombre} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">📦</span>
            )}
          </div>
          <div>
            <p className="text-white font-semibold text-lg">{productoSolicitado?.nombre}</p>
            <p className="text-blue-400 font-bold">₡{Number(productoSolicitado?.precio).toLocaleString()}</p>
            <p className="text-gray-400 text-sm">De: {productoSolicitado?.usuario?.nombre} {productoSolicitado?.usuario?.apellido}</p>
          </div>
        </div>
      </div>

      {/* MIS PRODUCTOS */}
      <form onSubmit={handleSubmit}>
        <h2 className="text-lg font-semibold text-gray-300 mb-4">Ofrecés a cambio</h2>

        {misProductos.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 text-center mb-6">
            <p className="text-gray-500 mb-4">No tenés productos publicados para ofrecer</p>
            <Link href="/productos/nuevo" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition text-sm">
              Publicar un producto
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {misProductos.map((prod) => (
              <div
                key={prod.id_producto}
                onClick={() => setProductoOfrecido(prod.id_producto)}
                className={`bg-[#1a1a1a] border-2 rounded-xl p-4 cursor-pointer transition ${productoOfrecido === prod.id_producto ? 'border-yellow-500' : 'border-[#2a2a2a] hover:border-[#3a3a3a]'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-[#2a2a2a] rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                    {prod.imagen ? (
                      <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{prod.nombre}</p>
                    <p className="text-blue-400 text-sm">₡{Number(prod.precio).toLocaleString()}</p>
                    <p className="text-gray-500 text-xs">Stock: {prod.stock}</p>
                  </div>
                  {productoOfrecido === prod.id_producto && (
                    <span className="text-yellow-400 text-xl">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {misProductos.length > 0 && (
          <button
            type="submit"
            disabled={enviando || !productoOfrecido}
            className="w-full bg-yellow-700 hover:bg-yellow-600 disabled:bg-gray-700 disabled:text-gray-500 text-white py-3 rounded-xl font-semibold text-lg transition"
          >
            {enviando ? 'Enviando propuesta...' : '🔄 Enviar propuesta de trueque'}
          </button>
        )}
      </form>
    </div>
  )
}

export default function ProponerTrueque() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <nav className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-400"> Marketplace Cedes Don Bosco</Link>
        <Link href="/" className="text-gray-400 hover:text-white text-sm transition">← Volver</Link>
      </nav>
      <Suspense fallback={<div className="flex items-center justify-center h-96"><p className="text-gray-400">Cargando...</p></div>}>
        <ProponerTruequeContenido />
      </Suspense>
    </main>
  )
}