import { useCallback, useState, type ReactNode } from 'react'

import Bouton from '../components/Bouton'
import Modal from '../components/Modal'
import {
  ConfirmationContext,
  type DemanderConfirmation,
  type OptionsConfirmation,
} from './ConfirmationContext'

interface DemandeEnCours {
  options: OptionsConfirmation
  repondre: (reponse: boolean) => void
}

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [demande, setDemande] = useState<DemandeEnCours | null>(null)

  const demanderConfirmation = useCallback<DemanderConfirmation>(
    (options) =>
      new Promise<boolean>((resolve) => {
        setDemande({ options, repondre: resolve })
      }),
    [],
  )

  function repondre(reponse: boolean) {
    demande?.repondre(reponse)
    setDemande(null)
  }

  return (
    <ConfirmationContext.Provider value={demanderConfirmation}>
      {children}
      {}
      <Modal ouvert={demande !== null} titre={demande?.options.titre ?? ''} onFermer={() => repondre(false)}>
        <p className="whitespace-pre-line text-sm text-gray-600">{demande?.options.message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Bouton variante="secondaire" onClick={() => repondre(false)}>
            Annuler
          </Bouton>
          <Bouton
            id="btnConfirmer"
            variante={demande?.options.danger ? 'danger' : 'principal'}
            onClick={() => repondre(true)}
          >
            {demande?.options.libelleConfirmer ?? 'Confirmer'}
          </Bouton>
        </div>
      </Modal>
    </ConfirmationContext.Provider>
  )
}