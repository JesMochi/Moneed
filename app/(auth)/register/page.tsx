'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const CATEGORIAS = ['Cafetería', 'Panadería', 'Abarrotes', 'Restaurante', 'Farmacia', 'Mercado', 'Artesanías', 'Otro']

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'consumer', category: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          role: form.role,
          category: form.role === 'business' ? form.category : null,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Crea el perfil manualmente como respaldo al trigger
    // (el trigger puede tardar o fallar en algunos entornos Supabase)
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name: form.name,
        role: form.role,
        balance: 100,
        category: form.role === 'business' ? form.category : null,
      }, { onConflict: 'id' })
    }

    router.push('/home')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-sm">

        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-red-700">MonedaRed</h1>
          <p className="text-gray-500 text-sm mt-1">Crea tu cuenta</p>
        </div>

        <form onSubmit={handleRegister} className="bg-white rounded-3xl shadow-md p-6 space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-600">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={e => update('name', e.target.value)}
              className="mt-1 w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-red-400 transition-colors bg-gray-50"
              placeholder="Tu nombre o nombre del negocio"
              required
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-600">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              className="mt-1 w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-red-400 transition-colors bg-gray-50"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-600">Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={e => update('password', e.target.value)}
              className="mt-1 w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-red-400 transition-colors bg-gray-50"
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-600">Tipo de cuenta</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {(['consumer', 'business'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => update('role', r)}
                  className={`py-3 rounded-2xl text-sm font-extrabold border-2 transition-all active:scale-95 ${
                    form.role === r
                      ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200'
                      : 'bg-white text-gray-500 border-gray-100'
                  }`}
                >
                  {r === 'consumer' ? '🛍️ Consumidor' : '🏪 Negocio'}
                </button>
              ))}
            </div>
          </div>

          {form.role === 'business' && (
            <div>
              <label className="text-sm font-bold text-gray-600">Categoría del negocio</label>
              <select
                value={form.category}
                onChange={e => update('category', e.target.value)}
                className="mt-1 w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-red-400 transition-colors bg-gray-50"
                required
              >
                <option value="">Selecciona una categoría</option>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

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
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5 font-medium">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-red-600 font-extrabold">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
