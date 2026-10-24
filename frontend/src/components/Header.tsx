import type { ReactNode } from 'react'

interface HeaderProps {
  titre: string
  children?: ReactNode
}

export default function Header({ titre, children }: HeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">{titre}</h1>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}