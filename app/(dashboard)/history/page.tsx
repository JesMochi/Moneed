'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import TransactionList from '@/components/TransactionList'

export default function HistoryPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
    })
  }, [router])

  return (
    <div className="p-4 space-y-5">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-gray-800">Historial</h1>
        <p className="text-gray-400 text-sm mt-0.5">Tus movimientos en NodoCoins</p>
      </div>
      {userId && <TransactionList userId={userId} />}
    </div>
  )
}
