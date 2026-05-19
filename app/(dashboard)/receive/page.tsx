'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import QRGenerator from '@/components/QRGenerator'

export default function ReceivePage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function verificarRol() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      const rolesPermitidos = ['business', 'producer_farm', 'producer_artisan']
      if (data && !rolesPermitidos.includes(data.role)) { router.push('/home'); return }
      setChecking(false)
    }
    verificarRol()
  }, [router])

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-5">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-gray-800">Cobrar</h1>
        <p className="text-gray-400 text-sm mt-0.5">Genera un QR para recibir NodoCoins</p>
      </div>
      <QRGenerator />
    </div>
  )
}
