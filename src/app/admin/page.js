'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data } = await supabase
        .from('usuario')
        .select('rol')
        .eq('id_usuario', user.id)
        .single()

      if (!data || data.rol !== 'administrador') {
        router.push('/')
        return
      }

      await cargarTodo()
      setLoading(false)
    }
    verificarAdmin()
  }, [])

  async function cargarTodo() {
    const [
      { count: totalUsuarios },
      { count: totalProductos },
      { count: totalPedidos },
      { data: todosUsuarios },
      { data: todosProductos },
      { data: todosPedidos },
    ] = await Promise.all([
      supabase.from('usuario').select('*', { count: 'exact', head: true }),
      supabase.from('producto').select('*', { count: 'exact', head: true }),
      supabase.from('pedido').select('*', { count: 'exact', head: true }),
      supabase.from('usuario').select('*').order('created_at', { ascending: false }),
      supabase.from('producto').select('*, categoria(nombre), usuario(nombre, apellido)').order('created_at', { ascending: false }),
      supabase.from('pedido').select('*, usuario(nombre, apellido), detalle_pedido(cantidad)').order('created_at', { ascending: false }),
    ])

    const { data: ventasData } = await supabase
      .from('pedido')
      .select('precio_total')
      .eq('estado', 'completado')

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

  function getEstadoColor(estado) {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-900/50 border-yellow-500 text-yellow-300'
      case 'procesando': return 'bg-blue-900/50 border-blue-500 text-blue-300'
      case 'completado': return 'bg-green-900/50 border-green-500 text-green-300'
      case 'cancelado': return 'bg-red-900/50 border-red-500 text-red-300'
      default: return 'bg-gray-900/50 border-gray-500 text-gray-300'
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-gray-400">Verificando acceso...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <nav className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-400">Marketplace Cedes Don Bosco</Link>
        <span className="text-yellow-400 text-sm font-medium"> Panel de Administrador</span>
        <Link href="/" className="text-gray-400 hover:text-white text-sm transition">← Volver</Link>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* TABS */}
        <div className="flex gap-2 mb-8 bg-[#1a1a1a] p-1 rounded-xl w-fit">
          {[
            { id: 'estadisticas', label: '📊 Estadísticas' },
            { id: 'usuarios', label: '👥 Usuarios' },
            { id: 'productos', label: '📦 Productos' },
            { id: 'pedidos', label: '🛒 Pedidos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSeccion(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${seccion === tab.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ESTADÍSTICAS */}
        {seccion === 'estadisticas' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">📊 Estadísticas generales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Usuarios registrados', value: stats.totalUsuarios, icon: '👥', color: 'blue' },
                { label: 'Productos publicados', value: stats.totalProductos, icon: '📦', color: 'purple' },
                { label: 'Pedidos realizados', value: stats.totalPedidos, icon: '🛒', color: 'yellow' },
                { label: 'Total en ventas', value: `₡${Number(stats.totalVentas).toLocaleString()}`, icon: '💰', color: 'green' },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
                  <p className="text-4xl mb-3">{stat.icon}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USUARIOS */}
        {seccion === 'usuarios' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">👥 Usuarios ({usuarios.length})</h2>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-[#2a2a2a]">
                  <tr className="text-gray-400 text-sm">
                    <th className="text-left p-4">Nombre</th>
                    <th className="text-left p-4">Correo</th>
                    <th className="text-left p-4">Rol</th>
                    <th className="text-left p-4">Estado</th>
                    <th className="text-left p-4">Registro</th>
                    <th className="text-left p-4">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id_usuario} className="border-b border-[#2a2a2a] hover:bg-[#2a2a2a] transition">
                      <td className="p-4 text-white font-medium">{u.nombre} {u.apellido}</td>
                      <td className="p-4 text-gray-400 text-sm">{u.correo}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full border ${u.rol === 'administrador' ? 'bg-yellow-900/50 border-yellow-500 text-yellow-300' : u.rol === 'padre' ? 'bg-purple-900/50 border-purple-500 text-purple-300' : 'bg-blue-900/50 border-blue-500 text-blue-300'}`}>
                          {u.rol}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full border ${u.activo ? 'bg-green-900/50 border-green-500 text-green-300' : 'bg-red-900/50 border-red-500 text-red-300'}`}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-sm">
                        {new Date(u.created_at).toLocaleDateString('es-CR')}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleUsuario(u.id_usuario, u.activo)}
                          className={`text-xs px-3 py-1 rounded-lg transition ${u.activo ? 'bg-red-900/50 hover:bg-red-900 text-red-300' : 'bg-green-900/50 hover:bg-green-900 text-green-300'}`}
                        >
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRODUCTOS */}
        {seccion === 'productos' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">📦 Productos ({productos.length})</h2>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-[#2a2a2a]">
                  <tr className="text-gray-400 text-sm">
                    <th className="text-left p-4">Producto</th>
                    <th className="text-left p-4">Categoría</th>
                    <th className="text-left p-4">Vendedor</th>
                    <th className="text-left p-4">Precio</th>
                    <th className="text-left p-4">Stock</th>
                    <th className="text-left p-4">Estado</th>
                    <th className="text-left p-4">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p) => (
                    <tr key={p.id_producto} className="border-b border-[#2a2a2a] hover:bg-[#2a2a2a] transition">
                      <td className="p-4 text-white font-medium">{p.nombre}</td>
                      <td className="p-4 text-gray-400 text-sm">{p.categoria?.nombre}</td>
                      <td className="p-4 text-gray-400 text-sm">{p.usuario?.nombre} {p.usuario?.apellido}</td>
                      <td className="p-4 text-blue-400 font-medium">₡{Number(p.precio).toLocaleString()}</td>
                      <td className="p-4 text-gray-400 text-sm">{p.stock}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full border ${p.estado === 'publicado' ? 'bg-green-900/50 border-green-500 text-green-300' : p.estado === 'agotado' ? 'bg-yellow-900/50 border-yellow-500 text-yellow-300' : 'bg-red-900/50 border-red-500 text-red-300'}`}>
                          {p.estado}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => eliminarProducto(p.id_producto)}
                          className="text-xs px-3 py-1 rounded-lg bg-red-900/50 hover:bg-red-900 text-red-300 transition"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PEDIDOS */}
        {seccion === 'pedidos' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">🛒 Pedidos ({pedidos.length})</h2>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-[#2a2a2a]">
                  <tr className="text-gray-400 text-sm">
                    <th className="text-left p-4">ID Pedido</th>
                    <th className="text-left p-4">Cliente</th>
                    <th className="text-left p-4">Total</th>
                    <th className="text-left p-4">Items</th>
                    <th className="text-left p-4">Fecha</th>
                    <th className="text-left p-4">Estado</th>
                    <th className="text-left p-4">Cambiar estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((p) => (
                    <tr key={p.id_pedido} className="border-b border-[#2a2a2a] hover:bg-[#2a2a2a] transition">
                      <td className="p-4 text-gray-400 text-xs font-mono">#{p.id_pedido.slice(0, 8).toUpperCase()}</td>
                      <td className="p-4 text-white font-medium">{p.usuario?.nombre} {p.usuario?.apellido}</td>
                      <td className="p-4 text-blue-400 font-medium">₡{Number(p.precio_total).toLocaleString()}</td>
                      <td className="p-4 text-gray-400 text-sm">{p.detalle_pedido?.length} items</td>
                      <td className="p-4 text-gray-400 text-sm">{new Date(p.created_at).toLocaleDateString('es-CR')}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getEstadoColor(p.estado)}`}>
                          {p.estado}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={p.estado}
                          onChange={(e) => cambiarEstadoPedido(p.id_pedido, e.target.value)}
                          className="bg-[#2a2a2a] border border-[#3a3a3a] text-white text-xs rounded-lg px-2 py-1 focus:outline-none"
                        >
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
        )}
      </div>
    </main>
  )
}