'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Package, ShoppingCart, BarChart3 } from 'lucide-react'

export default function Admin() {
  const router = useRouter()
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
    if (!confirm('¿Estás seguro que querés eliminar este producto?')) return
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
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f0f4ff' }}>
      <p style={{ color: '#6b7280' }}>Verificando acceso...</p>
    </main>
  )

  const tabs = [
    { id: 'estadisticas', label: 'Estadísticas', icon: <BarChart3 size={15} /> },
    { id: 'usuarios', label: 'Usuarios', icon: <Users size={15} /> },
    { id: 'productos', label: 'Productos', icon: <Package size={15} /> },
    { id: 'pedidos', label: 'Pedidos', icon: <ShoppingCart size={15} /> },
  ]

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#f0f4ff' }}>
      <nav style={{ backgroundColor: '#1a1f6e', boxShadow: '0 2px 20px rgba(26,31,110,0.3)' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between">
          <Link href="/">
            <div className="bg-white rounded-xl px-3 py-1 shadow-md">
              <img src="/logo.png" alt="SchoolSwap" style={{ height: '80px', width: 'auto', display: 'block' }} />
            </div>
          </Link>
          <span className="text-sm font-bold" style={{ color: '#a5b4fc' }}>Panel de Administrador</span>
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-white hover:opacity-80">
            <ArrowLeft size={16} /> Volver
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-2 mb-8 bg-white p-1 rounded-xl w-fit shadow-sm border" style={{ borderColor: '#e5e7eb' }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setSeccion(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
              style={{ backgroundColor: seccion === tab.id ? '#1a1f6e' : 'transparent', color: seccion === tab.id ? 'white' : '#6b7280' }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {seccion === 'estadisticas' && (
          <div>
            <h2 className="text-xl font-bold mb-6" style={{ color: '#1a1f6e' }}>Estadísticas generales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Usuarios registrados', value: stats.totalUsuarios, icon: <Users size={24} /> },
                { label: 'Productos publicados', value: stats.totalProductos, icon: <Package size={24} /> },
                { label: 'Pedidos realizados', value: stats.totalPedidos, icon: <ShoppingCart size={24} /> },
                { label: 'Total en ventas', value: `₡${Number(stats.totalVentas).toLocaleString()}`, icon: <BarChart3 size={24} /> },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border rounded-2xl p-6 shadow-sm" style={{ borderColor: '#e5e7eb' }}>
                  <div className="mb-3" style={{ color: '#3b4fd8' }}>{stat.icon}</div>
                  <p className="text-3xl font-extrabold" style={{ color: '#1a1f6e' }}>{stat.value}</p>
                  <p className="text-sm mt-1" style={{ color: '#6b7280' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {seccion === 'usuarios' && (
          <div>
            <h2 className="text-xl font-bold mb-6" style={{ color: '#1a1f6e' }}>Usuarios ({usuarios.length})</h2>
            <div className="bg-white border rounded-2xl overflow-hidden shadow-sm" style={{ borderColor: '#e5e7eb' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: '#fafbff' }}>
                    <tr className="text-sm border-b" style={{ borderColor: '#e5e7eb', color: '#6b7280' }}>
                      <th className="text-left p-4 font-bold">Nombre</th>
                      <th className="text-left p-4 font-bold">Correo</th>
                      <th className="text-left p-4 font-bold">Rol</th>
                      <th className="text-left p-4 font-bold">Estado</th>
                      <th className="text-left p-4 font-bold">Registro</th>
                      <th className="text-left p-4 font-bold">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr key={u.id_usuario} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#f3f4f6' }}>
                        <td className="p-4 font-bold text-sm" style={{ color: '#1a1f6e' }}>{u.nombre} {u.apellido}</td>
                        <td className="p-4 text-sm" style={{ color: '#6b7280' }}>{u.correo}</td>
                        <td className="p-4">
                          <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#e8eaff', color: '#3b4fd8' }}>{u.rol}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-bold px-2 py-1 rounded-full border"
                            style={u.activo ? { backgroundColor: '#f0fdf4', borderColor: '#86efac', color: '#166534' } : { backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#dc2626' }}>
                            {u.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="p-4 text-sm" style={{ color: '#9ca3af' }}>{new Date(u.created_at).toLocaleDateString('es-CR')}</td>
                        <td className="p-4">
                          <button onClick={() => toggleUsuario(u.id_usuario, u.activo)}
                            className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all border"
                            style={u.activo ? { borderColor: '#fca5a5', color: '#dc2626', backgroundColor: 'white' } : { borderColor: '#86efac', color: '#166534', backgroundColor: 'white' }}>
                            {u.activo ? 'Desactivar' : 'Activar'}
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

        {seccion === 'productos' && (
          <div>
            <h2 className="text-xl font-bold mb-6" style={{ color: '#1a1f6e' }}>Productos ({productos.length})</h2>
            <div className="bg-white border rounded-2xl overflow-hidden shadow-sm" style={{ borderColor: '#e5e7eb' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: '#fafbff' }}>
                    <tr className="text-sm border-b" style={{ borderColor: '#e5e7eb', color: '#6b7280' }}>
                      <th className="text-left p-4 font-bold">Producto</th>
                      <th className="text-left p-4 font-bold">Categoría</th>
                      <th className="text-left p-4 font-bold">Vendedor</th>
                      <th className="text-left p-4 font-bold">Precio</th>
                      <th className="text-left p-4 font-bold">Stock</th>
                      <th className="text-left p-4 font-bold">Estado</th>
                      <th className="text-left p-4 font-bold">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((p) => (
                      <tr key={p.id_producto} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#f3f4f6' }}>
                        <td className="p-4 font-bold text-sm" style={{ color: '#1a1f6e' }}>{p.nombre}</td>
                        <td className="p-4 text-sm" style={{ color: '#6b7280' }}>{p.categoria?.nombre}</td>
                        <td className="p-4 text-sm" style={{ color: '#6b7280' }}>{p.usuario?.nombre} {p.usuario?.apellido}</td>
                        <td className="p-4 font-bold text-sm" style={{ color: '#3b4fd8' }}>₡{Number(p.precio).toLocaleString()}</td>
                        <td className="p-4 text-sm" style={{ color: '#6b7280' }}>{p.stock}</td>
                        <td className="p-4">
                          <span className="text-xs font-bold px-2 py-1 rounded-full"
                            style={p.estado === 'publicado' ? { backgroundColor: '#f0fdf4', color: '#166534' } : { backgroundColor: '#fef2f2', color: '#dc2626' }}>
                            {p.estado}
                          </span>
                        </td>
                        <td className="p-4">
                          <button onClick={() => eliminarProducto(p.id_producto)}
                            className="text-xs px-3 py-1.5 rounded-lg font-bold border transition-all"
                            style={{ borderColor: '#fca5a5', color: '#dc2626', backgroundColor: 'white' }}>
                            Eliminar
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

        {seccion === 'pedidos' && (
          <div>
            <h2 className="text-xl font-bold mb-6" style={{ color: '#1a1f6e' }}>Pedidos ({pedidos.length})</h2>
            <div className="bg-white border rounded-2xl overflow-hidden shadow-sm" style={{ borderColor: '#e5e7eb' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: '#fafbff' }}>
                    <tr className="text-sm border-b" style={{ borderColor: '#e5e7eb', color: '#6b7280' }}>
                      <th className="text-left p-4 font-bold">ID</th>
                      <th className="text-left p-4 font-bold">Cliente</th>
                      <th className="text-left p-4 font-bold">Total</th>
                      <th className="text-left p-4 font-bold">Fecha</th>
                      <th className="text-left p-4 font-bold">Estado</th>
                      <th className="text-left p-4 font-bold">Cambiar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map((p) => (
                      <tr key={p.id_pedido} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#f3f4f6' }}>
                        <td className="p-4 text-xs font-mono font-bold" style={{ color: '#3b4fd8' }}>#{p.id_pedido.slice(0, 8).toUpperCase()}</td>
                        <td className="p-4 font-bold text-sm" style={{ color: '#1a1f6e' }}>{p.usuario?.nombre} {p.usuario?.apellido}</td>
                        <td className="p-4 font-bold text-sm" style={{ color: '#3b4fd8' }}>₡{Number(p.precio_total).toLocaleString()}</td>
                        <td className="p-4 text-sm" style={{ color: '#9ca3af' }}>{new Date(p.created_at).toLocaleDateString('es-CR')}</td>
                        <td className="p-4">
                          <span className="text-xs font-bold px-2 py-1 rounded-full border" style={getEstadoStyle(p.estado)}>{p.estado}</span>
                        </td>
                        <td className="p-4">
                          <select value={p.estado} onChange={(e) => cambiarEstadoPedido(p.id_pedido, e.target.value)}
                            className="text-xs rounded-lg px-2 py-1.5 border-2 outline-none"
                            style={{ borderColor: '#e5e7eb', color: '#1a1f6e', backgroundColor: 'white' }}>
                            <option value="pendiente">Pendiente</option>
                            <option value="procesando">Procesando</option>
                            <option value="completado">Completado</option>
                            <option value="cancelado">Cancelado</option>
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