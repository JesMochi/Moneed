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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-700">MonedaRed</h1>
          <p className="text-gray-500 text-sm mt-1">Crea tu cuenta</p>
        </div>

        <form onSubmit={handleRegister} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={e => update('name', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Tu nombre o nombre del negocio"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={e => update('password', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Tipo de cuenta</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {(['consumer', 'business'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => update('role', r)}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    form.role === r ? 'bg-red-700 text-white border-red-700' : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {r === 'consumer' ? 'Consumidor' : 'Negocio'}
                </button>
              ))}
            </div>
          </div>

          {form.role === 'business' && (
            <div>
              <label className="text-sm font-medium text-gray-700">Categoría del negocio</label>
              <select
                value={form.category}
                onChange={e => update('category', e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Selecciona una categoría</option>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-700 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-red-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-red-700 font-medium">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
