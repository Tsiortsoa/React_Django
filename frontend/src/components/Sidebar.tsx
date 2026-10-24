import { NavLink } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

const listLienNavigation = [
  { chemin: '/', libelle: 'Tableau de bord', adminSeulement: false },
  { chemin: '/categories', libelle: 'Catégories', adminSeulement: false },
  { chemin: '/produits', libelle: 'Produits', adminSeulement: false },
  { chemin: '/clients', libelle: 'Clients', adminSeulement: false },
  { chemin: '/ventes', libelle: 'Ventes', adminSeulement: false },
  { chemin: '/utilisateurs', libelle: 'Utilisateurs', adminSeulement: true },
]

interface SidebarProps {
  ouvert: boolean
  onFermer: () => void
}

// Menu latéral
export default function Sidebar({ ouvert, onFermer }: SidebarProps) {
  const { utilisateur } = useAuth()

  const listLienVisible = listLienNavigation.filter(
    (lien) => !lien.adminSeulement || utilisateur?.estAdmin,
  )

  return (
    <>
      {/* Fond sombre derrière le tiroir (mobile) : un clic dessus ferme le menu */}
      {ouvert && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={onFermer} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white transition-transform md:static md:z-auto md:w-56 md:shrink-0 md:translate-x-0 ${
          ouvert ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* En-tête du tiroir, visible uniquement sur mobile */}
        <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4 md:hidden">
          <span className="font-semibold text-gray-700">Menu</span>
          <button
            id="btnFermerMenu"
            onClick={onFermer}
            aria-label="Fermer le menu"
            className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {listLienVisible.map((lien) => (
            <NavLink
              key={lien.chemin}
              to={lien.chemin}
              end={lien.chemin === '/'}
              onClick={onFermer}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              {lien.libelle}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}