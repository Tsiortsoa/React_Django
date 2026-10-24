import type { ReactNode } from 'react'

interface ModalProps {
  ouvert: boolean
  titre: string
  onFermer: () => void
  large?: boolean
  children: ReactNode
}

// Fenêtre modale : s'affiche par-dessus la page quand « ouvert » vaut true
export default function Modal({ ouvert, titre, onFermer, large = false, children }: ModalProps) {
  if (!ouvert) return null

  return (
    // Fond sombre : un clic dessus ferme la fenêtre
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onFermer}
    >
      {/* stopPropagation : un clic à l'intérieur ne doit pas fermer la fenêtre */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titre}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white p-6 shadow-lg ${
          large ? 'max-w-2xl' : 'max-w-md'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">{titre}</h2>
          <button
            id="btnFermerModal"
            onClick={onFermer}
            aria-label="Fermer"
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}