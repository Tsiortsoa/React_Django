import type { ReactNode } from 'react'

interface CardProps {
  titre?: string
  children: ReactNode
}

export default function Card({ titre, children }: CardProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {titre && (
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          {titre}
        </h2>
      )}
      {children}
    </section>
  )
}