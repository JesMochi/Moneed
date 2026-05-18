'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { supabase, Profile } from '@/lib/supabase'

// Leaflet requiere dynamic import sin SSR
const BusinessMap = dynamic(() => import('@/components/BusinessMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-xl bg-gray-100 animate-pulse flex items-center justify-center"
      style={{ height: 'calc(100vh - 160px)' }}>
      <p className="text-gray-400 text-sm">Cargando mapa...</p>
    </div>
  ),
})

interface CurrentUser {
  id: string
  lat: number
  lng: number
  role: string
  supply_radius_km: number
}

export default function MapPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [allProfiles, setAllProfiles] = useState<Profile[]>([])
  const [loading, setLoading]         = useState(true)

  // Coordenadas por defecto si el usuario no tiene ubicación (Monterrey, NL)
  const DEFAULT_LAT = 25.6691
  const DEFAULT_LNG = -100.3098

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: me } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .not('lat', 'is', null)

      // Si el usuario no tiene coordenadas, centra el mapa en la ubicación demo
      setCurrentUser({
        id:               me?.id ?? user.id,
        lat:              me?.lat ?? DEFAULT_LAT,
        lng:              me?.lng ?? DEFAULT_LNG,
        role:             me?.role ?? 'consumer',
        supply_radius_km: me?.supply_radius_km ?? 10,
      })
      setAllProfiles(profiles ?? [])
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  return (
    <div className="p-4 space-y-4">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-gray-800">Mapa inteligente</h1>
        <p className="text-gray-400 text-sm mt-0.5">Productores y negocios en tu red</p>
      </div>

      {loading && (
        <div className="w-full rounded-xl bg-gray-100 animate-pulse flex items-center justify-center"
          style={{ height: 'calc(100vh - 160px)' }}>
          <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
      )}

      {currentUser && !loading && (
        <BusinessMap currentUser={currentUser} allProfiles={allProfiles} />
      )}
    </div>
  )
}
