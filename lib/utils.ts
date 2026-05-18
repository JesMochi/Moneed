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

// Calcula días restantes para vencimiento (demo: 30 días desde creación)
export function diasParaVencer(createdAt: string): number {
  const creacion = new Date(createdAt)
  const vencimiento = new Date(creacion.getTime() + 30 * 24 * 60 * 60 * 1000)
  const hoy = new Date()
  const diff = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}
