import type { ButtonHTMLAttributes } from 'react'

type VarianteBouton = 'principal' | 'secondaire' | 'danger'

interface BoutonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBouton
}

const styleParVariante: Record<VarianteBouton, string> = {
  principal: 'bg-blue-600 text-white hover:bg-blue-700',
  secondaire: 'border border-gray-300 text-gray-700 hover:bg-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

export default function Bouton({ variante = 'principal', className = '', ...proprietes }: BoutonProps) {
  return (
    <button
      type="button"
      {...proprietes}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${styleParVariante[variante]} ${className}`}
    />
  )
}