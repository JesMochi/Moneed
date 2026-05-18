import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatea un número como NodoCoins con símbolo
export function formatNC(amount: number): string {
  return `${amount.toFixed(2)} NC`
}

// Formatea fecha en español
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Distancia real en km entre dos coordenadas geográficas (Haversine)
export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Calcula días restantes para vencimiento (demo: 30 días desde creación)
export function diasParaVencer(createdAt: string): number {
  const creacion = new Date(createdAt)
  const vencimiento = new Date(creacion.getTime() + 30 * 24 * 60 * 60 * 1000)
  const hoy = new Date()
  const diff = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}
