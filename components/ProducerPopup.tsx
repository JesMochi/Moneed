'use client'

import { useRouter } from 'next/navigation'
import { Profile } from '@/lib/supabase'

interface Props {
  profile: Profile
  distanceKm: number
  userRadius: number
  onClose: () => void
}

export default function ProducerPopup({ profile, distanceKm, userRadius, onClose }: Props) {
  const router = useRouter()
  const inRange = distanceKm <= userRadius

  const roleLabel: Record<string, string> = {
    producer_farm: '🌱 Productor agrícola',
    producer_artisan: '🏺 Artesano',
    business: '🏪 Negocio',
    consumer: '👤 Consumidor',
  }

  return (
    <div className="absolute bottom-4 left-3 right-3 z-[1000] bg-white rounded-2xl shadow-2xl p-4 border border-gray-100 animate-fade-up">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-base truncate">{profile.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {roleLabel[profile.role] ?? profile.role}
            {profile.category ? ` · ${profile.category}` : ''}
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-sm flex-shrink-0"
        >
          ✕
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-3 font-medium">
        📍 {distanceKm.toFixed(1)} km de ti
      </p>

      {inRange ? (
        <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
          ✅ Dentro de tu rango de suministro
        </span>
      ) : (
        <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
          ⚠️ Fuera de tu rango · {distanceKm.toFixed(1)} km
        </span>
      )}

      <button
        onClick={() => router.push(`/transfer?to=${profile.id}`)}
        className="w-full bg-red-600 text-white py-3 rounded-xl text-sm font-extrabold active:scale-95 transition-all shadow-md shadow-red-200"
      >
        Pagar con NodoCoins
      </button>
    </div>
  )
}
