import { Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({ subsets: ['latin'], weights: ['400', '500', '600', '700', '800'] })

export const metadata = {
  title: 'Marketplace Escolar - Cedes Don Bosco',
  description: 'Comprá y vendé en tu colegio',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={nunito.className} style={{ backgroundColor: '#f5f7fa', color: '#1e293b' }}>
        {children}
      </body>
    </html>
  )
}