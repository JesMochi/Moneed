'use client'

import QRScanner from '@/components/QRScanner'

export default function TransferPage() {
  return (
    <div className="p-4 space-y-5">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-gray-800">Pagar</h1>
        <p className="text-gray-400 text-sm mt-0.5">Escanea el QR del negocio para pagar</p>
      </div>
      <QRScanner />
    </div>
  )
}
