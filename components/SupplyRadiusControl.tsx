'use client'

const RADIOS = [5, 10, 25, 50]

interface Props {
  radius: number
  onChange: (km: number) => void
  onSave: () => void
  producersInRange: number
  saving: boolean
}

export default function SupplyRadiusControl({ radius, onChange, onSave, producersInRange, saving }: Props) {
  return (
    <div className="absolute bottom-24 left-3 z-[1000] bg-white rounded-2xl shadow-xl p-4 w-52 border border-gray-100">
      <p className="text-sm font-bold text-gray-700 mb-3">📦 Radio de suministro</p>

      <div className="grid grid-cols-4 gap-1 mb-3">
        {RADIOS.map(km => (
          <button
            key={km}
            onClick={() => onChange(km)}
            className={`py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              radius === km
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {km}km
          </button>
        ))}
      </div>

      <div className="bg-green-50 rounded-xl px-3 py-2 mb-3 text-center">
        <p className="text-xs font-bold text-green-700">
          🌱 {producersInRange} productor{producersInRange !== 1 ? 'es' : ''} en tu rango
        </p>
      </div>

      <button
        onClick={onSave}
        disabled={saving}
        className="w-full bg-red-600 text-white py-2 rounded-xl text-xs font-extrabold disabled:opacity-50 active:scale-95 transition-all"
      >
        {saving ? 'Guardando...' : 'Guardar radio'}
      </button>
    </div>
  )
}
