import { createContext, useContext } from 'react'

// Contenu de la boîte de confirmation
export interface OptionsConfirmation {
  titre: string
  message: string
  libelleConfirmer?: string
  danger?: boolean
}

export type DemanderConfirmation = (options: OptionsConfirmation) => Promise<boolean>

export const ConfirmationContext = createContext<DemanderConfirmation | null>(null)

export function useConfirmation(): DemanderConfirmation {
  const demander = useContext(ConfirmationContext)
  if (!demander) {
    throw new Error("useConfirmation doit être utilisé à l'intérieur de <ConfirmationProvider>")
  }
  return demander
}