import type { InputHTMLAttributes } from 'react'

interface ChampProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  libelle?: string
}

export default function Champ({ id, libelle, ...proprietes }: ChampProps) {
  return (
    <div>
      {libelle && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
          {libelle}
          {/* aria-hidden : l'attribut required informe déjà les lecteurs d'écran */}
          {proprietes.required && (
            <span className="ml-0.5 text-red-600" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <input
        id={id}
        {...proprietes}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>
  )
}