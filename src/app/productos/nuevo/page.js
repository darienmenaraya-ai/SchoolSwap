'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ImagePlus } from 'lucide-react'
import { sanitizeText, validatePrice, validateStock } from '@/lib/security'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024

export default function NuevoProducto() {
  const router = useRouter()
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [imagenPreview, setImagenPreview] = useState(null)
  const [imagenFile, setImagenFile] = useState(null)
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', id_categoria: '' })

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('categoria').select('*').order('nombre')
      setCategorias(data || [])
    }
    init()
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFieldErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  function handleImagenChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) { setError('Solo se permiten imágenes JPG, PNG, WEBP o GIF'); return }
    if (file.size > MAX_SIZE) { setError('La imagen no puede superar los 5MB'); return }
    setImagenFile(file)
    setImagenPreview(URL.createObjectURL(file))
    setError('')
  }

  function validate() {
    const errors = {}
    if (!form.nombre.trim() || form.nombre.trim().length < 3) errors.nombre = 'Mínimo 3 caracteres'
    if (!form.descripcion.trim() || form.descripcion.trim().length < 10) errors.descripcion = 'Mínimo 10 caracteres'
    if (!validatePrice(form.precio)) errors.precio = 'Precio inválido (0 - 10,000,000)'
    if (!validateStock(form.stock)) errors.stock = 'Stock inválido (0 - 99,999)'
    if (!form.id_categoria) errors.id_categoria = 'Seleccioná una categoría'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    let imagenUrl = ''
    if (imagenFile) {
      const ext = imagenFile.name.split('.').pop().toLowerCase()
      const nombre = `${user.id}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('productos').upload(nombre, imagenFile, {
        contentType: imagenFile.type, upsert: false,
      })
      if (uploadError) { setError('Error al subir la imagen. Intentá de nuevo.'); setLoading(false); return }
      const { data: urlData } = supabase.storage.from('productos').getPublicUrl(nombre)
      imagenUrl = urlData.publicUrl
    }
    const { error: dbError } = await supabase.from('producto').insert({
      nombre: sanitizeText(form.nombre),
      descripcion: sanitizeText(form.descripcion),
      precio: parseFloat(form.precio),
      stock: parseInt(form.stock),
      id_categoria: form.id_categoria,
      imagen: imagenUrl,
      id_usuario: user.id,
      estado: 'publicado',
    })
    if (dbError) { setError('Error al publicar. Intentá de nuevo.'); setLoading(false); return }
    router.push('/')
  }

  const inputStyle = (field) => ({
    borderColor: fieldErrors[field] ? '#fca5a5' : '#e5e7eb',
    color: '#111827', backgroundColor: '#fafafa',
  })

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#f0f4ff' }}>
      <nav style={{ backgroundColor: '#1a1f6e', boxShadow: '0 2px 20px rgba(26,31,110,0.3)' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between">
          <Link href="/">
            <div className="bg-white rounded-xl px-3 py-1 shadow-md">
              <img src="/logo.png" alt="SchoolSwap" style={{ height: '80px', width: 'auto', display: 'block' }} />
            </div>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-white hover:opacity-80 transition-opacity">
            <ArrowLeft size={16} /> Volver
          </Link>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-xl p-8 border" style={{ borderColor: '#e5e7eb' }}>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#1a1f6e' }}>Publicar Producto</h1>
          <p className="text-sm mb-6" style={{ color: '#6b7280' }}>Completá los datos de tu producto</p>
          {error && (
            <div className="p-3 rounded-xl mb-4 text-sm" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>Nombre del producto</label>
              <input type="text" name="nombre" value={form.nombre} onChange={handleChange}
                className="w-full rounded-xl p-3 text-sm border-2 outline-none" style={inputStyle('nombre')}
                placeholder="Ej: Calculadora científica Casio" maxLength={100} />
              {fieldErrors.nombre && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.nombre}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={4}
                className="w-full rounded-xl p-3 text-sm border-2 outline-none resize-none" style={inputStyle('descripcion')}
                placeholder="Describí el estado y características de tu producto..." maxLength={500} />
              {fieldErrors.descripcion && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.descripcion}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>Precio (₡)</label>
                <input type="number" name="precio" value={form.precio} onChange={handleChange}
                  className="w-full rounded-xl p-3 text-sm border-2 outline-none" style={inputStyle('precio')}
                  placeholder="0" min="0" max="10000000" />
                {fieldErrors.precio && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.precio}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>Stock</label>
                <input type="number" name="stock" value={form.stock} onChange={handleChange}
                  className="w-full rounded-xl p-3 text-sm border-2 outline-none" style={inputStyle('stock')}
                  placeholder="0" min="0" max="99999" />
                {fieldErrors.stock && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.stock}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>Categoría</label>
              <select name="id_categoria" value={form.id_categoria} onChange={handleChange}
                className="w-full rounded-xl p-3 text-sm border-2 outline-none" style={inputStyle('id_categoria')}>
                <option value="">Seleccioná una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
                ))}
              </select>
              {fieldErrors.id_categoria && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.id_categoria}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>Imagen del producto</label>
              <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                style={{ borderColor: '#c7d2fe', backgroundColor: '#f8faff' }}
                onClick={() => document.getElementById('imagen-input').click()}>
                {imagenPreview ? (
                  <div className="space-y-2">
                    <img src={imagenPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    <p className="text-xs" style={{ color: '#6b7280' }}>Clic para cambiar la imagen</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImagePlus size={40} className="mx-auto" style={{ color: '#3b4fd8' }} />
                    <p className="text-sm font-medium" style={{ color: '#374151' }}>Clic para subir una imagen</p>
                    <p className="text-xs" style={{ color: '#9ca3af' }}>JPG, PNG, WEBP hasta 5MB</p>
                  </div>
                )}
              </div>
              <input id="imagen-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImagenChange} className="hidden" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all"
              style={{ backgroundColor: loading ? '#6b7280' : '#1a1f6e', color: 'white', boxShadow: '0 4px 15px rgba(26,31,110,0.3)', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Publicando...' : 'Publicar Producto'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}