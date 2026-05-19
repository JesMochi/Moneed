import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Moneed',
  description: 'Circulación económica local — HackaTec 2026',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="font-serif">
        {children}
      </body>
    </html>
  )
}
