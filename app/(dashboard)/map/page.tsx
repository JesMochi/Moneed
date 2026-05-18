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
  const [allProfiles, setAllProfiles]  = useState<Profile[]>([])
  const [loading, setLoading]          = useState(true)
  const [noLocation, setNoLocation]    = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: me } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!me?.lat || !me?.lng) {
        setNoLocation(true)
        setLoading(false)
        return
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .not('lat', 'is', null)

      setCurrentUser({
        id:               me.id,
        lat:              me.lat,
        lng:              me.lng,
        role:             me.role,
        supply_radius_km: me.supply_radius_km ?? 10,
      })
      setAllProfiles(profiles ?? [])
      setLoading(false)
    }
    load()
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

      {noLocation && !loading && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-5xl">📍</span>
          <p className="font-bold text-gray-700">Sin ubicación registrada</p>
          <p className="text-gray-400 text-sm max-w-xs">
            Agrega tu latitud y longitud en tu perfil de Supabase para aparecer en el mapa.
          </p>
        </div>
      )}

      {currentUser && !loading && (
        <BusinessMap currentUser={currentUser} allProfiles={allProfiles} />
      )}
    </div>
  )
}
