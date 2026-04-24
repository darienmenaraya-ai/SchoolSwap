import { Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({ subsets: ['latin'] })

export const metadata = {
  title: 'SchoolSwap - Cedes Don Bosco',
  description: 'Comprá y vendé en tu colegio',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={nunito.className} style={{ backgroundColor: '#f5f7ff', color: '#1a1f6e' }}>
        {children}
      </body>
    </html>
  )
}