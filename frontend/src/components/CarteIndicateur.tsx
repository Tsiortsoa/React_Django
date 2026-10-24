import Card from './Card'

interface CarteIndicateurProps {
  titre: string
  valeur: string
}

export default function CarteIndicateur({ titre, valeur }: CarteIndicateurProps) {
  return (
    <Card titre={titre}>
      <p className="text-2xl font-bold text-gray-800">{valeur}</p>
    </Card>
  )
}