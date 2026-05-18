'use client'

import { Profile } from '@/lib/supabase'
import { formatNC, diasParaVencer } from '@/lib/utils'

interface Props {
  profile: Profile
}

export default function WalletCard({ profile }: Props) {
  const dias = diasParaVencer(profile.created_at)

  return (
    <div className="bg-red-700 rounded-2xl p-5 text-white shadow-lg animate-fade-up">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-red-200 text-sm">Hola, {profile.name}</p>
          <p className="text-xs text-red-300 mt-0.5">
            {profile.role === 'business' ? `Negocio · ${profile.category}` : 'Consumidor'}
          </p>
        </div>
        <span className="text-2xl">🔴</span>
      </div>

      <div className="mt-5">
        <p className="text-red-200 text-xs uppercase tracking-wider">Tu saldo</p>
        <p className="text-4xl font-bold mt-1">{formatNC(profile.balance)}</p>
        <p className="text-red-300 text-xs mt-1">1 NodoCoin = 1 peso mexicano</p>
      </div>

      <div className={`mt-4 rounded-lg px-3 py-2 flex items-center gap-2 ${dias <= 5 ? 'bg-yellow-500/30' : 'bg-red-800'}`}>
        <span className="text-sm">{dias <= 5 ? '⚠️' : '⏰'}</span>
        <p className="text-red-100 text-xs">
          {dias > 0
            ? `Tus créditos expiran en ${dias} día${dias === 1 ? '' : 's'}`
            : 'Tus créditos han expirado — contacta a tu red'}
        </p>
      </div>
    </div>
  )
}
