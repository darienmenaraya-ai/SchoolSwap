'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ImagePlus } from 'lucide-react'

export default function NuevoProducto() {
  const router = useRouter()
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imagenPreview, setImagenPreview] = useState(null)
  const [imagenFile, setImagenFile] = useState(null)
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', id_categoria: '' })

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/auth/login')
      const { data } = await supabase.from('categoria').select('*')
      setCategorias(data || [])
    }
    init()
  }, [])

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  function handleImagenChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('La imagen no puede superar los 5MB'); return }
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
      const ext = imagenFile.name.split('.').pop()
      const nombre = `${user.id}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('productos').upload(nombre, imagenFile)
      if (uploadError) { setError('Error al subir la imagen'); setLoading(false); return }
      const { data: urlData } = supabase.storage.from('productos').getPublicUrl(nombre)
      imagenUrl = urlData.publicUrl
    }
    const { error: dbError } = await supabase.from('producto').insert({
      nombre: form.nombre, descripcion: form.descripcion, precio: parseFloat(form.precio),
      stock: parseInt(form.stock), id_categoria: form.id_categoria, imagen: imagenUrl,
      id_usuario: user.id, estado: 'publicado',
    })
    if (dbError) { setError(dbError.message); setLoading(false); return }
    router.push('/')
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#f5f7ff' }}>
      <nav className="px-6 py-3 flex items-center justify-between shadow-lg" style={{ backgroundColor: '#1a1f6e' }}>
        <Link href="/"><img src="/logo.png" alt="SchoolSwap" className="h-12 w-auto" /></Link>
        <Link href="/" className="flex items-center gap-2 text-sm font-medium text-white">
          <ArrowLeft size={16} /> Volver
        </Link>
      </nav>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-extrabold mb-8" style={{ color: '#1a1f6e' }}>Publicar Producto</h1>
        {error && (
          <div className="p-3 rounded-lg mb-6 text-sm border" style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#dc2626' }}>{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#1a1f6e' }}>Nombre del producto</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange}
              className="w-full rounded-lg p-3 text-sm border focus:outline-none bg-white" style={{ borderColor: '#e2e6ff', color: '#1a1f6e' }}
              placeholder="Ej: Calculadora científica" required />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#1a1f6e' }}>Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={4}
              className="w-full rounded-lg p-3 text-sm border focus:outline-none bg-white resize-none" style={{ borderColor: '#e2e6ff', color: '#1a1f6e' }}
              placeholder="Describí tu producto..." required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#1a1f6e' }}>Precio (₡)</label>
              <input type="number" name="precio" value={form.precio} onChange={handleChange}
                className="w-full rounded-lg p-3 text-sm border focus:outline-none bg-white" style={{ borderColor: '#e2e6ff', color: '#1a1f6e' }}
                placeholder="0" min="0" required />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#1a1f6e' }}>Stock</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange}
                className="w-full rounded-lg p-3 text-sm border focus:outline-none bg-white" style={{ borderColor: '#e2e6ff', color: '#1a1f6e' }}
                placeholder="0" min="0" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#1a1f6e' }}>Categoría</label>
            <select name="id_categoria" value={form.id_categoria} onChange={handleChange}
              className="w-full rounded-lg p-3 text-sm border focus:outline-none bg-white" style={{ borderColor: '#e2e6ff', color: '#1a1f6e' }} required>
              <option value="">Seleccioná una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#1a1f6e' }}>Imagen del producto</label>
            <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:opacity-80 transition"
              style={{ borderColor: '#3b4fd8' }} onClick={() => document.getElementById('imagen-input').click()}>
              {imagenPreview ? (
                <div className="space-y-2">
                  <img src={imagenPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  <p className="text-sm" style={{ color: '#6b7280' }}>Clic para cambiar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImagePlus size={40} className="mx-auto" style={{ color: '#3b4fd8' }} />
                  <p className="text-sm" style={{ color: '#6b7280' }}>Clic para subir una imagen</p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>PNG, JPG hasta 5MB</p>
                </div>
              )}
            </div>
            <input id="imagen-input" type="file" accept="image/*" onChange={handleImagenChange} className="hidden" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg font-bold text-sm transition"
            style={{ backgroundColor: '#1a1f6e', color: 'white' }}>
            {loading ? 'Publicando...' : 'Publicar Producto'}
          </button>
        </form>
      </div>
    </main>
  )
}