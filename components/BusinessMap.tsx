'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import { supabase } from '@/lib/supabase'

interface Negocio {
  id: string
  name: string
  category: string
  lat: number
  lng: number
}

// Datos demo — Macroplaza de Monterrey, NL
const NEGOCIOS_DEMO: Negocio[] = [
  { id: 'd1', name: 'Cafetería El Buen Sabor', category: 'Cafetería', lat: 25.6691, lng: -100.3098 },
  { id: 'd2', name: 'Panadería La Tradicional', category: 'Panadería', lat: 25.6720, lng: -100.3150 },
  { id: 'd3', name: 'Abarrotes Don Chuy', category: 'Abarrotes', lat: 25.6660, lng: -100.3080 },
  { id: 'd4', name: 'Farmacia Comunitaria', category: 'Farmacia', lat: 25.6710, lng: -100.3200 },
  { id: 'd5', name: 'Mercado San Luisito', category: 'Mercado', lat: 25.6635, lng: -100.3120 },
]

export default function BusinessMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<{ remove: () => void } | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    async function initMap() {
      const L = (await import('leaflet')).default

      // Fix rutas de íconos de Leaflet en Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!).setView([25.6691, -100.3098], 14)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      // Intentar cargar negocios con coordenadas desde Supabase; usar demo como fallback
      const { data } = await supabase
        .from('profiles')
        .select('id, name, category, lat, lng')
        .eq('role', 'business')
        .not('lat', 'is', null)

      const negocios: Negocio[] = (data && data.length > 0)
        ? (data as Negocio[])
        : NEGOCIOS_DEMO

      const iconoRojo = L.divIcon({
        html: `<div style="
          background:#b91c1c;
          width:32px;height:32px;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          border:3px solid white;
          box-shadow:0 2px 6px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        className: '',
      })

      negocios.forEach(negocio => {
        const marker = L.marker([negocio.lat, negocio.lng], { icon: iconoRojo }).addTo(map)
        marker.bindPopup(`
          <div style="font-family:sans-serif;min-width:160px;padding:4px 0;">
            <p style="font-weight:700;font-size:14px;margin:0 0 4px;color:#1a1a1a;">${negocio.name}</p>
            <p style="color:#666;font-size:12px;margin:0 0 8px;">${negocio.category}</p>
            <span style="background:#b91c1c;color:white;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:600;">
              ✓ Acepta NodoCoins
            </span>
          </div>
        `)
      })
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div
      ref={mapRef}
      className="w-full rounded-xl overflow-hidden shadow-sm"
      style={{ height: 'calc(100vh - 160px)', minHeight: '400px' }}
    />
  )
}
