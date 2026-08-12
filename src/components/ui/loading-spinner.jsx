export function LoadingSpinner({ label = 'Cargando...', size = 18 }) {
  return (
    <span className="inline-flex items-center justify-center gap-2" role="status" aria-live="polite">
      <span className="rounded-full border-2 border-current border-t-transparent animate-spin" style={{ width: size, height: size }} />
      {label && <span>{label}</span>}
    </span>
  )
}
