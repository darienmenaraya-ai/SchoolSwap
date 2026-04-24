'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ShoppingCart, MessageCircle, Package, User, LogOut, Settings, Plus, Search, RefreshCw } from 'lucide-react'

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
        const { data: perfil } = await supabase.from('usuario').select('rol').eq('id_usuario', user.id).single()
        setEsAdmin(perfil?.rol === 'administrador')
      }
      const { data: prods } = await supabase.from('producto').select('*, categoria(nombre)')
        .eq('estado', 'publicado').order('created_at', { ascending: false })
      const { data: cats } = await supabase.from('categoria').select('*').order('nombre')
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
    <main className="min-h-screen" style={{ backgroundColor: '#f5f7ff' }}>

      {/* NAVBAR */}
      <nav style={{ backgroundColor: '#1a1f6e' }} className="px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <Link href="/">
          <img src="/logo.png" alt="SchoolSwap" className="h-12 w-auto" />
        </Link>
        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              {esAdmin && (
                <Link href="/admin" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition" style={{ backgroundColor: '#3b4fd8', color: 'white' }}>
                  <Settings size={16} /> Admin
                </Link>
              )}
              <Link href="/productos/nuevo" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition" style={{ backgroundColor: '#3b4fd8', color: 'white' }}>
                <Plus size={16} /> Publicar
              </Link>
              <Link href="/carrito" className="flex items-center gap-1.5 text-white hover:opacity-80 text-sm transition px-2 py-2 rounded-lg">
                <ShoppingCart size={18} /><span className="hidden md:inline">Carrito</span>
              </Link>
              <Link href="/mensajes" className="flex items-center gap-1.5 text-white hover:opacity-80 text-sm transition px-2 py-2 rounded-lg">
                <MessageCircle size={18} /><span className="hidden md:inline">Mensajes</span>
              </Link>
              <Link href="/trueque" className="flex items-center gap-1.5 text-white hover:opacity-80 text-sm transition px-2 py-2 rounded-lg">
                <RefreshCw size={18} /><span className="hidden md:inline">Trueques</span>
              </Link>
              <Link href="/pedidos" className="flex items-center gap-1.5 text-white hover:opacity-80 text-sm transition px-2 py-2 rounded-lg">
                <Package size={18} /><span className="hidden md:inline">Pedidos</span>
              </Link>
              <Link href="/perfil" className="flex items-center gap-1.5 text-white hover:opacity-80 text-sm transition px-2 py-2 rounded-lg">
                <User size={18} /><span className="hidden md:inline">Perfil</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-white hover:opacity-80 text-sm transition px-2 py-2 rounded-lg">
                <LogOut size={18} /><span className="hidden md:inline">Salir</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-white hover:opacity-80 text-sm transition px-3 py-2 rounded-lg font-medium">
                Iniciar Sesión
              </Link>
              <Link href="/auth/registro" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition" style={{ backgroundColor: '#3b4fd8', color: 'white' }}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="px-6 py-16 text-center" style={{ background: 'linear-gradient(135deg, #1a1f6e 0%, #3b4fd8 100%)' }}>
        <img src="/logo.png" alt="SchoolSwap" className="h-20 w-auto mx-auto mb-6" />
        <h2 className="text-4xl font-extrabold mb-4 text-white">
          Comprá y vendé en tu colegio
        </h2>
        <p className="text-lg max-w-xl mx-auto mb-8" style={{ color: '#e8eaff' }}>
          El marketplace oficial de Cedes Don Bosco. Encontrá útiles, libros, uniformes y más.
        </p>
        {!usuario && (
          <Link href="/auth/registro" className="inline-block px-8 py-3 rounded-xl font-bold text-lg transition shadow-lg" style={{ backgroundColor: 'white', color: '#1a1f6e' }}>
            Empezar ahora
          </Link>
        )}
      </section>

      {/* BÚSQUEDA Y FILTROS */}
      <section className="px-6 py-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#6b7280' }} />
            <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full rounded-xl pl-11 pr-4 py-3 text-sm border focus:outline-none focus:ring-2"
              style={{ backgroundColor: 'white', borderColor: '#e2e6ff', color: '#1a1f6e' }} />
          </div>
          <select value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            className="rounded-xl px-4 py-3 text-sm border focus:outline-none sm:w-56"
            style={{ backgroundColor: 'white', borderColor: '#e2e6ff', color: '#1a1f6e' }}>
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
            ))}
          </select>
          {(busqueda || categoriaSeleccionada) && (
            <button onClick={() => { setBusqueda(''); setCategoriaSeleccionada('') }}
              className="px-4 py-3 rounded-xl text-sm font-medium transition border"
              style={{ backgroundColor: 'white', borderColor: '#e2e6ff', color: '#6b7280' }}>
              Limpiar
            </button>
          )}
        </div>
      </section>

      {/* PRODUCTOS */}
      <section className="px-6 pb-12 max-w-7xl mx-auto">
        <h3 className="text-xl font-bold mb-6" style={{ color: '#1a1f6e' }}>
          {busqueda || categoriaSeleccionada ? `${productosFiltrados.length} resultado${productosFiltrados.length !== 1 ? 's' : ''}` : 'Productos publicados'}
        </h3>
        {loading ? (
          <p style={{ color: '#6b7280' }}>Cargando productos...</p>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto mb-4" style={{ color: '#6b7280' }} />
            <p className="text-lg" style={{ color: '#6b7280' }}>No se encontraron productos</p>
            <button onClick={() => { setBusqueda(''); setCategoriaSeleccionada('') }}
              className="mt-4 inline-block px-6 py-2 rounded-lg text-sm font-bold transition"
              style={{ backgroundColor: '#1a1f6e', color: 'white' }}>
              Ver todos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => (
              <Link href={`/productos/${producto.id_producto}`} key={producto.id_producto}>
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer border" style={{ borderColor: '#e2e6ff' }}>
                  <div className="h-48 flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#f5f7ff' }}>
                    {producto.imagen ? (
                      <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover hover:scale-105 transition" />
                    ) : (
                      <Package size={48} style={{ color: '#6b7280' }} />
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#e8eaff', color: '#3b4fd8' }}>{producto.categoria?.nombre}</span>
                    <h4 className="font-bold mt-2 truncate" style={{ color: '#1a1f6e' }}>{producto.nombre}</h4>
                    <p className="text-sm mt-1 line-clamp-2" style={{ color: '#6b7280' }}>{producto.descripcion}</p>
                    <p className="font-extrabold text-lg mt-3" style={{ color: '#3b4fd8' }}>₡{Number(producto.precio).toLocaleString()}</p>
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