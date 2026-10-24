import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { PointEvolution } from '../types'
import { formaterMontant } from '../utils/format'

const nombreJours = 30

function cleJour(date: Date): string {
  const mois = String(date.getMonth() + 1).padStart(2, '0')
  const jour = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${mois}-${jour}`
}

function completerJours(evolution: PointEvolution[]) {
  const totalParJour = new Map<string, number>(
    evolution.map((point) => [point.jour, Number(point.total)] as [string, number]),
  )

  return Array.from({ length: nombreJours }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (nombreJours - 1 - i))
    const cle = cleJour(date)
    return {
      jour: `${cle.slice(8, 10)}/${cle.slice(5, 7)}`, // affiché sous la forme "JJ/MM"
      total: totalParJour.get(cle) ?? 0,
    }
  })
}

interface GraphiqueVentesProps {
  donnees: PointEvolution[]
}

// Courbe de l'évolution des ventes sur les 30 derniers jours
export default function GraphiqueVentes({ donnees }: GraphiqueVentesProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={completerJours(donnees)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="jour" interval={4} />
          <YAxis />
          <Tooltip formatter={(valeur) => formaterMontant(Number(valeur))} />
          <Line
            type="monotone"
            dataKey="total"
            name="Ventes"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}