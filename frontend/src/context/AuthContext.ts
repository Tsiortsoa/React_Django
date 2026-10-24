import { createContext, useContext } from 'react'

// Informations sur l'utilisateur connecté
export interface Utilisateur {
  username: string
  estAdmin: boolean
}

// Ce que le contexte met à disposition de toute l'application
export interface ValeurAuth {
  utilisateur: Utilisateur | null // null = personne n'est connecté
  seConnecter: (username: string, password: string) => Promise<void>
  seDeconnecter: () => Promise<void>
}

export const AuthContext = createContext<ValeurAuth | null>(null)

// Hook pratique : const { utilisateur } = useAuth()
export function useAuth(): ValeurAuth {
  const valeur = useContext(AuthContext)
  if (!valeur) {
    throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>")
  }
  return valeur
}