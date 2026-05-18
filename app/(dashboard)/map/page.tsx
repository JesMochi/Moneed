'use client'

import BusinessMap from '@/components/BusinessMap'

export default function MapPage() {
  return (
    <div className="p-4 space-y-4">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-gray-800">Mapa de negocios</h1>
        <p className="text-gray-400 text-sm mt-0.5">Negocios que aceptan NodoCoins</p>
      </div>
      <BusinessMap />
    </div>
  )
}
