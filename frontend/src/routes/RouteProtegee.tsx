import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

// Garde de route : n'affiche les pages enfants que si l'utilisateur est connecté.
// Avec adminSeulement, elles sont en plus réservées au groupe Admin.
export default function RouteProtegee({ adminSeulement = false }: { adminSeulement?: boolean }) {
  const { utilisateur } = useAuth()

  if (!utilisateur) return <Navigate to="/login" replace />
  if (adminSeulement && !utilisateur.estAdmin) return <Navigate to="/" replace />

  return <Outlet /> // affiche la page enfant correspondant à l'URL
}