import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'

import ToastContainer from '../components/ToastContainer'
import { ToastContext, type Toast, type TypeToast } from './ToastContext'

const dureeToastMs = 5000
const nombreToastMax = 4

// Gère la liste des notifications : ajout, disparition automatique, fermeture manuelle
export function ToastProvider({ children }: { children: ReactNode }) {
  const [listToast, setListToast] = useState<Toast[]>([])
  const dernierId = useRef(0) // compteur pour donner un identifiant unique à chaque toast

  // Retire une notification (fermeture manuelle ou fin du délai)
  const retirer = useCallback((id: number) => {
    setListToast((precedent) => precedent.filter((toast) => toast.id !== id))
  }, [])

  // Ajoute une notification et programme sa disparition
  const ajouter = useCallback(
    (type: TypeToast, message: string) => {
      dernierId.current += 1
      const id = dernierId.current
      setListToast((precedent) => [...precedent, { id, type, message }].slice(-nombreToastMax))
      window.setTimeout(() => retirer(id), dureeToastMs)
    },
    [retirer],
  )

  const valeur = useMemo(
    () => ({
      afficherErreur: (message: string) => ajouter('erreur', message),
      afficherSucces: (message: string) => ajouter('succes', message),
      afficherInfo: (message: string) => ajouter('info', message),
    }),
    [ajouter],
  )

  return (
    <ToastContext.Provider value={valeur}>
      {children}
      <ToastContainer listToast={listToast} onFermer={retirer} />
    </ToastContext.Provider>
  )
}