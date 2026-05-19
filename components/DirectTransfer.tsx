'use client'

import { useState } from 'react'
import { supabase, Profile } from '@/lib/supabase'
import { formatNC } from '@/lib/utils'

type Estado = 'buscar' | 'monto' | 'success' | 'error'

const ROLE_ICON: Record<string, string> = {
  business:          '🏪',
  producer_farm:     '🌱',
  producer_artisan:  '🏺',
  consumer:          '👤',
}

export default function DirectTransfer() {
  const [estado, setEstado]     = useState<Estado>('buscar')
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState<Profile[]>([])
  const [buscando, setBuscando] = useState(false)
  const [selected, setSelected] = useState<Profile | null>(null)
  const [amount, setAmount]     = useState('')
  const [note, setNote]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function buscar() {
    if (!query.trim()) return
    setBuscando(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('profiles')
      .select('id, name, role, category, balance, created_at')
      .ilike('name', `%${query.trim()}%`)
      .neq('id', user?.id ?? '')
      .limit(8)
    setResults((data as Profile[]) ?? [])
    setBuscando(false)
  }

  async function confirmarEnvio() {
    if (!selected || !amount || Number(amount) <= 0) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.rpc('transfer_nocoins', {
      sender:   user.id,
      receiver: selected.id,
      amount:   Number(amount),
      note:     note.trim() || `Transferencia a ${selected.name}`,
    })

    setLoading(false)
    if (error) {
      setErrorMsg(
        error.message.includes('insuficiente')
          ? 'Saldo insuficiente'
          : 'No se pudo completar la transferencia'
      )
      setEstado('error')
    } else {
      setEstado('success')
    }
  }

  function reiniciar() {
    setEstado('buscar')
    setQuery('')
    setResults([])
    setSelected(null)
    setAmount('')
    setNote('')
    setErrorMsg('')
  }

  /* ── Éxito ── */
  if (estado === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">✅</span>
        </div>
        <div className="text-center">
          <p className="text-xl font-extrabold text-gray-800">¡Enviado!</p>
          <p className="text-gray-500 text-sm mt-1">
            {formatNC(Number(amount))} → <span className="font-bold">{selected?.name}</span>
          </p>
        </div>
        <button onClick={reiniciar} className="mt-2 text-red-600 text-sm font-bold underline">
          Nueva transferencia
        </button>
      </div>
    )
  }

  /* ── Error ── */
  if (estado === 'error') {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">❌</span>
        </div>
        <div className="text-center">
          <p className="text-xl font-extrabold text-gray-800">Error</p>
          <p className="text-gray-500 text-sm mt-1">{errorMsg}</p>
        </div>
        <button onClick={reiniciar} className="mt-2 text-red-600 text-sm font-bold underline">
          Intentar de nuevo
        </button>
      </div>
    )
  }

  /* ── Confirmar monto ── */
  if (estado === 'monto' && selected) {
    return (
      <div className="space-y-4 animate-fade-up">
        {/* Receptor */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
            {ROLE_ICON[selected.role] ?? '👤'}
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-gray-800">{selected.name}</p>
            <p className="text-xs text-gray-400">{selected.category || selected.role}</p>
          </div>
          <button onClick={() => { setEstado('buscar'); setSelected(null) }}
            className="text-gray-400 text-xs font-semibold">
            Cambiar
          </button>
        </div>

        {/* Monto grande estilo wallet */}
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-1">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Monto a enviar</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-3xl font-black text-gray-300">NC</span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="text-5xl font-black text-red-600 w-40 text-center bg-transparent border-none outline-none"
              placeholder="0"
              min="0.5"
              step="0.5"
              autoFocus
            />
          </div>
          <p className="text-xs text-gray-400">1 NC = 1 peso mexicano</p>
        </div>

        {/* Nota */}
        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full text-sm text-gray-600 bg-transparent outline-none font-medium"
            placeholder="💬 Agregar nota (opcional)"
          />
        </div>

        <button
          onClick={confirmarEnvio}
          disabled={loading || !amount || Number(amount) <= 0}
          className="w-full bg-red-600 text-white py-4 rounded-2xl font-extrabold text-lg disabled:opacity-50 active:scale-95 transition-all shadow-lg shadow-red-200"
        >
          {loading ? 'Enviando...' : `Enviar ${amount ? formatNC(Number(amount)) : ''}`}
        </button>
        <button onClick={() => { setEstado('buscar'); setSelected(null) }}
          disabled={loading}
          className="w-full text-gray-400 text-sm py-2">
          Cancelar
        </button>
      </div>
    )
  }

  /* ── Buscar destinatario ── */
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && buscar()}
          className="flex-1 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-red-400 bg-gray-50"
          placeholder="Buscar negocio o persona..."
        />
        <button
          onClick={buscar}
          disabled={buscando}
          className="bg-red-600 text-white px-5 rounded-2xl font-extrabold text-sm active:scale-95 transition-all disabled:opacity-50"
        >
          {buscando ? '...' : 'Buscar'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 font-semibold px-1">Selecciona el destinatario</p>
          {results.map(profile => (
            <button
              key={profile.id}
              onClick={() => { setSelected(profile); setEstado('monto') }}
              className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 active:scale-98 transition-all text-left hover:shadow-md"
            >
              <div className="w-11 h-11 bg-red-50 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                {ROLE_ICON[profile.role] ?? '👤'}
              </div>
              <div>
                <p className="font-extrabold text-gray-800 text-sm">{profile.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{profile.category || profile.role}</p>
              </div>
              <span className="ml-auto text-gray-300 text-lg">›</span>
            </button>
          ))}
        </div>
      )}

      {results.length === 0 && query && !buscando && (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-gray-400 text-sm font-medium">Sin resultados para &ldquo;{query}&rdquo;</p>
        </div>
      )}

      {!query && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="text-5xl">👤</span>
          <p className="text-gray-500 font-semibold">¿A quién le envías?</p>
          <p className="text-gray-400 text-xs max-w-xs">
            Busca por nombre de negocio o usuario y envía NodoCoins al instante
          </p>
        </div>
      )}
    </div>
  )
}
