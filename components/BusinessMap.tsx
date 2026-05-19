'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase, Profile } from '@/lib/supabase'
import { getDistanceKm } from '@/lib/utils'
import SupplyRadiusControl from './SupplyRadiusControl'
import ProducerPopup from './ProducerPopup'

interface CurrentUser {
  id: string
  lat: number
  lng: number
  role: string
  supply_radius_km: number
}

interface Props {
  currentUser: CurrentUser
  allProfiles: Profile[]
}

// Colores e iconos por rol
const ROLE_CONFIG: Record<string, { color: string; emoji: string }> = {
  consumer:          { color: '#9ca3af', emoji: '👤' },
  business:          { color: '#2563eb', emoji: '🏪' },
  producer_farm:     { color: '#16a34a', emoji: '🌱' },
  producer_artisan:  { color: '#ea580c', emoji: '🏺' },
}

const PRODUCER_ROLES = ['producer_farm', 'producer_artisan']
const CONTROL_ROLES  = ['business', 'producer_farm', 'producer_artisan']

function divIconHtml(emoji: string, color: string, opacity: number) {
  return `<div style="
    background:${color};width:32px;height:32px;
    border-radius:50% 50% 50% 0;transform:rotate(-45deg);
    border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3);
    opacity:${opacity};display:flex;align-items:center;justify-content:center;
  "><span style="transform:rotate(45deg);font-size:13px;">${emoji}</span></div>`
}

export default function BusinessMap({ currentUser, allProfiles }: Props) {
  const mapDivRef    = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef       = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const circleRef    = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupRef     = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletRef   = useRef<any>(null)

  const [radius, setRadius]             = useState(currentUser.supply_radius_km || 10)
  const [selected, setSelected]         = useState<Profile | null>(null)
  const [selectedDist, setSelectedDist] = useState(0)
  const [saving, setSaving]             = useState(false)

  const producersInRange = allProfiles.filter(p =>
    PRODUCER_ROLES.includes(p.role) && p.lat && p.lng &&
    getDistanceKm(currentUser.lat, currentUser.lng, p.lat!, p.lng!) <= radius
  ).length

  // Dibuja (o redibuja) todos los markers del grupo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function drawMarkers(L: any, r: number) {
    if (!groupRef.current) return
    groupRef.current.clearLayers()

    allProfiles.forEach(profile => {
      if (!profile.lat || !profile.lng || profile.id === currentUser.id) return

      const dist    = getDistanceKm(currentUser.lat, currentUser.lng, profile.lat, profile.lng)
      const isProducer = PRODUCER_ROLES.includes(profile.role)
      const inRange = dist <= r
      const cfg     = ROLE_CONFIG[profile.role] ?? ROLE_CONFIG.consumer
      const opacity = isProducer && !inRange ? 0.3 : 1

      const icon = L.divIcon({
        html: divIconHtml(cfg.emoji, cfg.color, opacity),
        iconSize:   [32, 32],
        iconAnchor: [16, 32],
        className:  '',
      })

      const marker = L.marker([profile.lat, profile.lng], { icon })

      // Todos los negocios y productores abren el popup de pago React
      marker.on('click', () => {
        setSelected(profile)
        setSelectedDist(dist)
      })

      groupRef.current.addLayer(marker)
    })
  }

  // Inicializar mapa una sola vez
  useEffect(() => {
    if (mapRef.current) return
    async function init() {
      const L = (await import('leaflet')).default
      leafletRef.current = L

      // Fix rutas de íconos de Leaflet
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapDivRef.current!).setView([currentUser.lat, currentUser.lng], 13)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      // Círculo de radio
      circleRef.current = L.circle([currentUser.lat, currentUser.lng], {
        radius:      radius * 1000,
        color:       '#2563eb',
        fillColor:   '#2563eb',
        fillOpacity: 0.08,
        weight:      2,
      }).addTo(map)

      // Grupo de markers
      groupRef.current = L.layerGroup().addTo(map)
      drawMarkers(L, radius)

      // Marker del usuario actual (estrella amarilla)
      L.marker([currentUser.lat, currentUser.lng], {
        icon: L.divIcon({
          html: `<div style="
            background:#fbbf24;width:38px;height:38px;
            border-radius:50%;border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,.4);
            display:flex;align-items:center;justify-content:center;font-size:20px;
          ">⭐</div>`,
          iconSize:   [38, 38],
          iconAnchor: [19, 19],
          className:  '',
        }),
      }).addTo(map).bindPopup('<b>📍 Tú estás aquí</b>')
    }
    init().catch(err => console.error('Error al inicializar el mapa:', err))

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Actualizar círculo y markers cuando cambia el radio
  useEffect(() => {
    if (!leafletRef.current) return
    circleRef.current?.setRadius(radius * 1000)
    drawMarkers(leafletRef.current, radius)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius])

  async function handleSaveRadius() {
    setSaving(true)
    await supabase.from('profiles').update({ supply_radius_km: radius }).eq('id', currentUser.id)
    setSaving(false)
  }

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 160px)', minHeight: '400px' }}>
      <div ref={mapDivRef} className="w-full h-full rounded-xl overflow-hidden shadow-sm" />

      {CONTROL_ROLES.includes(currentUser.role) && (
        <SupplyRadiusControl
          radius={radius}
          onChange={r => { setRadius(r); setSelected(null) }}
          onSave={handleSaveRadius}
          producersInRange={producersInRange}
          saving={saving}
        />
      )}

      {selected && (
        <ProducerPopup
          profile={selected}
          distanceKm={selectedDist}
          userRadius={radius}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
