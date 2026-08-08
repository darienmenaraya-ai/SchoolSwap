'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext({})

export function AppProvider({ children }) {
  const [idioma, setIdioma] = useState('es')
  const [tema, setTema] = useState('claro')
  const [traducciones, setTraducciones] = useState({})

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

  return (
    <AppContext.Provider value={{ idioma, tema, cambiarIdioma, cambiarTema, t }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}