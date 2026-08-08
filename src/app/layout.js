import { Poppins } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/lib/context'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata = {
  title: 'SchoolSwap - Cedes Don Bosco',
  description: 'El marketplace oficial del Colegio Cedes Don Bosco',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={poppins.className}>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}