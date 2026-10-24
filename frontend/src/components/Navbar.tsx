import { useAuth } from '../context/AuthContext'

interface NavbarProps {
  onOuvrirMenu: () => void
}

export default function Navbar({ onOuvrirMenu }: NavbarProps) {
  const { utilisateur, seDeconnecter } = useAuth()

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-2 border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-2">
        {/* Visible uniquement sous 768 px : au-delà, le menu est déjà affiché */}
        <button
          id="btnMenu"
          onClick={onOuvrirMenu}
          aria-label="Ouvrir le menu"
          className="rounded-lg px-2 py-1 text-xl text-gray-600 hover:bg-gray-100 md:hidden"
        >
          ☰
        </button>
        <span className="text-lg font-bold text-blue-700">Gestion Entreprise</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <span className="flex items-center text-sm text-gray-600">
          {/* Le nom est masqué sur très petit écran, le badge de rôle reste visible */}
          <span className="hidden sm:inline">{utilisateur?.username}</span>
          <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            {utilisateur?.estAdmin ? 'Admin' : 'Employé'}
          </span>
        </span>
        <button
          id="btnDeconnexion"
          onClick={seDeconnecter}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
        >
          Se déconnecter
        </button>
      </div>
    </header>
  )
}