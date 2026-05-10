import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)' }}>
      <div className="text-center max-w-md">
        <div className="inline-block bg-white rounded-2xl px-8 py-4 shadow-lg mb-8">
          <img src="/logo.png" alt="SchoolSwap" style={{ height: '72px', width: 'auto' }} />
        </div>
        <h1 className="text-8xl font-extrabold mb-4" style={{ color: '#1a1f6e' }}>404</h1>
        <h2 className="text-2xl font-bold mb-3" style={{ color: '#374151' }}>Página no encontrada</h2>
        <p className="text-sm mb-8" style={{ color: '#6b7280' }}>
          La página que buscás no existe o fue movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all"
            style={{ backgroundColor: '#1a1f6e', color: 'white', boxShadow: '0 4px 15px rgba(26,31,110,0.3)' }}>
            <Home size={16} /> Ir al inicio
          </Link>
          <Link href="/auth/login" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border-2 transition-all"
            style={{ borderColor: '#1a1f6e', color: '#1a1f6e', backgroundColor: 'white' }}>
            <Search size={16} /> Iniciar sesión
          </Link>
        </div>
      </div>
    </main>
  )
}