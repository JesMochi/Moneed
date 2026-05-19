'use client'

import { useRouter } from 'next/navigation'
import { Profile } from '@/lib/supabase'

interface Props {
  profile: Profile
  distanceKm: number
  userRadius: number
  onClose: () => void
}

const ROLE_LABEL: Record<string, string> = {
  producer_farm:    '🌱 Productor agrícola',
  producer_artisan: '🏺 Artesano',
  business:         '🏪 Negocio',
  consumer:         '👤 Consumidor',
}

export default function ProducerPopup({ profile, distanceKm, userRadius, onClose }: Props) {
  const router = useRouter()
  const inRange  = distanceKm <= userRadius
  const isDemo   = profile.id.startsWith('demo-')

  function handleActivar() {
    const params = new URLSearchParams({
      nombre:    profile.name,
      categoria: profile.category ?? '',
      rol:       profile.role,
    })
    router.push(`/register?${params.toString()}`)
  }

  return (
    <div className="absolute bottom-4 left-3 right-3 z-[1000] bg-white rounded-2xl shadow-2xl p-4 border border-gray-100 animate-fade-up">
      {/* Encabezado */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-base truncate">{profile.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {ROLE_LABEL[profile.role] ?? profile.role}
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

      {/* Distancia */}
      <p className="text-sm text-gray-600 mb-3 font-medium">
        📍 {distanceKm.toFixed(1)} km de ti
      </p>

      {/* Badge rango */}
      {inRange ? (
        <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
          ✅ Dentro de tu rango de suministro
        </span>
      ) : (
        <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
          ⚠️ Fuera de tu rango · {distanceKm.toFixed(1)} km
        </span>
      )}

      {isDemo ? (
        /* Negocio demo — no tiene cuenta real aún */
        <div className="space-y-2">
          <div className="bg-blue-50 rounded-xl px-3 py-2 text-center">
            <p className="text-xs text-blue-700 font-semibold">
              Este negocio aún no está registrado en Moneed
            </p>
          </div>
          <button
            onClick={handleActivar}
            className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-extrabold active:scale-95 transition-all shadow-md shadow-blue-200"
          >
            ✨ Registrar y activar este negocio
          </button>
          <p className="text-xs text-gray-400 text-center">
            Crea la cuenta del negocio y genera su QR de cobro
          </p>
        </div>
      ) : (
        /* Negocio real — puede recibir pagos */
        <button
          onClick={() => router.push('/transfer')}
          className="w-full bg-red-600 text-white py-3 rounded-xl text-sm font-extrabold active:scale-95 transition-all shadow-md shadow-red-200"
        >
          Pagar con NodoCoins
        </button>
      )}
    </div>
  )
}
