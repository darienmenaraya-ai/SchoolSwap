export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#f0f4ff' }}>
      <div className="text-center">
        <div className="inline-block bg-white rounded-2xl px-8 py-4 shadow-lg mb-6">
          <img src="/logo.png" alt="SchoolSwap" style={{ height: '72px', width: 'auto' }} />
        </div>
        <div className="flex justify-center gap-1.5">
          {[0,1,2].map(i => (
            <div key={i} className="w-2.5 h-2.5 rounded-full animate-bounce"
              style={{ backgroundColor: '#1a1f6e', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <p className="mt-4 text-sm font-medium" style={{ color: '#6b7280' }}>Cargando...</p>
      </div>
    </main>
  )
}