'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, Package } from 'lucide-react'

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
      if (!user) { router.push('/auth/login'); return }
      setUsuario(user)
      const productoId = searchParams.get('producto')
      const vendedorId = searchParams.get('vendedor')
      if (!productoId || !vendedorId) { router.push('/'); return }
      const { data: prod } = await supabase.from('producto')
        .select('*, categoria(nombre), usuario(nombre, apellido)').eq('id_producto', productoId).single()
      setProductoSolicitado(prod)
      const { data: misProd } = await supabase.from('producto')
        .select('*').eq('id_usuario', user.id).eq('estado', 'publicado')
      setMisProductos(misProd || [])
      setLoading(false)
    }
    cargarDatos()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!productoOfrecido) { setError('Seleccioná un producto para ofrecer'); return }
    setEnviando(true)
    setError('')
    const vendedorId = searchParams.get('vendedor')
    const { error: dbError } = await supabase.from('trueque').insert({
      id_producto_ofrecido: productoOfrecido, id_producto_solicitado: productoSolicitado.id_producto,
      id_usuario_oferta: usuario.id, id_usuario_receptor: vendedorId, estado: 'pendiente',
    })
    if (dbError) { setError(dbError.message); setEnviando(false); return }
    router.push('/trueque')
  }

  if (loading) return <div className="flex items-center justify-center h-96"><p style={{ color: '#6b7280' }}>Cargando...</p></div>

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-extrabold mb-2 flex items-center gap-3" style={{ color: '#1a1f6e' }}>
        <RefreshCw size={28} /> Proponer Trueque
      </h1>
      <p className="mb-8" style={{ color: '#6b7280' }}>Seleccioná uno de tus productos para intercambiar</p>

      {error && (
        <div className="p-3 rounded-lg mb-6 text-sm border" style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#dc2626' }}>{error}</div>
      )}

      <div className="bg-white border rounded-xl p-6 mb-8 shadow-sm" style={{ borderColor: '#e2e6ff' }}>
        <h2 className="text-sm font-bold mb-4" style={{ color: '#1a1f6e' }}>Querés obtener</h2>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#e8eaff' }}>
            {productoSolicitado?.imagen ? (
              <img src={productoSolicitado.imagen} alt={productoSolicitado.nombre} className="w-full h-full object-cover" />
            ) : <Package size={32} style={{ color: '#3b4fd8' }} />}
          </div>
          <div>
            <p className="font-bold text-lg" style={{ color: '#1a1f6e' }}>{productoSolicitado?.nombre}</p>
            <p className="font-bold" style={{ color: '#3b4fd8' }}>₡{Number(productoSolicitado?.precio).toLocaleString()}</p>
            <p className="text-sm" style={{ color: '#6b7280' }}>De: {productoSolicitado?.usuario?.nombre} {productoSolicitado?.usuario?.apellido}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <h2 className="text-sm font-bold mb-4" style={{ color: '#1a1f6e' }}>Ofrecés a cambio</h2>
        {misProductos.length === 0 ? (
          <div className="bg-white border rounded-xl p-8 text-center mb-6 shadow-sm" style={{ borderColor: '#e2e6ff' }}>
            <p className="mb-4" style={{ color: '#6b7280' }}>No tenés productos publicados para ofrecer</p>
            <Link href="/productos/nuevo" className="px-6 py-2 rounded-lg text-sm font-bold" style={{ backgroundColor: '#1a1f6e', color: 'white' }}>
              Publicar un producto
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {misProductos.map((prod) => (
              <div key={prod.id_producto} onClick={() => setProductoOfrecido(prod.id_producto)}
                className="bg-white border-2 rounded-xl p-4 cursor-pointer transition shadow-sm"
                style={{ borderColor: productoOfrecido === prod.id_producto ? '#1a1f6e' : '#e2e6ff' }}>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#e8eaff' }}>
                    {prod.imagen ? (
                      <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover" />
                    ) : <Package size={24} style={{ color: '#3b4fd8' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate" style={{ color: '#1a1f6e' }}>{prod.nombre}</p>
                    <p className="text-sm font-bold" style={{ color: '#3b4fd8' }}>₡{Number(prod.precio).toLocaleString()}</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>Stock: {prod.stock}</p>
                  </div>
                  {productoOfrecido === prod.id_producto && (
                    <span className="text-lg font-bold" style={{ color: '#1a1f6e' }}>✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {misProductos.length > 0 && (
          <button type="submit" disabled={enviando || !productoOfrecido}
            className="w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
            style={{ backgroundColor: productoOfrecido ? '#1a1f6e' : '#e2e6ff', color: productoOfrecido ? 'white' : '#94a3b8' }}>
            <RefreshCw size={18} />
            {enviando ? 'Enviando propuesta...' : 'Enviar propuesta de trueque'}
          </button>
        )}
      </form>
    </div>
  )
}

export default function ProponerTrueque() {
return (
  <main className="min-h-screen" style={{ backgroundColor: '#f0f4ff' }}>
    <nav style={{ backgroundColor: '#1a1f6e', boxShadow: '0 2px 20px rgba(26,31,110,0.3)' }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/">
          <div className="bg-white rounded-xl px-4 py-2 shadow-md">
            <img src="/logo.png" alt="SchoolSwap" style={{ height: '48px', width: 'auto', display: 'block' }} />
          </div>
        </Link>
        <Link href="/" className="flex items-center gap-2 text-sm font-medium text-white hover:opacity-80">
          <ArrowLeft size={16} /> Volver
        </Link>
      </div>
    </nav>

      <Suspense fallback={<div className="flex items-center justify-center h-96"><p style={{ color: '#6b7280' }}>Cargando...</p></div>}>
        <ProponerTruequeContenido />
      </Suspense>
    </main>
  )
}