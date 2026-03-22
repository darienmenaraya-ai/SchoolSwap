'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [productos, setProductos] = useState([])
  const [productosFiltrados, setProductosFiltrados] = useState([])
  const [usuario, setUsuario] = useState(null)
  const [esAdmin, setEsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('')
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    async function cargarDatos() {
      const { data: { user } } = await supabase.auth.getUser()
      setUsuario(user)

      if (user) {
        const { data: perfil } = await supabase
          .from('usuario')
          .select('rol')
          .eq('id_usuario', user.id)
          .single()
        setEsAdmin(perfil?.rol === 'administrador')
      }

      const { data: prods } = await supabase
        .from('producto')
        .select('*, categoria(nombre)')
        .eq('estado', 'publicado')
        .order('created_at', { ascending: false })

      const { data: cats } = await supabase
        .from('categoria')
        .select('*')
        .order('nombre')

      setProductos(prods || [])
      setProductosFiltrados(prods || [])
      setCategorias(cats || [])
      setLoading(false)
    }
    cargarDatos()
  }, [])

  useEffect(() => {
    let filtrados = productos

    if (busqueda.trim() !== '') {
      filtrados = filtrados.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
      )
    }

    if (categoriaSeleccionada !== '') {
      filtrados = filtrados.filter(p => p.id_categoria === categoriaSeleccionada)
    }

    setProductosFiltrados(filtrados)
  }, [busqueda, categoriaSeleccionada, productos])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUsuario(null)
    setEsAdmin(false)
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">

      {/* NAVBAR */}
      <nav className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl font-bold text-blue-400">🏫 Marketplace Escolar</h1>
        <div className="flex items-center gap-4">
          {usuario ? (
            <>
              {esAdmin && (
                <Link href="/admin" className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition">
                  ⚙️ Admin
                </Link>
              )}
              <Link href="/productos/nuevo" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                + Publicar
              </Link>
              <Link href="/carrito" className="text-gray-300 hover:text-white text-sm transition">
                🛒 Carrito
              </Link>
              <Link href="/mensajes" className="text-gray-300 hover:text-white text-sm transition">
                💬 Mensajes
              </Link>
              <Link href="/trueque" className="text-gray-300 hover:text-white text-sm transition">
                🔄 Trueques
              </Link>
              <Link href="/pedidos" className="text-gray-300 hover:text-white text-sm transition">
                📦 Mis Pedidos
              </Link>
              <Link href="/perfil" className="text-gray-300 hover:text-white text-sm transition">
                Mi Perfil
              </Link>
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 text-sm transition">
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-300 hover:text-white text-sm transition">
                Iniciar Sesión
              </Link>
              <Link href="/auth/registro" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="px-6 py-20 text-center bg-gradient-to-b from-[#1a1a2e] to-[#0f0f0f]">
        <h2 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Comprá y vendé en tu colegio
        </h2>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
          El marketplace de Cedes Don Bosco. Encontrá útiles, libros, uniformes y más.
        </p>
        {!usuario && (
          <Link href="/auth/registro" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold text-lg transition">
            Empezar ahora
          </Link>
        )}
      </section>

      {/* BÚSQUEDA Y FILTROS */}
      <section className="px-6 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <select
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none sm:w-56"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id_categoria} value={cat.id_categoria}>
                {cat.nombre}
              </option>
            ))}
          </select>
          {(busqueda || categoriaSeleccionada) && (
            <button
              onClick={() => { setBusqueda(''); setCategoriaSeleccionada('') }}
              className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300 px-4 py-3 rounded-xl transition text-sm"
            >
              Limpiar
            </button>
          )}
        </div>
      </section>

      {/* PRODUCTOS */}
      <section className="px-6 pb-12 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-100">
            {busqueda || categoriaSeleccionada ? `${productosFiltrados.length} resultado${productosFiltrados.length !== 1 ? 's' : ''}` : 'Productos publicados'}
          </h3>
        </div>

        {loading ? (
          <p className="text-gray-400">Cargando productos...</p>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-500 text-lg">No se encontraron productos</p>
            <button
              onClick={() => { setBusqueda(''); setCategoriaSeleccionada('') }}
              className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              Ver todos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => (
              <Link href={`/productos/${producto.id_producto}`} key={producto.id_producto}>
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-blue-500 transition cursor-pointer group">
                  <div className="h-48 bg-[#2a2a2a] flex items-center justify-center overflow-hidden">
                    {producto.imagen ? (
                      <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <span className="text-5xl">📦</span>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-blue-400 font-medium">{producto.categoria?.nombre}</span>
                    <h4 className="font-semibold text-white mt-1 truncate">{producto.nombre}</h4>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{producto.descripcion}</p>
                    <p className="text-blue-400 font-bold text-lg mt-3">₡{Number(producto.precio).toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}