'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ImagePlus, Sun, Moon, Globe } from 'lucide-react'
import { sanitizeText, validatePrice, validateStock } from '@/lib/security'
import { useApp } from '@/lib/context'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024

export default function NuevoProducto() {
  const router = useRouter()
  const { t, cambiarIdioma, cambiarTema, idioma, tema, mostrarToast } = useApp()
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [imagenesPreview, setImagenesPreview] = useState([])
  const [imagenesFiles, setImagenesFiles] = useState([])
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', id_categoria: '', condicion: 'usado' })

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('categoria').select('*').order('nombre')
      setCategorias(data || [])
    }
    init()
  }, [])

  function validarCampo(nombre, valor) {
    const esEs = idioma === 'es'
    if (nombre === 'nombre') return !valor.trim() || valor.trim().length < 3 ? (esEs ? 'Mínimo 3 caracteres' : 'Minimum 3 characters') : ''
    if (nombre === 'descripcion') return !valor.trim() || valor.trim().length < 10 ? (esEs ? 'Mínimo 10 caracteres' : 'Minimum 10 characters') : ''
    if (nombre === 'precio') return !validatePrice(valor) ? (esEs ? 'Precio inválido' : 'Invalid price') : ''
    if (nombre === 'stock') return !validateStock(valor) ? (esEs ? 'Stock inválido' : 'Invalid stock') : ''
    if (nombre === 'id_categoria') return !valor ? (esEs ? 'Seleccioná una categoría' : 'Select a category') : ''
    return ''
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    setFieldErrors(p => ({ ...p, [name]: validarCampo(name, value) }))
  }

  function handleImagenChange(e) {
    const seleccionadas = Array.from(e.target.files || [])
    const disponibles = 3 - imagenesFiles.length
    if (seleccionadas.length > disponibles) { setError(idioma === 'es' ? 'Podés subir un máximo de 3 imágenes.' : 'You can upload up to 3 images.'); return }
    for (const file of seleccionadas) {
      if (!ALLOWED_TYPES.includes(file.type)) { setError(idioma === 'es' ? 'Solo imágenes JPG, PNG, WEBP o GIF' : 'Only JPG, PNG, WEBP or GIF images'); return }
      if (file.size > MAX_SIZE) { setError(idioma === 'es' ? 'Cada imagen no puede superar los 5MB' : 'Each image cannot exceed 5MB'); return }
    }
    setImagenesFiles(prev => [...prev, ...seleccionadas])
    setImagenesPreview(prev => [...prev, ...seleccionadas.map(file => URL.createObjectURL(file))])
    setError('')
  }

  function eliminarImagen(index) {
    URL.revokeObjectURL(imagenesPreview[index])
    setImagenesFiles(prev => prev.filter((_, i) => i !== index))
    setImagenesPreview(prev => prev.filter((_, i) => i !== index))
  }

  function validate() {
    const errors = {}
    const esEs = idioma === 'es'
    if (!form.nombre.trim() || form.nombre.trim().length < 3) errors.nombre = esEs ? 'Mínimo 3 caracteres' : 'Minimum 3 characters'
    if (!form.descripcion.trim() || form.descripcion.trim().length < 10) errors.descripcion = esEs ? 'Mínimo 10 caracteres' : 'Minimum 10 characters'
    if (!validatePrice(form.precio)) errors.precio = esEs ? 'Precio inválido' : 'Invalid price'
    if (!validateStock(form.stock)) errors.stock = esEs ? 'Stock inválido' : 'Invalid stock'
    if (!form.id_categoria) errors.id_categoria = esEs ? 'Seleccioná una categoría' : 'Select a category'
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
    const imagenes = []
    for (const [index, file] of imagenesFiles.entries()) {
      const ext = file.name.split('.').pop().toLowerCase()
      const nombre = `${user.id}-${Date.now()}-${index + 1}.${ext}`
      const { error: uploadError } = await supabase.storage.from('productos').upload(nombre, file, { contentType: file.type, upsert: false })
      if (uploadError) { setError(idioma === 'es' ? 'Error al subir las imágenes' : 'Error uploading images'); setLoading(false); return }
      const { data: urlData } = supabase.storage.from('productos').getPublicUrl(nombre)
      imagenes.push(urlData.publicUrl)
    }
    const { data: producto, error: dbError } = await supabase.from('producto').insert({
      nombre: sanitizeText(form.nombre), descripcion: sanitizeText(form.descripcion),
      precio: parseFloat(form.precio), stock: parseInt(form.stock),
      id_categoria: form.id_categoria, condicion: form.condicion, imagen: imagenes[0] || '', id_usuario: user.id, estado: 'publicado',
    }).select('id_producto').single()
    if (dbError) { setError(idioma === 'es' ? 'Error al publicar' : 'Error publishing'); setLoading(false); return }
    if (imagenes.length > 0) {
      const { error: imagenesError } = await supabase.from('producto_imagen').insert(imagenes.map((url, index) => ({ id_producto: producto.id_producto, url, orden: index + 1 })))
      if (imagenesError) { setError(idioma === 'es' ? 'El producto se publicó, pero no se pudieron guardar todas las imágenes.' : 'The product was published, but not all images could be saved.'); setLoading(false); return }
    }
    mostrarToast(idioma === 'es' ? 'Producto publicado correctamente.' : 'Product published successfully.')
    router.push('/')
  }

  const estiloInput = (field) => ({ borderColor: fieldErrors[field] ? '#fca5a5' : 'var(--borde-input)', color: 'var(--texto-principal)', backgroundColor: 'var(--bg-input)' })

  return (
    <main style={{ backgroundColor: 'var(--bg-principal)', minHeight: '100vh' }}>
      <nav style={{ backgroundColor: 'var(--bg-nav)', boxShadow: '0 2px 20px rgba(26,31,110,0.3)' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between">
          <Link href="/"><div className="bg-white rounded-xl px-3 py-1 shadow-md"><img src="/logo.png" alt="SchoolSwap" style={{ height: '80px', width: 'auto', display: 'block' }} /></div></Link>
          <div className="flex items-center gap-2">
            <button onClick={cambiarIdioma} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-white text-xs font-bold border border-white border-opacity-30"><Globe size={13} /> {idioma === 'es' ? 'EN' : 'ES'}</button>
            <button onClick={cambiarTema} className="p-1.5 rounded-lg text-white border border-white border-opacity-30">{tema === 'claro' ? <Moon size={15} /> : <Sun size={15} />}</button>
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-white hover:opacity-80"><ArrowLeft size={16} /> {t('common', 'back')}</Link>
          </div>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="rounded-3xl shadow-xl p-8 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--azul)' }}>{t('product', 'publish')}</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--texto-suave)' }}>{t('product', 'fillData')}</p>
          {error && <div className="p-3 rounded-xl mb-4 text-sm" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-principal)' }}>{t('product', 'productName')}</label>
              <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className="w-full rounded-xl p-3 text-sm border-2 outline-none" style={estiloInput('nombre')} placeholder={idioma === 'es' ? 'Ej: Calculadora científica' : 'E.g.: Scientific calculator'} maxLength={100} />
              {fieldErrors.nombre && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.nombre}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-principal)' }}>{t('product', 'description')}</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={4} className="w-full rounded-xl p-3 text-sm border-2 outline-none resize-none" style={estiloInput('descripcion')} placeholder={idioma === 'es' ? 'Describí el estado y características...' : 'Describe the condition and features...'} maxLength={500} />
              {fieldErrors.descripcion && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.descripcion}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-principal)' }}>{t('product', 'price')} (₡)</label>
                <input type="number" name="precio" value={form.precio} onChange={handleChange} className="w-full rounded-xl p-3 text-sm border-2 outline-none" style={estiloInput('precio')} placeholder="0" min="0" max="10000000" />
                {fieldErrors.precio && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.precio}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-principal)' }}>{t('product', 'stock')}</label>
                <input type="number" name="stock" value={form.stock} onChange={handleChange} className="w-full rounded-xl p-3 text-sm border-2 outline-none" style={estiloInput('stock')} placeholder="0" min="0" max="99999" />
                {fieldErrors.stock && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.stock}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-principal)' }}>{t('product', 'category')}</label>
              <select name="id_categoria" value={form.id_categoria} onChange={handleChange} className="w-full rounded-xl p-3 text-sm border-2 outline-none" style={estiloInput('id_categoria')}>
                <option value="">{t('product', 'selectCategory')}</option>
                {categorias.map((cat) => (<option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>))}
              </select>
              {fieldErrors.id_categoria && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors.id_categoria}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-principal)' }}>{t('product', 'condition')}</label>
              <select name="condicion" value={form.condicion} onChange={handleChange} className="w-full rounded-xl p-3 text-sm border-2 outline-none" style={estiloInput('condicion')}>
                <option value="nuevo">{t('product', 'new')}</option>
                <option value="usado">{t('product', 'used')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-principal)' }}>{t('product', 'image')} <span className="font-normal" style={{ color: 'var(--texto-suave)' }}>(0-3)</span></label>
              {imagenesPreview.length > 0 && <div className="grid grid-cols-3 gap-3 mb-3">{imagenesPreview.map((preview, index) => <div key={preview} className="relative"><img src={preview} alt={`Vista previa ${index + 1}`} className="w-full h-24 object-cover rounded-xl" /><button type="button" onClick={() => eliminarImagen(index)} className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold" style={{ backgroundColor: '#dc2626', color: 'white' }}>×</button></div>)}</div>}
              {imagenesPreview.length < 3 && <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:opacity-80 transition" style={{ borderColor: 'var(--azul-medio)', backgroundColor: tema === 'oscuro' ? 'var(--bg-input)' : '#f8faff' }} onClick={() => document.getElementById('imagen-input').click()}>
                <div className="space-y-2"><ImagePlus size={40} className="mx-auto" style={{ color: 'var(--azul-medio)' }} /><p className="text-sm font-medium" style={{ color: 'var(--texto-principal)' }}>{imagenesPreview.length ? t('product', 'clickChange') : t('product', 'clickUpload')}</p><p className="text-xs" style={{ color: 'var(--texto-suave)' }}>{t('product', 'imageFormats')} · Máx. 3</p></div>
              </div>
              }
              <input id="imagen-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImagenChange} className="hidden" multiple />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-bold text-sm transition-all" style={{ backgroundColor: loading ? '#6b7280' : 'var(--azul)', color: 'white', boxShadow: '0 4px 15px rgba(26,31,110,0.3)', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? <LoadingSpinner label={t('product', 'publishing')} size={16} /> : t('product', 'publish')}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
