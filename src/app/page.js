'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ShoppingCart, MessageCircle, Package, User, LogOut, Settings, Plus, Search, RefreshCw, ChevronDown } from 'lucide-react'

export default function Home() {
  const [productos, setProductos] = useState([])
  const [productosFiltrados, setProductosFiltrados] = useState([])
  const [usuario, setUsuario] = useState(null)
  const [esAdmin, setEsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('')
  const [categorias, setCategorias] = useState([])
  const [menuAbierto, setMenuAbierto] = useState(false)

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
    if (busqueda.trim()) {
      filtrados = filtrados.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
      )
    }
    if (categoriaSeleccionada) {
      filtrados = filtrados.filter(p => p.id_categoria === categoriaSeleccionada)
    }
    setProductosFiltrados(filtrados)
  }, [busqueda, categoriaSeleccionada, productos])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUsuario(null)
    setEsAdmin(false)
    window.location.href = '/'
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#f0f4ff' }}>

      {/* NAVBAR */}
      <nav style={{ backgroundColor: '#1a1f6e', boxShadow: '0 2px 20px rgba(26,31,110,0.3)' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between">
          <Link href="/">
            <div className="bg-white rounded-xl px-3 py-1 shadow-md hover:shadow-lg transition-shadow">
              <img src="/logo.png" alt="SchoolSwap" style={{ height: '80px', width: 'auto', display: 'block' }} />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {usuario ? (
              <>
                {esAdmin && (
                  <Link href="/admin" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-90"
                    style={{ backgroundColor: '#f59e0b', color: '#1a1f00' }}>
                    <Settings size={14} /> Admin
                  </Link>
                )}
                <Link href="/productos/nuevo" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-90"
                  style={{ backgroundColor: '#3b4fd8', color: 'white' }}>
                  <Plus size={14} /> Publicar
                </Link>
                <Link href="/carrito" className="flex items-center gap-1.5 text-white hover:bg-white hover:bg-opacity-10 text-xs font-medium transition-all px-3 py-2 rounded-lg">
                  <ShoppingCart size={16} /> Carrito
                </Link>
                <Link href="/mensajes" className="flex items-center gap-1.5 text-white hover:bg-white hover:bg-opacity-10 text-xs font-medium transition-all px-3 py-2 rounded-lg">
                  <MessageCircle size={16} /> Mensajes
                </Link>
                <Link href="/trueque" className="flex items-center gap-1.5 text-white hover:bg-white hover:bg-opacity-10 text-xs font-medium transition-all px-3 py-2 rounded-lg">
                  <RefreshCw size={16} /> Trueques
                </Link>
                <Link href="/pedidos" className="flex items-center gap-1.5 text-white hover:bg-white hover:bg-opacity-10 text-xs font-medium transition-all px-3 py-2 rounded-lg">
                  <Package size={16} /> Pedidos
                </Link>
                <Link href="/perfil" className="flex items-center gap-1.5 text-white hover:bg-white hover:bg-opacity-10 text-xs font-medium transition-all px-3 py-2 rounded-lg">
                  <User size={16} /> Perfil
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-white hover:bg-red-500 hover:bg-opacity-20 text-xs font-medium transition-all px-3 py-2 rounded-lg">
                  <LogOut size={16} /> Salir
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-white hover:bg-white hover:bg-opacity-10 text-sm font-medium transition-all px-4 py-2 rounded-lg">
                  Iniciar Sesión
                </Link>
                <Link href="/auth/registro" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:opacity-90"
                  style={{ backgroundColor: '#3b4fd8', color: 'white' }}>
                  Registrarse
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden text-white p-2" onClick={() => setMenuAbierto(!menuAbierto)}>
            <ChevronDown size={20} />
          </button>
        </div>

        {menuAbierto && (
          <div className="md:hidden border-t px-4 py-3 space-y-2" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: '#1a1f6e' }}>
            {usuario ? (
              <>
                <Link href="/productos/nuevo" className="flex items-center gap-2 text-white text-sm py-2" onClick={() => setMenuAbierto(false)}>
                  <Plus size={16} /> Publicar
                </Link>
                <Link href="/carrito" className="flex items-center gap-2 text-white text-sm py-2" onClick={() => setMenuAbierto(false)}>
                  <ShoppingCart size={16} /> Carrito
                </Link>
                <Link href="/mensajes" className="flex items-center gap-2 text-white text-sm py-2" onClick={() => setMenuAbierto(false)}>
                  <MessageCircle size={16} /> Mensajes
                </Link>
                <Link href="/trueque" className="flex items-center gap-2 text-white text-sm py-2" onClick={() => setMenuAbierto(false)}>
                  <RefreshCw size={16} /> Trueques
                </Link>
                <Link href="/pedidos" className="flex items-center gap-2 text-white text-sm py-2" onClick={() => setMenuAbierto(false)}>
                  <Package size={16} /> Pedidos
                </Link>
                <Link href="/perfil" className="flex items-center gap-2 text-white text-sm py-2" onClick={() => setMenuAbierto(false)}>
                  <User size={16} /> Perfil
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-300 text-sm py-2">
                  <LogOut size={16} /> Salir
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="flex text-white text-sm py-2" onClick={() => setMenuAbierto(false)}>Iniciar Sesión</Link>
                <Link href="/auth/registro" className="flex text-white text-sm py-2 font-bold" onClick={() => setMenuAbierto(false)}>Registrarse</Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section
        style={{
          backgroundImage: 'url(/colegio.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '520px',
        }}
        className="px-4 sm:px-6 py-16 sm:py-24 flex items-center justify-center"
      >
        <div className="max-w-4xl mx-auto text-center">

          {/* LOGO EN CUADRO BLANCO GRANDE */}
          <div
            className="inline-flex items-center justify-center mb-8 shadow-2xl"
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '24px 48px',
              width: '420px',
              maxWidth: '90vw',
            }}
          >
            <img
              src="/logo.png"
              alt="SchoolSwap"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-tight"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
            El marketplace de<br />
            <span style={{ color: '#a5b4fc' }}>Cedes Don Bosco</span>
          </h1>
          <p className="text-base sm:text-lg mb-8 max-w-xl mx-auto font-medium"
            style={{ color: 'white', textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
            Comprá, vendé e intercambiá útiles, libros, uniformes y más con tus compañeros.
          </p>
          {!usuario ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/registro"
                className="px-8 py-3 rounded-xl font-bold text-base transition-all hover:opacity-90 shadow-lg"
                style={{ backgroundColor: 'white', color: '#1a1f6e' }}>
                Empezar gratis
              </Link>
              <Link href="/auth/login"
                className="px-8 py-3 rounded-xl font-bold text-base transition-all border-2 border-white text-white"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                Iniciar sesión
              </Link>
            </div>
          ) : (
            <Link href="/productos/nuevo"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-base transition-all hover:opacity-90 shadow-lg"
              style={{ backgroundColor: 'white', color: '#1a1f6e' }}>
              <Plus size={18} /> Publicar producto
            </Link>
          )}
        </div>
      </section>

      {/* STATS BAR */}
      <div className="bg-white border-b shadow-sm" style={{ borderColor: '#e5e7eb' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap gap-6 justify-center sm:justify-start">
          <div className="flex items-center gap-2 text-sm" style={{ color: '#6b7280' }}>
            <Package size={16} style={{ color: '#3b4fd8' }} />
            <span><strong style={{ color: '#1a1f6e' }}>{productos.length}</strong> productos disponibles</span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: '#6b7280' }}>
            <RefreshCw size={16} style={{ color: '#3b4fd8' }} />
            <span>Sistema de <strong style={{ color: '#1a1f6e' }}>trueques</strong> disponible</span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: '#6b7280' }}>
            <MessageCircle size={16} style={{ color: '#3b4fd8' }} />
            <span>Mensajes <strong style={{ color: '#1a1f6e' }}>directos</strong> entre usuarios</span>
          </div>
        </div>
      </div>

      {/* BÚSQUEDA Y FILTROS */}
      <section className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
            <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full rounded-xl pl-11 pr-4 py-3 text-sm border-2 outline-none transition-all"
              style={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#111827' }} />
          </div>
          <select value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            className="rounded-xl px-4 py-3 text-sm border-2 outline-none sm:w-52"
            style={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#111827' }}>
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
            ))}
          </select>
          {(busqueda || categoriaSeleccionada) && (
            <button onClick={() => { setBusqueda(''); setCategoriaSeleccionada('') }}
              className="px-4 py-3 rounded-xl text-sm font-semibold transition-all border-2"
              style={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#6b7280' }}>
              Limpiar
            </button>
          )}
        </div>
      </section>

      {/* PRODUCTOS */}
      <section className="px-4 sm:px-6 pb-16 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: '#1a1f6e' }}>
            {busqueda || categoriaSeleccionada
              ? `${productosFiltrados.length} resultado${productosFiltrados.length !== 1 ? 's' : ''}`
              : 'Productos publicados'}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse" style={{ height: '280px' }}>
                <div style={{ height: '160px', backgroundColor: '#e5e7eb' }} />
                <div className="p-4 space-y-2">
                  <div style={{ height: '12px', backgroundColor: '#e5e7eb', borderRadius: '6px', width: '60%' }} />
                  <div style={{ height: '16px', backgroundColor: '#e5e7eb', borderRadius: '6px' }} />
                  <div style={{ height: '20px', backgroundColor: '#e5e7eb', borderRadius: '6px', width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border" style={{ borderColor: '#e5e7eb' }}>
            <Search size={48} className="mx-auto mb-4" style={{ color: '#d1d5db' }} />
            <p className="text-lg font-semibold" style={{ color: '#374151' }}>No se encontraron productos</p>
            <p className="text-sm mt-1 mb-4" style={{ color: '#9ca3af' }}>Intentá con otros términos de búsqueda</p>
            <button onClick={() => { setBusqueda(''); setCategoriaSeleccionada('') }}
              className="px-6 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ backgroundColor: '#1a1f6e', color: 'white' }}>
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => (
              <Link href={`/productos/${producto.id_producto}`} key={producto.id_producto}>
                <div className="bg-white rounded-2xl overflow-hidden border hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  style={{ borderColor: '#e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div className="h-48 flex items-center justify-center overflow-hidden relative" style={{ backgroundColor: '#f8faff' }}>
                    {producto.imagen ? (
                      <img src={producto.imagen} alt={producto.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <Package size={48} style={{ color: '#d1d5db' }} />
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="text-xs font-bold px-2 py-1 rounded-full"
                        style={{ backgroundColor: '#e8eaff', color: '#3b4fd8' }}>
                        {producto.categoria?.nombre}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold truncate text-sm" style={{ color: '#111827' }}>{producto.nombre}</h3>
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: '#6b7280' }}>{producto.descripcion}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="font-extrabold text-base" style={{ color: '#3b4fd8' }}>
                        ₡{Number(producto.precio).toLocaleString()}
                      </p>
                      <span className="text-xs px-2 py-1 rounded-lg font-medium" style={{ backgroundColor: '#f0f4ff', color: '#1a1f6e' }}>
                        Ver más
                      </span>
                    </div>
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