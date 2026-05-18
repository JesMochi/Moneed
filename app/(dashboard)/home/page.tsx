'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, Profile } from '@/lib/supabase'
import WalletCard from '@/components/WalletCard'
import ImpactDashboard from '@/components/ImpactDashboard'

const ACCIONES = [
  { href: '/transfer', label: 'Pagar', icon: '📷', desc: 'Escanear QR', roles: ['consumer', 'business'] },
  { href: '/receive', label: 'Cobrar', icon: '📲', desc: 'Generar QR', roles: ['business'] },
  { href: '/history', label: 'Historial', icon: '📋', desc: 'Movimientos', roles: ['consumer', 'business'] },
  { href: '/map', label: 'Mapa', icon: '🗺️', desc: 'Negocios', roles: ['consumer', 'business'] },
]

export default function HomePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }
    fetchProfile()
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400 text-sm">Cargando...</div>
      </div>
    )
  }

  if (!profile) return null

  const acciones = ACCIONES.filter(a => a.roles.includes(profile.role))

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center justify-between pt-2">
        <span className="text-xl font-bold text-red-700">MonedaRed</span>
        <button onClick={handleLogout} className="text-gray-400 text-sm font-semibold hover:text-gray-600">
          Salir
        </button>
      </div>

      <WalletCard profile={profile} />

      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-3">Acciones rápidas</h2>
        <div className="grid grid-cols-2 gap-3">
          {acciones.map(accion => (
            <Link key={accion.href} href={accion.href}>
              <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-transform">
                <span className="text-2xl">{accion.icon}</span>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-800">{accion.label}</p>
                  <p className="text-xs text-gray-400">{accion.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <ImpactDashboard />
    </div>
  )
}
