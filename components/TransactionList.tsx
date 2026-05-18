'use client'

import { useEffect, useState } from 'react'
import { supabase, Transaction } from '@/lib/supabase'
import { formatNC, formatDate } from '@/lib/utils'

export default function TransactionList({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('transactions')
      .select(`
        *,
        sender:profiles!sender_id(name),
        receiver:profiles!receiver_id(name)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setTransactions((data as Transaction[]) || [])
        setLoading(false)
      })
  }, [userId])

  if (loading) {
    return <p className="text-center text-gray-400 text-sm py-10">Cargando movimientos...</p>
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-14">
        <span className="text-5xl">📭</span>
        <p className="text-gray-400 text-sm">No hay movimientos aún</p>
        <p className="text-gray-300 text-xs">Realiza tu primer pago con NodoCoins</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {transactions.map(tx => {
        const isEnviado = tx.sender_id === userId
        const contraparte = isEnviado ? tx.receiver?.name : tx.sender?.name

        return (
          <div key={tx.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold ${
              isEnviado ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
            }`}>
              {isEnviado ? '↑' : '↓'}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {isEnviado
                  ? `Pago a ${contraparte || 'Usuario'}`
                  : `Recibido de ${contraparte || 'Usuario'}`}
              </p>
              {tx.note && (
                <p className="text-xs text-gray-400 truncate">{tx.note}</p>
              )}
              <p className="text-xs text-gray-300 mt-0.5">{formatDate(tx.created_at)}</p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className={`font-bold text-sm ${isEnviado ? 'text-red-600' : 'text-green-600'}`}>
                {isEnviado ? '-' : '+'}{formatNC(tx.amount)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
