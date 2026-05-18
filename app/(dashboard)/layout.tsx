'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/home', label: 'Inicio', icon: '🏠' },
  { href: '/transfer', label: 'Pagar', icon: '📷' },
  { href: '/receive', label: 'Cobrar', icon: '📲' },
  { href: '/history', label: 'Historial', icon: '📋' },
  { href: '/map', label: 'Mapa', icon: '🗺️' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 max-w-lg mx-auto">
      <main className="flex-1 pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-100 flex justify-around pt-2 pb-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                isActive ? 'text-red-700' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-red-700 mt-0.5" />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
