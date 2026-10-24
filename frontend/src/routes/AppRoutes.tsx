import { Navigate, Route, Routes } from 'react-router-dom'

import MainLayout from '../components/MainLayout'
import CategoriesPage from '../pages/CategoriesPage'
import ClientsPage from '../pages/ClientsPage'
import DashboardPage from '../pages/DashboardPage'
import LoginPage from '../pages/LoginPage'
import ProduitsPage from '../pages/ProduitsPage'
import UtilisateursPage from '../pages/UtilisateursPage'
import VentesPage from '../pages/VentesPage'
import RouteProtegee from './RouteProtegee'

// Table des routes de l'application
export default function AppRoutes() {
  return (
    <Routes>
      {/* Route publique */}
      <Route path="/login" element={<LoginPage />} />

      {/* Routes réservées aux utilisateurs connectés, dans la mise en page commune */}
      <Route element={<RouteProtegee />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/produits" element={<ProduitsPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/ventes" element={<VentesPage />} />

          {/* Routes réservées aux Admin : un Employé est renvoyé vers l'accueil */}
          <Route element={<RouteProtegee adminSeulement />}>
            <Route path="/utilisateurs" element={<UtilisateursPage />} />
          </Route>
        </Route>
      </Route>

      {/* Toute URL inconnue renvoie à l'accueil */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}