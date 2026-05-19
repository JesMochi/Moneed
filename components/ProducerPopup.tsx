'use client'

import { useState } from 'react'
import { supabase, Profile } from '@/lib/supabase'
import { formatNC } from '@/lib/utils'

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

type Step = 'info' | 'paying' | 'success' | 'error'

export default function ProducerPopup({ profile, distanceKm, userRadius, onClose }: Props) {
  const inRange = distanceKm <= userRadius
  const [step, setStep]     = useState<Step>('info')
  const [amount, setAmount] = useState('')
  const [note, setNote]     = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function pagar() {
    if (!amount || Number(amount) <= 0) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { error } = await supabase.rpc('transfer_nocoins', {
      sender:   user.id,
      receiver: profile.id,
      amount:   Number(amount),
      note:     note.trim() || `Pago a ${profile.name}`,
    })

    setLoading(false)
    if (error) {
      setErrorMsg(
        error.message.includes('insuficiente')
          ? 'Saldo insuficiente'
          : 'No se pudo completar el pago'
      )
      setStep('error')
    } else {
      setStep('success')
    }
  }

  /* ── Éxito ── */
  if (step === 'success') {
    return (
      <div className="absolute bottom-4 left-3 right-3 z-[1000] bg-white rounded-2xl shadow-2xl p-5 border border-gray-100 animate-fade-up">
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">✅</div>
          <div className="text-center">
            <p className="font-extrabold text-gray-800 text-lg">¡Pago exitoso!</p>
            <p className="text-gray-500 text-sm mt-1">
              Enviaste <span className="font-bold text-red-600">{formatNC(Number(amount))}</span> a {profile.name}
            </p>
          </div>
          <button onClick={onClose} className="mt-1 bg-gray-100 text-gray-600 font-bold text-sm px-6 py-2 rounded-xl">
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  /* ── Error ── */
  if (step === 'error') {
    return (
      <div className="absolute bottom-4 left-3 right-3 z-[1000] bg-white rounded-2xl shadow-2xl p-5 border border-gray-100 animate-fade-up">
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl">❌</div>
          <div className="text-center">
            <p className="font-extrabold text-gray-800 text-lg">Error</p>
            <p className="text-gray-500 text-sm mt-1">{errorMsg}</p>
          </div>
          <div className="flex gap-2 mt-1 w-full">
            <button onClick={() => setStep('paying')} className="flex-1 bg-red-600 text-white font-bold text-sm py-2.5 rounded-xl">
              Reintentar
            </button>
            <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-600 font-bold text-sm py-2.5 rounded-xl">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Formulario de pago ── */
  if (step === 'paying') {
    return (
      <div className="absolute bottom-4 left-3 right-3 z-[1000] bg-white rounded-2xl shadow-2xl p-4 border border-gray-100 animate-fade-up">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="font-extrabold text-gray-800">{profile.name}</p>
            <p className="text-xs text-gray-400">{profile.category}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">✕</button>
        </div>

        {/* Input de monto */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Monto (NodoCoins)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="mt-1 w-full border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-2xl font-black text-red-600 text-center focus:outline-none focus:border-red-400 bg-gray-50"
              placeholder="0.00"
              min="0.5"
              step="0.5"
              inputMode="decimal"
              autoFocus
            />
            <p className="text-xs text-gray-400 text-center mt-1">1 NodoCoin = 1 peso</p>
          </div>

          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none focus:border-red-300 bg-gray-50"
            placeholder="Nota (opcional)"
          />

          <div className="flex gap-2">
            <button
              onClick={() => setStep('info')}
              disabled={loading}
              className="flex-1 border-2 border-gray-200 text-gray-500 py-3 rounded-xl font-bold text-sm"
            >
              Atrás
            </button>
            <button
              onClick={pagar}
              disabled={loading || !amount || Number(amount) <= 0}
              className="flex-[2] bg-red-600 text-white py-3 rounded-xl font-extrabold text-sm disabled:opacity-50 active:scale-95 transition-all"
            >
              {loading ? 'Pagando...' : amount && Number(amount) > 0 ? `Pagar ${formatNC(Number(amount))}` : 'Ingresa monto'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Info del negocio ── */
  return (
    <div className="absolute bottom-4 left-3 right-3 z-[1000] bg-white rounded-2xl shadow-2xl p-4 border border-gray-100 animate-fade-up">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-gray-800 text-base truncate">{profile.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {ROLE_LABEL[profile.role] ?? profile.role}
            {profile.category ? ` · ${profile.category}` : ''}
          </p>
        </div>
        <button onClick={onClose} className="ml-2 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-sm flex-shrink-0">
          ✕
        </button>
      </div>

      <p className="text-sm text-gray-500 font-medium mb-3">
        📍 {distanceKm.toFixed(1)} km de ti
      </p>

      {inRange ? (
        <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
          ✅ Dentro de tu rango
        </span>
      ) : (
        <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
          ⚠️ Fuera de tu rango · {distanceKm.toFixed(1)} km
        </span>
      )}

      <button
        onClick={() => setStep('paying')}
        className="w-full bg-red-600 text-white py-3.5 rounded-xl font-extrabold text-base active:scale-95 transition-all shadow-md shadow-red-200"
      >
        💳 Pagar con NodoCoins
      </button>
    </div>
  )
}
