import type { SelectHTMLAttributes } from 'react'

interface ChampSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string
  libelle?: string
}

export default function ChampSelect({ id, libelle, children, ...proprietes }: ChampSelectProps) {
  return (
    <div>
      {libelle && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
          {libelle}
          {proprietes.required && (
            <span className="ml-0.5 text-red-600" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <select
        id={id}
        {...proprietes}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        {children}
      </select>
    </div>
  )
}