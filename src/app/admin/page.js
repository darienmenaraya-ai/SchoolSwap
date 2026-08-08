'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Package, ShoppingCart, BarChart3, Sun, Moon, Globe } from 'lucide-react'
import { useApp } from '@/lib/context'

export default function Admin() {
  const router = useRouter()
  const { t, cambiarIdioma, cambiarTema, idioma, tema } = useApp()
  const [loading, setLoading] = useState(true)
  const [seccion, setSeccion] = useState('estadisticas')
  const [stats, setStats] = useState({})
  const [usuarios, setUsuarios] = useState([])
  const [productos, setProductos] = useState([])
  const [pedidos, setPedidos] = useState([])

  useEffect(() => {
    async function verificarAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('usuario').select('rol').eq('id_usuario', user.id).single()
      if (!data || data.rol !== 'administrador') { router.push('/'); return }
      await cargarTodo()
      setLoading(false)
    }
    verificarAdmin()
  }, [])

  async function cargarTodo() {
    const [
      { count: totalUsuarios }, { count: totalProductos }, { count: totalPedidos },
      { data: todosUsuarios }, { data: todosProductos }, { data: todosPedidos },
    ] = await Promise.all([
      supabase.from('usuario').select('*', { count: 'exact', head: true }),
      supabase.from('producto').select('*', { count: 'exact', head: true }),
      supabase.from('pedido').select('*', { count: 'exact', head: true }),
      supabase.from('usuario').select('*').order('created_at', { ascending: false }),
      supabase.from('producto').select('*, categoria(nombre), usuario(nombre, apellido)').order('created_at', { ascending: false }),
      supabase.from('pedido').select('*, usuario(nombre, apellido), detalle_pedido(cantidad)').order('created_at', { ascending: false }),
    ])
    const { data: ventasData } = await supabase.from('pedido').select('precio_total').eq('estado', 'completado')
    const totalVentas = ventasData?.reduce((acc, p) => acc + Number(p.precio_total), 0) || 0
    setStats({ totalUsuarios, totalProductos, totalPedidos, totalVentas })
    setUsuarios(todosUsuarios || [])
    setProductos(todosProductos || [])
    setPedidos(todosPedidos || [])
  }

  async function cambiarEstadoPedido(id_pedido, nuevoEstado) {
    await supabase.from('pedido').update({ estado: nuevoEstado }).eq('id_pedido', id_pedido)
    setPedidos(pedidos.map(p => p.id_pedido === id_pedido ? { ...p, estado: nuevoEstado } : p))
  }

  async function eliminarProducto(id_producto) {
    if (!confirm(idioma === 'es' ? '¿Estás seguro que querés eliminar este producto?' : 'Are you sure you want to delete this product?')) return
    await supabase.from('producto').delete().eq('id_producto', id_producto)
    setProductos(productos.filter(p => p.id_producto !== id_producto))
  }

  async function toggleUsuario(id_usuario, activo) {
    await supabase.from('usuario').update({ activo: !activo }).eq('id_usuario', id_usuario)
    setUsuarios(usuarios.map(u => u.id_usuario === id_usuario ? { ...u, activo: !activo } : u))
  }

  function getEstadoStyle(estado) {
    switch (estado) {
      case 'pendiente': return { backgroundColor: '#fefce8', borderColor: '#fde047', color: '#854d0e' }
      case 'procesando': return { backgroundColor: '#eff6ff', borderColor: '#93c5fd', color: '#1e40af' }
      case 'completado': return { backgroundColor: '#f0fdf4', borderColor: '#86efac', color: '#166534' }
      case 'cancelado': return { backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#dc2626' }
      default: return { backgroundColor: '#f9fafb', borderColor: '#e5e7eb', color: '#6b7280' }
    }
  }

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-principal)' }}>
      <p style={{ color: 'var(--texto-suave)' }}>{t('admin', 'verifying')}</p>
    </main>
  )

  const tabs = [
    { id: 'estadisticas', label: t('admin', 'stats'), icon: <BarChart3 size={15} /> },
    { id: 'usuarios', label: t('admin', 'users'), icon: <Users size={15} /> },
    { id: 'productos', label: t('admin', 'products'), icon: <Package size={15} /> },
    { id: 'pedidos', label: t('admin', 'orders'), icon: <ShoppingCart size={15} /> },
  ]

  return (
    <main style={{ backgroundColor: 'var(--bg-principal)', minHeight: '100vh' }}>
      <nav style={{ backgroundColor: 'var(--bg-nav)', boxShadow: '0 2px 20px rgba(26,31,110,0.3)' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between">
          <Link href="/">
            <div className="bg-white rounded-xl px-3 py-1 shadow-md">
              <img src="/logo.png" alt="SchoolSwap" style={{ height: '80px', width: 'auto', display: 'block' }} />
            </div>
          </Link>
          <span className="text-sm font-bold hidden md:block" style={{ color: '#a5b4fc' }}>
            {t('admin', 'panel')}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={cambiarIdioma}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-white text-xs font-bold border border-white border-opacity-30">
              <Globe size={13} /> {idioma === 'es' ? 'EN' : 'ES'}
            </button>
            <button onClick={cambiarTema}
              className="p-1.5 rounded-lg text-white border border-white border-opacity-30">
              {tema === 'claro' ? <Moon size={15} /> : <Sun size={15} />}
            </button>
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-white hover:opacity-80">
              <ArrowLeft size={16} /> {t('common', 'back')}
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* TABS */}
        <div className="flex gap-2 mb-8 p-1 rounded-xl w-fit shadow-sm border"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setSeccion(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
              style={{
                backgroundColor: seccion === tab.id ? 'var(--azul)' : 'transparent',
                color: seccion === tab.id ? 'white' : 'var(--texto-suave)'
              }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ESTADÍSTICAS */}
        {seccion === 'estadisticas' && (
          <div>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--azul)' }}>
              {t('admin', 'generalStats')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: t('admin', 'registeredUsers'), value: stats.totalUsuarios, icon: <Users size={24} /> },
                { label: t('admin', 'publishedProducts'), value: stats.totalProductos, icon: <Package size={24} /> },
                { label: t('admin', 'totalOrders'), value: stats.totalPedidos, icon: <ShoppingCart size={24} /> },
                { label: t('admin', 'totalSales'), value: `₡${Number(stats.totalVentas).toLocaleString()}`, icon: <BarChart3 size={24} /> },
              ].map((stat) => (
                <div key={stat.label} className="border rounded-2xl p-6 shadow-sm"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
                  <div className="mb-3" style={{ color: 'var(--azul-medio)' }}>{stat.icon}</div>
                  <p className="text-3xl font-extrabold" style={{ color: 'var(--azul)' }}>{stat.value}</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--texto-suave)' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USUARIOS */}
        {seccion === 'usuarios' && (
          <div>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--azul)' }}>
              {t('admin', 'users')} ({usuarios.length})
            </h2>
            <div className="border rounded-2xl overflow-hidden shadow-sm"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: tema === 'oscuro' ? '#252840' : '#fafbff' }}>
                    <tr className="text-sm border-b" style={{ borderColor: 'var(--borde)', color: 'var(--texto-suave)' }}>
                      {[
                        t('admin', 'name'), t('admin', 'email'), t('admin', 'role'),
                        t('admin', 'status'), t('admin', 'registration'), t('admin', 'action')
                      ].map(h => (
                        <th key={h} className="text-left p-4 font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr key={u.id_usuario} className="border-b transition-colors"
                        style={{ borderColor: 'var(--borde)' }}>
                        <td className="p-4 font-bold text-sm" style={{ color: 'var(--azul)' }}>
                          {u.nombre} {u.apellido}
                        </td>
                        <td className="p-4 text-sm" style={{ color: 'var(--texto-suave)' }}>{u.correo}</td>
                        <td className="p-4">
                          <span className="text-xs font-bold px-2 py-1 rounded-full"
                            style={{ backgroundColor: 'var(--azul-claro)', color: 'var(--azul-medio)' }}>
                            {u.rol}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-bold px-2 py-1 rounded-full border"
                            style={u.activo
                              ? { backgroundColor: '#f0fdf4', borderColor: '#86efac', color: '#166534' }
                              : { backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#dc2626' }}>
                            {u.activo ? t('admin', 'active') : t('admin', 'inactive')}
                          </span>
                        </td>
                        <td className="p-4 text-sm" style={{ color: 'var(--texto-suave)' }}>
                          {new Date(u.created_at).toLocaleDateString(idioma === 'es' ? 'es-CR' : 'en-US')}
                        </td>
                        <td className="p-4">
                          <button onClick={() => toggleUsuario(u.id_usuario, u.activo)}
                            className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all border"
                            style={u.activo
                              ? { borderColor: '#fca5a5', color: '#dc2626', backgroundColor: 'var(--bg-card)' }
                              : { borderColor: '#86efac', color: '#166534', backgroundColor: 'var(--bg-card)' }}>
                            {u.activo ? t('admin', 'deactivate') : t('admin', 'activate')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTOS */}
        {seccion === 'productos' && (
          <div>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--azul)' }}>
              {t('admin', 'products')} ({productos.length})
            </h2>
            <div className="border rounded-2xl overflow-hidden shadow-sm"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: tema === 'oscuro' ? '#252840' : '#fafbff' }}>
                    <tr className="text-sm border-b" style={{ borderColor: 'var(--borde)', color: 'var(--texto-suave)' }}>
                      {[
                        t('admin', 'name'), t('admin', 'role'), t('admin', 'seller'),
                        t('product', 'price'), t('product', 'stock'), t('admin', 'status'), t('admin', 'action')
                      ].map(h => (
                        <th key={h} className="text-left p-4 font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((p) => (
                      <tr key={p.id_producto} className="border-b transition-colors"
                        style={{ borderColor: 'var(--borde)' }}>
                        <td className="p-4 font-bold text-sm" style={{ color: 'var(--azul)' }}>{p.nombre}</td>
                        <td className="p-4 text-sm" style={{ color: 'var(--texto-suave)' }}>{p.categoria?.nombre}</td>
                        <td className="p-4 text-sm" style={{ color: 'var(--texto-suave)' }}>
                          {p.usuario?.nombre} {p.usuario?.apellido}
                        </td>
                        <td className="p-4 font-bold text-sm" style={{ color: 'var(--azul-medio)' }}>
                          ₡{Number(p.precio).toLocaleString()}
                        </td>
                        <td className="p-4 text-sm" style={{ color: 'var(--texto-suave)' }}>{p.stock}</td>
                        <td className="p-4">
                          <span className="text-xs font-bold px-2 py-1 rounded-full"
                            style={p.estado === 'publicado'
                              ? { backgroundColor: '#f0fdf4', color: '#166534' }
                              : { backgroundColor: '#fef2f2', color: '#dc2626' }}>
                            {p.estado}
                          </span>
                        </td>
                        <td className="p-4">
                          <button onClick={() => eliminarProducto(p.id_producto)}
                            className="text-xs px-3 py-1.5 rounded-lg font-bold border transition-all"
                            style={{ borderColor: '#fca5a5', color: '#dc2626', backgroundColor: 'var(--bg-card)' }}>
                            {t('admin', 'delete')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PEDIDOS */}
        {seccion === 'pedidos' && (
          <div>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--azul)' }}>
              {t('admin', 'orders')} ({pedidos.length})
            </h2>
            <div className="border rounded-2xl overflow-hidden shadow-sm"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: tema === 'oscuro' ? '#252840' : '#fafbff' }}>
                    <tr className="text-sm border-b" style={{ borderColor: 'var(--borde)', color: 'var(--texto-suave)' }}>
                      {[
                        'ID', t('admin', 'name'), t('cart', 'total'),
                        t('admin', 'registration'), t('admin', 'status'), t('admin', 'changeStatus')
                      ].map(h => (
                        <th key={h} className="text-left p-4 font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map((p) => (
                      <tr key={p.id_pedido} className="border-b transition-colors"
                        style={{ borderColor: 'var(--borde)' }}>
                        <td className="p-4 text-xs font-mono font-bold" style={{ color: 'var(--azul-medio)' }}>
                          #{p.id_pedido.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="p-4 font-bold text-sm" style={{ color: 'var(--azul)' }}>
                          {p.usuario?.nombre} {p.usuario?.apellido}
                        </td>
                        <td className="p-4 font-bold text-sm" style={{ color: 'var(--azul-medio)' }}>
                          ₡{Number(p.precio_total).toLocaleString()}
                        </td>
                        <td className="p-4 text-sm" style={{ color: 'var(--texto-suave)' }}>
                          {new Date(p.created_at).toLocaleDateString(idioma === 'es' ? 'es-CR' : 'en-US')}
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-bold px-2 py-1 rounded-full border"
                            style={getEstadoStyle(p.estado)}>
                            {p.estado}
                          </span>
                        </td>
                        <td className="p-4">
                          <select value={p.estado}
                            onChange={(e) => cambiarEstadoPedido(p.id_pedido, e.target.value)}
                            className="text-xs rounded-lg px-2 py-1.5 border-2 outline-none"
                            style={{
                              borderColor: 'var(--borde)',
                              color: 'var(--texto-principal)',
                              backgroundColor: 'var(--bg-card)'
                            }}>
                            <option value="pendiente">{t('orders', 'pending')}</option>
                            <option value="procesando">{t('orders', 'processing')}</option>
                            <option value="completado">{t('orders', 'completed')}</option>
                            <option value="cancelado">{t('orders', 'cancelled')}</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}