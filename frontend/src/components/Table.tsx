import type { ReactNode } from 'react'

// Description d'une colonne : son identifiant, son titre et la façon d'afficher une cellule
export interface Colonne<T> {
  cle: string
  titre: string
  rendu: (ligne: T) => ReactNode
}

interface TableProps<T> {
  colonnes: Colonne<T>[]
  lignes: T[]
  cleLigne: (ligne: T) => string | number // identifiant unique d'une ligne (ex. son id)
  messageVide?: string
}

// Tableau de données réutilisable, avec un message quand il n'y a aucune ligne
export default function Table<T>({
  colonnes,
  lignes,
  cleLigne,
  messageVide = 'Aucune donnée à afficher.',
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
          <tr>
            {colonnes.map((colonne) => (
              <th key={colonne.cle} className="px-4 py-3">
                {colonne.titre}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {lignes.length === 0 ? (
            <tr>
              <td colSpan={colonnes.length} className="px-4 py-6 text-center text-gray-500">
                {messageVide}
              </td>
            </tr>
          ) : (
            lignes.map((ligne) => (
              <tr key={cleLigne(ligne)}>
                {colonnes.map((colonne) => (
                  <td key={colonne.cle} className="px-4 py-3 text-gray-700">
                    {colonne.rendu(ligne)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}