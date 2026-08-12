'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ShoppingCart, MessageCircle, Package, User, LogOut, Settings, Plus, Search, RefreshCw, ChevronDown, Sun, Moon, Globe } from 'lucide-react'
import { useApp } from '@/lib/context'

export default function Home() {
  const { t, cambiarIdioma, cambiarTema, idioma, tema } = useApp()
  const [productos, setProductos] = useState([])
  const [usuario, setUsuario] = useState(null)
  const [esAdmin, setEsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('')
  const [condicionSeleccionada, setCondicionSeleccionada] = useState('')
  const [categorias, setCategorias] = useState([])
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [precioMin, setPrecioMin] = useState('')
  const [precioMax, setPrecioMax] = useState('')
  const [ordenamiento, setOrdenamiento] = useState('recientes')

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
      setCategorias(cats || [])
      setLoading(false)
    }
    cargarDatos()
  }, [])

  const productosFiltrados = useMemo(() => {
    let filtrados = [...productos]
    if (busqueda.trim()) {
      filtrados = filtrados.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
      )
    }
    if (categoriaSeleccionada) {
      filtrados = filtrados.filter(p => p.id_categoria === categoriaSeleccionada)
    }
    if (condicionSeleccionada) {
      filtrados = filtrados.filter(p => p.condicion === condicionSeleccionada)
    }
    if (precioMin !== '') {
      filtrados = filtrados.filter(p => Number(p.precio) >= Number(precioMin))
    }
    if (precioMax !== '') {
      filtrados = filtrados.filter(p => Number(p.precio) <= Number(precioMax))
    }
    if (ordenamiento === 'precio_asc') {
      filtrados.sort((a, b) => Number(a.precio) - Number(b.precio))
    } else if (ordenamiento === 'precio_desc') {
      filtrados.sort((a, b) => Number(b.precio) - Number(a.precio))
    } else {
      filtrados.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
    return filtrados
  }, [busqueda, categoriaSeleccionada, condicionSeleccionada, precioMin, precioMax, ordenamiento, productos])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUsuario(null)
    setEsAdmin(false)
    window.location.href = '/'
  }

  const hayFiltros = busqueda || categoriaSeleccionada || condicionSeleccionada || precioMin || precioMax || ordenamiento !== 'recientes'

  const estiloNav = { backgroundColor: 'var(--bg-nav)', boxShadow: '0 2px 20px rgba(26,31,110,0.3)' }
  const estiloCard = { backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }
  const estiloInput = { backgroundColor: 'var(--bg-input)', borderColor: 'var(--borde-input)', color: 'var(--texto-principal)' }

  return (
    <main style={{ backgroundColor: 'var(--bg-principal)', minHeight: '100vh' }}>

      {/* NAVBAR */}
      <nav style={estiloNav} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between">
          <Link href="/">
            <div className="bg-white rounded-xl px-3 py-1 shadow-md">
              <img src="/logo.png" alt="SchoolSwap" style={{ height: '80px', width: 'auto', display: 'block' }} />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {usuario ? (
              <>
                {esAdmin && (
                  <Link href="/admin" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: '#f59e0b', color: '#1a1f00' }}>
                    <Settings size={14} /> {t('nav', 'admin')}
                  </Link>
                )}
                <Link href="/productos/nuevo" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: 'var(--azul-medio)', color: 'white' }}>
                  <Plus size={14} /> {t('nav', 'publish')}
                </Link>
                <Link href="/carrito" className="flex items-center gap-1.5 text-white text-xs font-medium px-3 py-2 rounded-lg hover:opacity-80">
                  <ShoppingCart size={16} /> {t('nav', 'cart')}
                </Link>
                <Link href="/mensajes" className="flex items-center gap-1.5 text-white text-xs font-medium px-3 py-2 rounded-lg hover:opacity-80">
                  <MessageCircle size={16} /> {t('nav', 'messages')}
                </Link>
                <Link href="/trueque" className="flex items-center gap-1.5 text-white text-xs font-medium px-3 py-2 rounded-lg hover:opacity-80">
                  <RefreshCw size={16} /> {t('nav', 'trades')}
                </Link>
                <Link href="/pedidos" className="flex items-center gap-1.5 text-white text-xs font-medium px-3 py-2 rounded-lg hover:opacity-80">
                  <Package size={16} /> {t('nav', 'orders')}
                </Link>
                <Link href="/perfil" className="flex items-center gap-1.5 text-white text-xs font-medium px-3 py-2 rounded-lg hover:opacity-80">
                  <User size={16} /> {t('nav', 'profile')}
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-white text-xs font-medium px-3 py-2 rounded-lg hover:opacity-80">
                  <LogOut size={16} /> {t('nav', 'logout')}
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-80">
                  {t('nav', 'login')}
                </Link>
                <Link href="/auth/registro" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold" style={{ backgroundColor: 'var(--azul-medio)', color: 'white' }}>
                  {t('nav', 'register')}
                </Link>
              </>
            )}

            {/* CONTROLES IDIOMA Y TEMA */}
            <button onClick={cambiarIdioma} title="Cambiar idioma"
              className="flex items-center gap-1 px-2 py-2 rounded-lg text-white text-xs font-bold hover:opacity-80 border border-white border-opacity-30">
              <Globe size={15} />
              {idioma === 'es' ? 'EN' : 'ES'}
            </button>
            <button onClick={cambiarTema} title="Cambiar tema"
              className="p-2 rounded-lg text-white hover:opacity-80 border border-white border-opacity-30">
              {tema === 'claro' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>

          <button className="md:hidden text-white p-2" onClick={() => setMenuAbierto(!menuAbierto)}>
            <ChevronDown size={20} />
          </button>
        </div>

        {menuAbierto && (
          <div className="md:hidden border-t px-4 py-3 space-y-2" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'var(--bg-nav)' }}>
            {usuario ? (
              <>
                <Link href="/productos/nuevo" className="flex items-center gap-2 text-white text-sm py-2" onClick={() => setMenuAbierto(false)}>
                  <Plus size={16} /> {t('nav', 'publish')}
                </Link>
                <Link href="/carrito" className="flex items-center gap-2 text-white text-sm py-2" onClick={() => setMenuAbierto(false)}>
                  <ShoppingCart size={16} /> {t('nav', 'cart')}
                </Link>
                <Link href="/mensajes" className="flex items-center gap-2 text-white text-sm py-2" onClick={() => setMenuAbierto(false)}>
                  <MessageCircle size={16} /> {t('nav', 'messages')}
                </Link>
                <Link href="/trueque" className="flex items-center gap-2 text-white text-sm py-2" onClick={() => setMenuAbierto(false)}>
                  <RefreshCw size={16} /> {t('nav', 'trades')}
                </Link>
                <Link href="/pedidos" className="flex items-center gap-2 text-white text-sm py-2" onClick={() => setMenuAbierto(false)}>
                  <Package size={16} /> {t('nav', 'orders')}
                </Link>
                <Link href="/perfil" className="flex items-center gap-2 text-white text-sm py-2" onClick={() => setMenuAbierto(false)}>
                  <User size={16} /> {t('nav', 'profile')}
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-300 text-sm py-2">
                  <LogOut size={16} /> {t('nav', 'logout')}
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="flex text-white text-sm py-2" onClick={() => setMenuAbierto(false)}>{t('nav', 'login')}</Link>
                <Link href="/auth/registro" className="flex text-white text-sm py-2 font-bold" onClick={() => setMenuAbierto(false)}>{t('nav', 'register')}</Link>
              </>
            )}
            <div className="flex gap-3 pt-2 border-t border-white border-opacity-20">
              <button onClick={cambiarIdioma} className="flex items-center gap-1 text-white text-xs font-bold py-1">
                <Globe size={14} /> {idioma === 'es' ? 'EN' : 'ES'}
              </button>
              <button onClick={cambiarTema} className="flex items-center gap-1 text-white text-xs py-1">
                {tema === 'claro' ? <Moon size={14} /> : <Sun size={14} />}
                {tema === 'claro' ? 'Dark' : 'Light'}
              </button>
            </div>
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
          <div className="inline-flex items-center justify-center mb-8 shadow-2xl"
            style={{ backgroundColor: 'white', borderRadius: '20px', padding: '24px 48px', width: '420px', maxWidth: '90vw' }}>
            <img src="/logo.png" alt="SchoolSwap" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-tight"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
            {t('hero', 'title')}<br />
            <span style={{ color: '#a5b4fc' }}>{t('hero', 'subtitle')}</span>
          </h1>
          <p className="text-base sm:text-lg mb-8 max-w-xl mx-auto font-medium"
            style={{ color: 'white', textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
            {t('hero', 'description')}
          </p>
          {!usuario ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/registro" className="px-8 py-3 rounded-xl font-bold text-base hover:opacity-90 shadow-lg"
                style={{ backgroundColor: 'white', color: '#1a1f6e' }}>
                {t('hero', 'startFree')}
              </Link>
              <Link href="/auth/login" className="px-8 py-3 rounded-xl font-bold text-base border-2 border-white text-white"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                {t('hero', 'loginBtn')}
              </Link>
            </div>
          ) : (
            <Link href="/productos/nuevo" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-base hover:opacity-90 shadow-lg"
              style={{ backgroundColor: 'white', color: '#1a1f6e' }}>
              <Plus size={18} /> {t('hero', 'publishBtn')}
            </Link>
          )}
        </div>
      </section>

      {/* STATS BAR */}
      <div style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }} className="border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap gap-6 justify-center sm:justify-start">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--texto-suave)' }}>
            <Package size={16} style={{ color: 'var(--azul-medio)' }} />
            <span><strong style={{ color: 'var(--azul)' }}>{productos.length}</strong> {t('stats', 'products')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--texto-suave)' }}>
            <RefreshCw size={16} style={{ color: 'var(--azul-medio)' }} />
            <span>{t('stats', 'trades')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--texto-suave)' }}>
            <MessageCircle size={16} style={{ color: 'var(--azul-medio)' }} />
            <span>{t('stats', 'messages')}</span>
          </div>
        </div>
      </div>

      {/* BÚSQUEDA Y FILTROS AVANZADOS */}
      <section className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-suave)' }} />
              <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                placeholder={t('search', 'placeholder')}
                className="w-full rounded-xl pl-11 pr-4 py-3 text-sm border-2 outline-none"
                style={estiloInput} />
            </div>
            <select value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              className="rounded-xl px-4 py-3 text-sm border-2 outline-none sm:w-52"
              style={estiloInput}>
              <option value="">{t('search', 'allCategories')}</option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
              ))}
            </select>
            <select value={condicionSeleccionada} onChange={(e) => setCondicionSeleccionada(e.target.value)} className="rounded-xl px-4 py-3 text-sm border-2 outline-none sm:w-44" style={estiloInput}>
              <option value="">{t('search', 'allConditions')}</option>
              <option value="nuevo">{t('product', 'new')}</option>
              <option value="usado">{t('product', 'used')}</option>
            </select>
          </div>

          {/* FILTROS AVANZADOS */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex gap-2 items-center">
              <input type="number" value={precioMin} onChange={(e) => setPrecioMin(e.target.value)}
                placeholder={idioma === 'es' ? 'Precio mín' : 'Min price'}
                className="rounded-xl px-3 py-2.5 text-sm border-2 outline-none w-32"
                style={estiloInput} min="0" />
              <span style={{ color: 'var(--texto-suave)' }}>—</span>
              <input type="number" value={precioMax} onChange={(e) => setPrecioMax(e.target.value)}
                placeholder={idioma === 'es' ? 'Precio máx' : 'Max price'}
                className="rounded-xl px-3 py-2.5 text-sm border-2 outline-none w-32"
                style={estiloInput} min="0" />
            </div>
            <select value={ordenamiento} onChange={(e) => setOrdenamiento(e.target.value)}
              className="rounded-xl px-4 py-2.5 text-sm border-2 outline-none sm:w-52"
              style={estiloInput}>
              <option value="recientes">{idioma === 'es' ? 'Más recientes' : 'Most recent'}</option>
              <option value="precio_asc">{idioma === 'es' ? 'Precio: menor a mayor' : 'Price: low to high'}</option>
              <option value="precio_desc">{idioma === 'es' ? 'Precio: mayor a menor' : 'Price: high to low'}</option>
            </select>
            {hayFiltros && (
              <button onClick={() => { setBusqueda(''); setCategoriaSeleccionada(''); setCondicionSeleccionada(''); setPrecioMin(''); setPrecioMax(''); setOrdenamiento('recientes') }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border-2"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)', color: 'var(--texto-suave)' }}>
                {t('search', 'clear')}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* PRODUCTOS */}
      <section className="px-4 sm:px-6 pb-16 max-w-7xl mx-auto">
        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--azul)' }}>
          {hayFiltros
            ? `${productosFiltrados.length} ${productosFiltrados.length !== 1 ? t('search', 'results_plural') : t('search', 'results')}`
            : t('search', 'published')}
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ height: '280px', backgroundColor: 'var(--bg-card)' }}>
                <div style={{ height: '160px', backgroundColor: 'var(--borde)' }} />
                <div className="p-4 space-y-2">
                  <div style={{ height: '12px', backgroundColor: 'var(--borde)', borderRadius: '6px', width: '60%' }} />
                  <div style={{ height: '16px', backgroundColor: 'var(--borde)', borderRadius: '6px' }} />
                  <div style={{ height: '20px', backgroundColor: 'var(--borde)', borderRadius: '6px', width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
            <Search size={48} className="mx-auto mb-4" style={{ color: 'var(--borde)' }} />
            <p className="text-lg font-semibold" style={{ color: 'var(--texto-principal)' }}>{t('search', 'notFound')}</p>
            <p className="text-sm mt-1 mb-4" style={{ color: 'var(--texto-suave)' }}>{t('search', 'tryAgain')}</p>
            <button onClick={() => { setBusqueda(''); setCategoriaSeleccionada(''); setCondicionSeleccionada(''); setPrecioMin(''); setPrecioMax(''); setOrdenamiento('recientes') }}
              className="px-6 py-2 rounded-xl text-sm font-bold"
              style={{ backgroundColor: 'var(--azul)', color: 'white' }}>
              {t('search', 'seeAll')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => (
              <Link href={`/productos/${producto.id_producto}`} key={producto.id_producto}>
                <div className="rounded-2xl overflow-hidden border hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  style={{ ...estiloCard, boxShadow: '0 1px 4px var(--sombra)' }}>
                  <div className="h-48 flex items-center justify-center overflow-hidden relative"
                    style={{ backgroundColor: tema === 'oscuro' ? '#252840' : '#f8faff' }}>
                    {producto.imagen ? (
                      <img src={producto.imagen} alt={producto.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <Package size={48} style={{ color: 'var(--borde)' }} />
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="text-xs font-bold px-2 py-1 rounded-full"
                        style={{ backgroundColor: 'var(--azul-claro)', color: 'var(--azul-medio)' }}>
                        {producto.categoria?.nombre}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.92)', color: 'var(--azul)' }}>
                        {producto.condicion === 'nuevo' ? t('product', 'new') : t('product', 'used')}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold truncate text-sm" style={{ color: 'var(--texto-principal)' }}>{producto.nombre}</h3>
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--texto-suave)' }}>{producto.descripcion}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="font-extrabold text-base" style={{ color: 'var(--azul-medio)' }}>
                        ₡{Number(producto.precio).toLocaleString()}
                      </p>
                      <span className="text-xs px-2 py-1 rounded-lg font-medium"
                        style={{ backgroundColor: 'var(--azul-claro)', color: 'var(--azul)' }}>
                        {t('product', 'seeMore')}
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
