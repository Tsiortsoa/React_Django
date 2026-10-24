import { useCallback, useEffect, useState, type ReactNode } from 'react'

import { useInactivite } from '../hooks/useInactivite'
import { cleMessageSession, cleToken, cleUtilisateur } from '../services/api'
import {
  appelerLogin,
  appelerLogout,
  appelerWhoami,
  type ReponseSession,
} from '../services/authService'
import { AuthContext, type Utilisateur } from './AuthContext'

// Durée sans aucune action avant la déconnexion automatique
const dureeInactiviteMs = 30 * 60 * 1000

function versUtilisateur(reponse: ReponseSession): Utilisateur {
  return { username: reponse.username, estAdmin: reponse.is_admin }
}

// Relit la session sauvegardée au démarrage
function lireUtilisateurStocke(): Utilisateur | null {
  const brut = localStorage.getItem(cleUtilisateur)
  if (!brut || !localStorage.getItem(cleToken)) return null
  try {
    return JSON.parse(brut) as Utilisateur
  } catch {
    return null
  }
}

// Fournit l'état d'authentification à tous les composants enfants
export function AuthProvider({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(lireUtilisateurStocke)

  // Connexion : appelle l'API, sauvegarde la session, met à jour l'état
  async function seConnecter(username: string, password: string) {
    const reponse = await appelerLogin(username, password)
    const nouvelUtilisateur = versUtilisateur(reponse)
    localStorage.setItem(cleToken, reponse.token)
    localStorage.setItem(cleUtilisateur, JSON.stringify(nouvelUtilisateur))
    setUtilisateur(nouvelUtilisateur)
  }

  async function seDeconnecter() {
    try {
      await appelerLogout()
    } catch {
      // Token déjà invalide côté serveur
    }
    localStorage.removeItem(cleToken)
    localStorage.removeItem(cleUtilisateur)
    setUtilisateur(null)
  }

  const synchroniser = useCallback(() => {
    if (!localStorage.getItem(cleToken)) return
    appelerWhoami()
      .then((reponse) => {
        const nouveau = versUtilisateur(reponse)
        localStorage.setItem(cleUtilisateur, JSON.stringify(nouveau))
        setUtilisateur((precedent) =>
          precedent && precedent.username === nouveau.username && precedent.estAdmin === nouveau.estAdmin
            ? precedent
            : nouveau,
        )
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    synchroniser()
    window.addEventListener('focus', synchroniser)
    return () => window.removeEventListener('focus', synchroniser)
  }, [synchroniser])

  // Déconnexion automatique après une longue inactivité
  useInactivite(utilisateur !== null, dureeInactiviteMs, () => {
    sessionStorage.setItem(cleMessageSession, "Votre session a expiré pour cause d'inactivité.")
    void seDeconnecter()
  })

  return (
    <AuthContext.Provider value={{ utilisateur, seConnecter, seDeconnecter }}>
      {children}
    </AuthContext.Provider>
  )
}