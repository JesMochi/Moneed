'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message.toLowerCase().includes('confirm')) {
        setError('Debes confirmar tu email antes de entrar. Revisa tu bandeja de entrada.')
      } else {
        setError('Email o contraseña incorrectos')
      }
      setLoading(false)
      return
    }

    router.push('/home')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-gray-100 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-700">Moneed</h1>
          <p className="text-gray-500 text-sm mt-1">Circulación económica local</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-3xl shadow-md p-6 space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-red-400 transition-colors bg-gray-50"
              placeholder="tu@email.com"
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-red-400 transition-colors bg-gray-50"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center font-semibold bg-red-50 rounded-xl py-2 px-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3.5 rounded-2xl font-extrabold text-base hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-red-200"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5 font-medium">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-red-600 font-extrabold">Regístrate</Link>
        </p>
      </div>
    </div>
  )
}
