'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Package, Trash2, Plus, CheckCircle, Sun, Moon, Globe, Eye, EyeOff, Lock, Award } from 'lucide-react'
import { validateName, validatePassword, sanitizeText } from '@/lib/security'
import { useApp } from '@/lib/context'

export default function Perfil() {
  const router = useRouter()
  const { t, cambiarIdioma, cambiarTema, idioma, tema, mostrarToast } = useApp()
  const [perfil, setPerfil] = useState(null)
  const [productos, setProductos] = useState([])
  const [reputacion, setReputacion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [form, setForm] = useState({ nombre: '', apellido: '', correo: '' })
  const [passwordForm, setPasswordForm] = useState({ nueva: '', confirmar: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    async function cargarPerfil() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('usuario').select('*').eq('id_usuario', user.id).single()
      if (data) { setPerfil(data); setForm({ nombre: data.nombre, apellido: data.apellido, correo: data.correo }) }
      const { data: misProd } = await supabase.from('producto').select('*, categoria(nombre)').eq('id_usuario', user.id).order('created_at', { ascending: false })
      setProductos(misProd || [])
      const { data: reputacionData } = await supabase.rpc('obtener_reputacion_usuario', { p_id_usuario: user.id })
      setReputacion(reputacionData?.[0] || null)
      setLoading(false)
    }
    cargarPerfil()
  }, [])

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); setFieldErrors(p => ({ ...p, [e.target.name]: '' })) }

  function validate() {
    const errors = {}
    if (!validateName(form.nombre)) errors.nombre = idioma === 'es' ? 'Nombre inválido' : 'Invalid name'
    if (!validateName(form.apellido)) errors.apellido = idioma === 'es' ? 'Apellido inválido' : 'Invalid last name'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleGuardar(e) {
    e.preventDefault()
    if (!validate()) return
    setGuardando(true)
    const { error } = await supabase.from('usuario').update({ nombre: sanitizeText(form.nombre), apellido: sanitizeText(form.apellido) }).eq('id_usuario', perfil.id_usuario)
    const texto = error ? (idioma === 'es' ? 'Error al guardar' : 'Error saving') : t('profile', 'saved')
    setMensaje(texto)
    mostrarToast(texto, error ? 'error' : 'success')
    setTimeout(() => setMensaje(''), 3000)
    setGuardando(false)
  }

  async function eliminarProducto(id_producto) {
    if (!confirm(idioma === 'es' ? '¿Estás seguro que querés eliminar este producto?' : 'Are you sure you want to delete this product?')) return
    await supabase.from('producto').delete().eq('id_producto', id_producto)
    setProductos(productos.filter(p => p.id_producto !== id_producto))
  }

  async function handleCambiarContrasena(e) {
    e.preventDefault()
    const passwordErrors = validatePassword(passwordForm.nueva)
    if (passwordErrors.length > 0) {
      setPasswordError(idioma === 'es' ? `Contraseña inválida: ${passwordErrors.join(', ')}.` : `Invalid password: ${passwordErrors.join(', ')}.`)
      return
    }
    if (passwordForm.nueva !== passwordForm.confirmar) {
      setPasswordError(idioma === 'es' ? 'Las contraseñas no coinciden.' : 'Passwords do not match.')
      return
    }
    setChangingPassword(true)
    setPasswordError('')
    setPasswordMessage('')
    const { error } = await supabase.auth.updateUser({ password: passwordForm.nueva })
    if (error) {
      setPasswordError(idioma === 'es' ? 'No se pudo cambiar la contraseña. Intentá de nuevo.' : 'Unable to change the password. Try again.')
    } else {
      setPasswordForm({ nueva: '', confirmar: '' })
      setPasswordMessage(idioma === 'es' ? 'Contraseña actualizada correctamente.' : 'Password updated successfully.')
      mostrarToast(idioma === 'es' ? 'Contraseña actualizada correctamente.' : 'Password updated successfully.')
    }
    setChangingPassword(false)
  }

  if (loading) return <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-principal)' }}><p style={{ color: 'var(--texto-suave)' }}>{t('common', 'loading')}</p></main>

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
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--azul)' }}><User size={28} /> {t('profile', 'title')}</h1>
        {reputacion && <div className="border rounded-3xl p-5 mb-6 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
          <div className="flex items-center gap-2 mb-3"><Award size={20} style={{ color: '#d97706' }} /><h2 className="text-lg font-bold" style={{ color: 'var(--azul)' }}>{idioma === 'es' ? 'Mi reputación' : 'My reputation'}</h2></div>
          <div className="flex flex-wrap gap-2">
            {reputacion.productos_publicados > 0 && <span className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: 'var(--azul-claro)', color: 'var(--azul)' }}>{idioma === 'es' ? 'Vendedor activo' : 'Active seller'} · {reputacion.productos_publicados}</span>}
            {reputacion.ventas_completadas > 0 && <span className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: '#f0fdf4', color: '#166534' }}>{idioma === 'es' ? 'Compras completadas' : 'Completed sales'} · {reputacion.ventas_completadas}</span>}
            {reputacion.trueques_aceptados > 0 && <span className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: '#f5f3ff', color: '#6d28d9' }}>{idioma === 'es' ? 'Truequeador' : 'Trader'} · {reputacion.trueques_aceptados}</span>}
            {reputacion.productos_publicados === 0 && reputacion.ventas_completadas === 0 && reputacion.trueques_aceptados === 0 && <span className="text-sm" style={{ color: 'var(--texto-suave)' }}>{idioma === 'es' ? 'Publicá o intercambiá productos para obtener insignias.' : 'Publish or trade products to earn badges.'}</span>}
          </div>
        </div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-3xl p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
            <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--azul)' }}>{t('profile', 'personalData')}</h2>
            {mensaje && <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm" style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #86efac' }}><CheckCircle size={16} /> {mensaje}</div>}
            <form onSubmit={handleGuardar} className="space-y-4" noValidate>
              {[
                { name: 'nombre', label: t('profile', 'name') },
                { name: 'apellido', label: t('profile', 'lastName') },
              ].map(({ name, label }) => (
                <div key={name}>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-principal)' }}>{label}</label>
                  <input type="text" name={name} value={form[name]} onChange={handleChange} className="w-full rounded-xl p-3 text-sm border-2 outline-none" style={{ borderColor: fieldErrors[name] ? '#fca5a5' : 'var(--borde-input)', color: 'var(--texto-principal)', backgroundColor: 'var(--bg-input)' }} maxLength={50} />
                  {fieldErrors[name] && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fieldErrors[name]}</p>}
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-principal)' }}>{t('profile', 'email')}</label>
                <input type="email" value={form.correo} disabled className="w-full rounded-xl p-3 text-sm border-2" style={{ borderColor: 'var(--borde)', color: 'var(--texto-suave)', backgroundColor: tema === 'oscuro' ? '#252840' : '#f3f4f6', cursor: 'not-allowed' }} />
                <p className="text-xs mt-1" style={{ color: 'var(--texto-suave)' }}>{t('profile', 'emailNote')}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-principal)' }}>{t('profile', 'role')}</label>
                <input type="text" value={perfil?.rol} disabled className="w-full rounded-xl p-3 text-sm border-2 capitalize" style={{ borderColor: 'var(--borde)', color: 'var(--texto-suave)', backgroundColor: tema === 'oscuro' ? '#252840' : '#f3f4f6', cursor: 'not-allowed' }} />
              </div>
              <button type="submit" disabled={guardando} className="w-full py-3 rounded-xl font-bold text-sm transition-all" style={{ backgroundColor: 'var(--azul)', color: 'white', boxShadow: '0 4px 15px rgba(26,31,110,0.3)' }}>
                {guardando ? t('profile', 'saving') : t('profile', 'saveChanges')}
              </button>
            </form>
          </div>
          <div className="border rounded-3xl p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: 'var(--azul)' }}>{t('profile', 'myProducts')}</h2>
              <Link href="/productos/nuevo" className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--azul-claro)', color: 'var(--azul-medio)' }}><Plus size={14} /> {t('profile', 'publish')}</Link>
            </div>
            {productos.length === 0 ? (
              <div className="text-center py-10"><Package size={40} className="mx-auto mb-2" style={{ color: 'var(--borde)' }} /><p className="text-sm" style={{ color: 'var(--texto-suave)' }}>{t('profile', 'noProducts')}</p></div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {productos.map((producto) => (
                  <div key={producto.id_producto} className="flex items-center gap-3 rounded-xl p-3 border" style={{ borderColor: 'var(--borde)', backgroundColor: 'var(--bg-hover)' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0" style={{ backgroundColor: tema === 'oscuro' ? '#252840' : '#f8faff' }}>
                      {producto.imagen ? <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" /> : <Package size={20} style={{ color: 'var(--borde)' }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--texto-principal)' }}>{producto.nombre}</p>
                      <p className="text-xs font-bold" style={{ color: 'var(--azul-medio)' }}>₡{Number(producto.precio).toLocaleString()}</p>
                    </div>
                    <button onClick={() => eliminarProducto(producto.id_producto)} className="p-2 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={15} style={{ color: 'var(--texto-suave)' }} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border rounded-3xl p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--borde)' }}>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--azul)' }}><Lock size={19} /> {idioma === 'es' ? 'Cambiar contraseña' : 'Change password'}</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--texto-suave)' }}>{idioma === 'es' ? 'Usá una contraseña segura que no compartás con nadie.' : 'Use a secure password that you do not share with anyone.'}</p>
            {passwordError && <div className="p-3 rounded-xl mb-4 text-sm" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>{passwordError}</div>}
            {passwordMessage && <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm" style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #86efac' }}><CheckCircle size={16} /> {passwordMessage}</div>}
            <form onSubmit={handleCambiarContrasena} className="space-y-4" noValidate>
              {[{ key: 'nueva', label: idioma === 'es' ? 'Nueva contraseña' : 'New password', visible: showNewPassword, setVisible: setShowNewPassword }, { key: 'confirmar', label: idioma === 'es' ? 'Confirmar contraseña' : 'Confirm password', visible: showConfirmPassword, setVisible: setShowConfirmPassword }].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-principal)' }}>{field.label}</label>
                  <div className="relative">
                    <input type={field.visible ? 'text' : 'password'} value={passwordForm[field.key]} onChange={(e) => { setPasswordForm({ ...passwordForm, [field.key]: e.target.value }); setPasswordError(''); setPasswordMessage('') }} className="w-full rounded-xl p-3 pr-11 text-sm border-2 outline-none" style={{ borderColor: 'var(--borde-input)', color: 'var(--texto-principal)', backgroundColor: 'var(--bg-input)' }} placeholder="••••••••" maxLength={128} autoComplete="new-password" />
                    <button type="button" onClick={() => field.setVisible(!field.visible)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-suave)' }} aria-label={field.visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{field.visible ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                </div>
              ))}
              <p className="text-xs" style={{ color: 'var(--texto-suave)' }}>{idioma === 'es' ? 'Mínimo 8 caracteres, una mayúscula y un número.' : 'At least 8 characters, one uppercase letter and one number.'}</p>
              <button type="submit" disabled={changingPassword} className="w-full py-3 rounded-xl font-bold text-sm transition-all" style={{ backgroundColor: changingPassword ? '#6b7280' : 'var(--azul)', color: 'white', cursor: changingPassword ? 'not-allowed' : 'pointer' }}>{changingPassword ? (idioma === 'es' ? 'Actualizando...' : 'Updating...') : (idioma === 'es' ? 'Actualizar contraseña' : 'Update password')}</button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
