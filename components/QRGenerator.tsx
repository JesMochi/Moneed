'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { supabase } from '@/lib/supabase'
import { formatNC } from '@/lib/utils'

interface ProfileBasic {
  id: string
  name: string
}

export default function QRGenerator() {
  const [amount, setAmount] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [profile, setProfile] = useState<ProfileBasic | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('profiles')
        .select('id, name')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setProfile(data))
    })
  }, [])

  async function generarQR() {
    if (!profile || !amount || Number(amount) <= 0) return
    setLoading(true)

    const qrData = JSON.stringify({
      receiverId: profile.id,
      amount: Number(amount),
      name: profile.name,
    })

    const url = await QRCode.toDataURL(qrData, { width: 300, margin: 2, color: { dark: '#7f1d1d' } })
    setQrDataUrl(url)
    setLoading(false)
  }

  function limpiar() {
    setQrDataUrl('')
    setAmount('')
  }

  return (
    <div className="space-y-4">
      {!qrDataUrl ? (
        <>
          <div>
            <label className="text-sm font-medium text-gray-700">Monto a cobrar (NodoCoins)</label>
            <div className="mt-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">NC</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="0.00"
                min="1"
                step="0.5"
              />
            </div>
          </div>

          <button
            onClick={generarQR}
            disabled={!amount || Number(amount) <= 0 || loading}
            className="w-full bg-red-700 text-white py-3 rounded-xl font-semibold text-sm hover:bg-red-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Generando...' : 'Generar QR de cobro'}
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col items-center gap-3 w-full">
            <p className="text-sm text-gray-500">Muestra este QR al cliente</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR de cobro" className="w-56 h-56" />
            <div className="text-center">
              <p className="text-3xl font-bold text-red-700">{formatNC(Number(amount))}</p>
              <p className="text-xs text-gray-400 mt-1">{profile?.name}</p>
            </div>
          </div>

          <button
            onClick={limpiar}
            className="w-full border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Nuevo cobro
          </button>
        </div>
      )}
    </div>
  )
}
