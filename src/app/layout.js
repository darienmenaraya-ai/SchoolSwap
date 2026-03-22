import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Marketplace Escolar - Cedes Don Bosco',
  description: 'Comprá y vendé en tu colegio',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-[#0f0f0f] text-white`}>
        {children}
      </body>
    </html>
  )
}