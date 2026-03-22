'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NuevoProducto() {
  const router = useRouter()
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imagenPreview, setImagenPreview] = useState(null)
  const [imagenFile, setImagenFile] = useState(null)
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    id_categoria: '',
  })

  useEffect(() => {
    async function verificarUsuario() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/auth/login')
    }

    async function cargarCategorias() {
      const { data } = await supabase.from('categoria').select('*')
      setCategorias(data || [])
    }

    verificarUsuario()
    cargarCategorias()
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleImagenChange(e) {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5MB')
      return
    }

    setImagenFile(file)
    setImagenPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    let imagenUrl = ''

    if (imagenFile) {
      const extension = imagenFile.name.split('.').pop()
      const nombreArchivo = `${user.id}-${Date.now()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(nombreArchivo, imagenFile)

      if (uploadError) {
        setError('Error al subir la imagen: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('productos')
        .getPublicUrl(nombreArchivo)

      imagenUrl = urlData.publicUrl
    }

    const { error: dbError } = await supabase.from('producto').insert({
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: parseFloat(form.precio),
      stock: parseInt(form.stock),
      id_categoria: form.id_categoria,
      imagen: imagenUrl,
      id_usuario: user.id,
      estado: 'publicado',
    })

    if (dbError) {
      setError(dbError.message)
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <nav className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-400">🏫 Marketplace Escolar</Link>
        <Link href="/" className="text-gray-400 hover:text-white text-sm transition">← Volver</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Publicar Producto</h1>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del producto</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="Ej: Calculadora científica"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={4}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Describí tu producto..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Precio (₡)</label>
              <input
                type="number"
                name="precio"
                value={form.precio}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="0"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stock disponible</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
            <select
              name="id_categoria"
              value={form.id_categoria}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
              required
            >
              <option value="">Seleccioná una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Imagen del producto</label>
            <div className="border-2 border-dashed border-[#2a2a2a] rounded-xl p-6 text-center hover:border-blue-500 transition cursor-pointer"
              onClick={() => document.getElementById('imagen-input').click()}
            >
              {imagenPreview ? (
                <div className="space-y-3">
                  <img src={imagenPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  <p className="text-gray-400 text-sm">Hacé clic para cambiar la imagen</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-4xl">🖼️</p>
                  <p className="text-gray-400 text-sm">Hacé clic para subir una imagen</p>
                  <p className="text-gray-600 text-xs">PNG, JPG hasta 5MB</p>
                </div>
              )}
            </div>
            <input
              id="imagen-input"
              type="file"
              accept="image/*"
              onChange={handleImagenChange}
              className="hidden"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-lg transition"
          >
            {loading ? 'Publicando...' : 'Publicar Producto'}
          </button>
        </form>
      </div>
    </main>
  )
}