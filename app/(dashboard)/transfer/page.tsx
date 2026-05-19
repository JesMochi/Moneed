'use client'

import { useState } from 'react'
import QRScanner from '@/components/QRScanner'
import DirectTransfer from '@/components/DirectTransfer'

const TABS = [
  { id: 'qr',     label: '📷 Escanear QR' },
  { id: 'direct', label: '👤 Envío directo' },
] as const

export default function TransferPage() {
  const [tab, setTab] = useState<'qr' | 'direct'>('qr')

  return (
    <div className="p-4 space-y-5">
      <div className="pt-2">
        <h1 className="text-xl font-extrabold text-gray-800">Pagar</h1>
        <p className="text-gray-400 text-sm mt-0.5">Envía NodoCoins a quien quieras</p>
      </div>

      {/* Tabs estilo pill */}
      <div className="grid grid-cols-2 gap-1 bg-gray-100 rounded-2xl p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`py-2.5 rounded-xl text-sm font-extrabold transition-all active:scale-95 ${
              tab === t.id
                ? 'bg-white shadow text-gray-800'
                : 'text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'qr' ? <QRScanner /> : <DirectTransfer />}
    </div>
  )
}
