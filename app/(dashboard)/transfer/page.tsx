'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import QRScanner from '@/components/QRScanner'
import DirectTransfer from '@/components/DirectTransfer'

const TABS = [
  { id: 'qr',     label: '📷 Escanear QR' },
  { id: 'direct', label: '👤 Envío directo' },
] as const

function TransferContent() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<'qr' | 'direct'>('qr')
  const [preselectedId,   setPreselectedId]   = useState<string | null>(null)
  const [preselectedName, setPreselectedName] = useState<string | null>(null)

  // Si viene del mapa con ?to=ID&nombre=Nombre, abre envío directo pre-seleccionado
  useEffect(() => {
    const to     = searchParams.get('to')
    const nombre = searchParams.get('nombre')
    if (to && nombre) {
      setPreselectedId(to)
      setPreselectedName(nombre)
      setTab('direct')
    }
  }, [searchParams])

  return (
    <div className="p-4 space-y-5">
      <div className="pt-2">
        <h1 className="text-xl font-extrabold text-gray-800">Pagar</h1>
        <p className="text-gray-400 text-sm mt-0.5">Envía NodoCoins a quien quieras</p>
      </div>

      <div className="grid grid-cols-2 gap-1 bg-gray-100 rounded-2xl p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setPreselectedId(null); setPreselectedName(null) }}
            className={`py-2.5 rounded-xl text-sm font-extrabold transition-all active:scale-95 ${
              tab === t.id ? 'bg-white shadow text-gray-800' : 'text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'qr'
        ? <QRScanner />
        : <DirectTransfer preselectedId={preselectedId} preselectedName={preselectedName} />
      }
    </div>
  )
}

export default function TransferPage() {
  return (
    <Suspense>
      <TransferContent />
    </Suspense>
  )
}
