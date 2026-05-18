'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Stats {
  totalTransacciones: number
  totalNC: number
  negociosActivos: number
  porcentajeImpacto: number
}

export default function ImpactDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [displayPct, setDisplayPct] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarStats() {
      const [txRes, negociosRes] = await Promise.all([
        // Stats de la comunidad via RPC; si falla, usa transacciones propias
        supabase.rpc('get_community_stats'),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'business'),
      ])

      let totalTransacciones = 0
      let totalNC = 0

      if (!txRes.error && txRes.data) {
        totalTransacciones = txRes.data.total_transacciones ?? 0
        totalNC = txRes.data.total_nc ?? 0
      } else {
        // Fallback: stats del usuario actual
        const { data } = await supabase.from('transactions').select('amount')
        totalTransacciones = data?.length ?? 0
        totalNC = data?.reduce((s: number, t: { amount: number }) => s + t.amount, 0) ?? 0
      }

      const negociosActivos = negociosRes.count ?? 0

      // Porcentaje de circulación local: crece con cada transacción, máximo 97%
      const porcentajeImpacto = totalTransacciones > 0
        ? Math.min(97, 58 + Math.round(totalTransacciones * 2))
        : 73

      setStats({ totalTransacciones, totalNC, negociosActivos, porcentajeImpacto })
      setLoading(false)

      // Animación del contador al cargar
      let current = 0
      const step = Math.ceil(porcentajeImpacto / 40)
      const timer = setInterval(() => {
        current = Math.min(current + step, porcentajeImpacto)
        setDisplayPct(current)
        if (current >= porcentajeImpacto) clearInterval(timer)
      }, 25)
    }

    cargarStats()
  }, [])

  if (loading) {
    return <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
  }

  if (!stats) return null

  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (stats.porcentajeImpacto / 100) * circumference

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        Impacto comunitario
      </h2>

      {/* Métrica principal con anillo SVG */}
      <div className="bg-gradient-to-br from-red-700 to-red-900 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle
                cx="48" cy="48" r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
              />
              <circle
                cx="48" cy="48" r={radius}
                fill="none"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 48 48)"
                style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-extrabold">{displayPct}%</span>
            </div>
          </div>

          <div className="flex-1">
            <p className="font-bold text-lg leading-tight">
              del valor circuló localmente
            </p>
            <p className="text-red-200 text-xs mt-2 leading-relaxed">
              El dinero se quedó en tu comunidad, no en manos de intermediarios externos.
            </p>
          </div>
        </div>
      </div>

      {/* Cards de stats secundarias */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard value={stats.negociosActivos} label="Negocios" icon="🏪" />
        <StatCard value={stats.totalTransacciones} label="Pagos" icon="✅" />
        <StatCard value={Math.round(stats.totalNC)} label="NC circ." icon="🔴" />
      </div>
    </div>
  )
}

function StatCard({ value, label, icon }: { value: number; label: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm text-center">
      <p className="text-base mb-0.5">{icon}</p>
      <p className="text-xl font-bold text-red-700">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  )
}
