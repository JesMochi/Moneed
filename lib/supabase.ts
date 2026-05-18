import { createClient } from '@supabase/supabase-js'

// Fallback vacío para que Next.js no explote durante el build estático.
// En runtime, Vercel inyecta las vars reales via NEXT_PUBLIC_*.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para la base de datos
export type UserRole = 'consumer' | 'business'

export interface Profile {
  id: string
  name: string
  role: UserRole
  balance: number
  category?: string
  lat?: number
  lng?: number
  created_at: string
}

export interface Transaction {
  id: string
  sender_id: string
  receiver_id: string
  amount: number
  note?: string
  created_at: string
  // Datos del join con profiles
  sender?: { name: string }
  receiver?: { name: string }
}
