import { createContext, useContext } from 'react'

export type TypeToast = 'erreur' | 'succes' | 'info'

export interface Toast {
  id: number
  type: TypeToast
  message: string
}

export interface ValeurToast {
  afficherErreur: (message: string) => void
  afficherSucces: (message: string) => void
  afficherInfo: (message: string) => void
}

export const ToastContext = createContext<ValeurToast | null>(null)

export function useToast(): ValeurToast {
  const valeur = useContext(ToastContext)
  if (!valeur) {
    throw new Error("useToast doit être utilisé à l'intérieur de <ToastProvider>")
  }
  return valeur
}