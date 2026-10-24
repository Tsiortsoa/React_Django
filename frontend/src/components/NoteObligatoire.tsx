// Légende affichée en haut des formulaires
export default function NoteObligatoire() {
  return (
    <p className="text-xs text-gray-500">
      <span className="text-red-600">*</span> champ obligatoire
    </p>
  )
}