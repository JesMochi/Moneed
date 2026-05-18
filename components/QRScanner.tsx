'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatNC } from '@/lib/utils'

interface QRData {
  receiverId: string
  amount: number
  name: string
}

type Estado = 'idle' | 'scanning' | 'confirm' | 'success' | 'error'

export default function QRScanner() {
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null)
  const [estado, setEstado] = useState<Estado>('idle')
  const [qrData, setQrData] = useState<QRData | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Limpia el escáner al desmontar el componente
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  async function iniciarEscaneo() {
    setEstado('scanning')
    // Importación dinámica para evitar SSR (html5-qrcode usa APIs del navegador)
    const { Html5Qrcode } = await import('html5-qrcode')
    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (texto: string) => {
          scanner.stop()
          try {
            const data = JSON.parse(texto) as QRData
            if (!data.receiverId || !data.amount || !data.name) throw new Error()
            setQrData(data)
            setEstado('confirm')
          } catch {
            setErrorMsg('QR inválido — no es un código MonedaRed')
            setEstado('error')
          }
        },
        () => {}
      )
    } catch {
      setErrorMsg('No se pudo acceder a la cámara. Verifica los permisos.')
      setEstado('error')
    }
  }

  async function confirmarPago() {
    if (!qrData) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.rpc('transfer_nocoins', {
      sender: user.id,
      receiver: qrData.receiverId,
      amount: qrData.amount,
      note: `Pago a ${qrData.name}`,
    })

    setLoading(false)

    if (error) {
      setErrorMsg(
        error.message.includes('insuficiente')
          ? 'Saldo insuficiente para realizar este pago'
          : 'Error al procesar el pago. Intenta de nuevo.'
      )
      setEstado('error')
    } else {
      setEstado('success')
    }
  }

  function reiniciar() {
    setQrData(null)
    setErrorMsg('')
    setEstado('idle')
  }

  if (estado === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">✅</span>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-800">¡Pago exitoso!</p>
          <p className="text-gray-500 text-sm mt-2">
            Enviaste {formatNC(qrData!.amount)} a{' '}
            <span className="font-semibold">{qrData!.name}</span>
          </p>
        </div>
        <button onClick={reiniciar} className="mt-2 text-red-700 text-sm font-medium underline">
          Hacer otro pago
        </button>
      </div>
    )
  }

  if (estado === 'error') {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">❌</span>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-800">Error</p>
          <p className="text-gray-500 text-sm mt-2">{errorMsg}</p>
        </div>
        <button onClick={reiniciar} className="mt-2 text-red-700 text-sm font-medium underline">
          Intentar de nuevo
        </button>
      </div>
    )
  }

  if (estado === 'confirm' && qrData) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <p className="text-sm text-gray-500 text-center font-medium">Confirma el pago</p>
          <div className="text-center py-2">
            <p className="text-4xl font-bold text-red-700">{formatNC(qrData.amount)}</p>
            <p className="text-gray-500 text-sm mt-2">
              a <span className="font-semibold text-gray-800">{qrData.name}</span>
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400">1 NodoCoin = 1 peso mexicano</p>
          </div>
        </div>

        <button
          onClick={confirmarPago}
          disabled={loading}
          className="w-full bg-red-700 text-white py-3.5 rounded-xl font-bold text-base hover:bg-red-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Procesando...' : `Pagar ${formatNC(qrData.amount)}`}
        </button>
        <button
          onClick={reiniciar}
          disabled={loading}
          className="w-full text-gray-400 text-sm py-2"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Contenedor del escáner — siempre en el DOM para que html5-qrcode lo encuentre */}
      <div
        id="qr-reader"
        className={estado === 'scanning' ? 'rounded-xl overflow-hidden' : 'hidden'}
      />

      {estado === 'idle' && (
        <div className="flex flex-col items-center gap-5 py-10">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
            <span className="text-5xl">📷</span>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800 text-lg">Escanear QR de cobro</p>
            <p className="text-gray-400 text-sm mt-1">
              Apunta la cámara al QR que te muestra el negocio
            </p>
          </div>
          <button
            onClick={iniciarEscaneo}
            className="bg-red-700 text-white px-10 py-3 rounded-xl font-semibold text-sm hover:bg-red-800 transition-colors"
          >
            Abrir cámara
          </button>
        </div>
      )}
    </div>
  )
}
