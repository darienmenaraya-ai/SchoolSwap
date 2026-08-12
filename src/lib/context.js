'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { CheckCircle, X, XCircle } from 'lucide-react'

const AppContext = createContext({})

export function AppProvider({ children }) {
  const [idioma, setIdioma] = useState('es')
  const [tema, setTema] = useState('claro')
  const [traducciones, setTraducciones] = useState({})
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const idiomaGuardado = localStorage.getItem('schoolswap_idioma') || 'es'
    const temaGuardado = localStorage.getItem('schoolswap_tema') || 'claro'
    setIdioma(idiomaGuardado)
    setTema(temaGuardado)
    cargarTraducciones(idiomaGuardado)
    aplicarTema(temaGuardado)
  }, [])

  async function cargarTraducciones(lang) {
    const msgs = lang === 'es'
      ? await import('../../messages/es.json')
      : await import('../../messages/en.json')
    setTraducciones(msgs.default)
  }

  function aplicarTema(t) {
    if (t === 'oscuro') {
      document.documentElement.setAttribute('data-tema', 'oscuro')
    } else {
      document.documentElement.setAttribute('data-tema', 'claro')
    }
  }

  function cambiarIdioma() {
    const nuevo = idioma === 'es' ? 'en' : 'es'
    setIdioma(nuevo)
    localStorage.setItem('schoolswap_idioma', nuevo)
    cargarTraducciones(nuevo)
  }

  function cambiarTema() {
    const nuevo = tema === 'claro' ? 'oscuro' : 'claro'
    setTema(nuevo)
    localStorage.setItem('schoolswap_tema', nuevo)
    aplicarTema(nuevo)
  }

  function t(seccion, clave) {
    return traducciones?.[seccion]?.[clave] || clave
  }

  function mostrarToast(texto, tipo = 'success') {
    const id = Date.now()
    setToast({ id, texto, tipo })
    window.setTimeout(() => {
      setToast(actual => actual?.id === id ? null : actual)
    }, 4000)
  }

  return (
    <AppContext.Provider value={{ idioma, tema, cambiarIdioma, cambiarTema, mostrarToast, t }}>
      {children}
      {toast && (
        <div className="fixed z-[100] top-4 right-4 left-4 sm:left-auto sm:w-96 rounded-2xl border p-4 shadow-xl flex items-start gap-3 animate-in slide-in-from-top-2 fade-in duration-200"
          style={{ backgroundColor: toast.tipo === 'error' ? '#fef2f2' : 'var(--bg-card)', borderColor: toast.tipo === 'error' ? '#fecaca' : '#86efac', color: toast.tipo === 'error' ? '#b91c1c' : 'var(--texto-principal)' }}>
          {toast.tipo === 'error' ? <XCircle size={20} className="mt-0.5 flex-shrink-0" style={{ color: '#dc2626' }} /> : <CheckCircle size={20} className="mt-0.5 flex-shrink-0" style={{ color: '#16a34a' }} />}
          <p className="flex-1 text-sm font-medium">{toast.texto}</p>
          <button onClick={() => setToast(null)} className="p-0.5 rounded-md" style={{ color: 'var(--texto-suave)' }} aria-label="Cerrar notificación"><X size={18} /></button>
        </div>
      )}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
