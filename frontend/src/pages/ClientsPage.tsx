import { useEffect, useState, type FormEvent } from 'react'

import Bouton from '../components/Bouton'
import Champ from '../components/Champ'
import Header from '../components/Header'
import Modal from '../components/Modal'
import NoteObligatoire from '../components/NoteObligatoire'
import Table, { type Colonne } from '../components/Table'
import { useConfirmation } from '../context/ConfirmationContext'
import { useToast } from '../context/ToastContext'
import {
  creerClient,
  listerClients,
  listerVentesClient,
  modifierClient,
  supprimerClient,
} from '../services/clientService'
import { extraireMessageErreur } from '../services/erreurs'
import type { Client, Vente } from '../types'
import { formaterDate, formaterMontant } from '../utils/format'

const motifNom = String.raw`\p{L}+(?:[ '’\-]\p{L}+)*`
const motifTelephone = String.raw`\+?[0-9 .\-\(\)]{6,20}`

// Valeurs du formulaire client
type FormulaireClient = Omit<Client, 'id_client'>

const formulaireVide: FormulaireClient = {
  nom: '',
  prenom: '',
  telephone: '',
  email: '',
  adresse: '',
}

const listColonneVente: Colonne<Vente>[] = [
  { cle: 'date', titre: 'Date', rendu: (vente) => formaterDate(vente.date_vente) },
  {
    cle: 'articles',
    titre: 'Articles',
    rendu: (vente) => vente.lignes.reduce((total, ligne) => total + ligne.quantite, 0),
  },
  { cle: 'total', titre: 'Total', rendu: (vente) => formaterMontant(vente.montant_total) },
  { cle: 'vendeur', titre: 'Enregistrée par', rendu: (vente) => vente.utilisateur },
]

export default function ClientsPage() {
  const { afficherErreur, afficherSucces } = useToast()
  const demanderConfirmation = useConfirmation()

  // Données de la page
  const [listClient, setListClient] = useState<Client[]>([])
  const [compteurRechargement, setCompteurRechargement] = useState(0)

  // Modal de création / modification
  const [modalOuvert, setModalOuvert] = useState(false)
  const [clientEnEdition, setClientEnEdition] = useState<Client | null>(null)
  const [frmClient, setFrmClient] = useState<FormulaireClient>(formulaireVide)
  const [enEnvoi, setEnEnvoi] = useState(false)

  // Modal d'historique des ventes
  const [clientHistorique, setClientHistorique] = useState<Client | null>(null)
  const [listVenteHistorique, setListVenteHistorique] = useState<Vente[]>([])
  const [chargementHistorique, setChargementHistorique] = useState(false)

  useEffect(() => {
    listerClients()
      .then(setListClient)
      .catch((erreur) => afficherErreur(extraireMessageErreur(erreur)))
  }, [compteurRechargement, afficherErreur])

  function modifierChamp(nom: keyof FormulaireClient, valeur: string) {
    setFrmClient((precedent) => ({ ...precedent, [nom]: valeur }))
  }

  function ouvrirCreation() {
    setClientEnEdition(null)
    setFrmClient(formulaireVide)
    setModalOuvert(true)
  }

  function ouvrirModification(client: Client) {
    setClientEnEdition(client)
    setFrmClient({
      nom: client.nom,
      prenom: client.prenom,
      telephone: client.telephone,
      email: client.email,
      adresse: client.adresse,
    })
    setModalOuvert(true)
  }

  async function soumettreFormulaire(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault()
    setEnEnvoi(true)
    try {
      if (clientEnEdition) {
        await modifierClient(clientEnEdition.id_client, frmClient)
        afficherSucces('Client modifié.')
      } else {
        await creerClient(frmClient)
        afficherSucces('Client créé.')
      }
      setModalOuvert(false)
      setCompteurRechargement((n) => n + 1)
    } catch (erreur) {
      afficherErreur(extraireMessageErreur(erreur))
    } finally {
      setEnEnvoi(false)
    }
  }

  async function supprimer(client: Client) {
    const confirme = await demanderConfirmation({
      titre: 'Supprimer le client',
      message: `Supprimer le client « ${client.prenom} ${client.nom} » ? Cette action est définitive.`,
      libelleConfirmer: 'Supprimer',
      danger: true,
    })
    if (!confirme) return

    try {
      await supprimerClient(client.id_client)
      afficherSucces('Client supprimé.')
      setCompteurRechargement((n) => n + 1)
    } catch (erreur) {
      afficherErreur(extraireMessageErreur(erreur))
    }
  }

  async function ouvrirHistorique(client: Client) {
    setClientHistorique(client)
    setListVenteHistorique([])
    setChargementHistorique(true)
    try {
      setListVenteHistorique(await listerVentesClient(client.id_client))
    } catch (erreur) {
      afficherErreur(extraireMessageErreur(erreur))
    } finally {
      setChargementHistorique(false)
    }
  }

  const nomClientHistorique = clientHistorique
    ? `${clientHistorique.prenom} ${clientHistorique.nom}`
    : ''

  const listColonne: Colonne<Client>[] = [
    { cle: 'nom', titre: 'Client', rendu: (client) => `${client.prenom} ${client.nom}` },
    { cle: 'telephone', titre: 'Téléphone', rendu: (client) => client.telephone || '—' },
    { cle: 'email', titre: 'Email', rendu: (client) => client.email || '—' },
    { cle: 'adresse', titre: 'Adresse', rendu: (client) => client.adresse || '—' },
    {
      cle: 'actions',
      titre: 'Actions',
      rendu: (client) => (
        <div className="flex flex-wrap gap-2">
          <Bouton variante="secondaire" onClick={() => ouvrirHistorique(client)}>
            Historique
          </Bouton>
          <Bouton variante="secondaire" onClick={() => ouvrirModification(client)}>
            Modifier
          </Bouton>
          <Bouton variante="danger" onClick={() => supprimer(client)}>
            Supprimer
          </Bouton>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <Header titre="Clients">
        <Bouton id="btnNouveauClient" onClick={ouvrirCreation}>
          Nouveau client
        </Bouton>
      </Header>

      <Table
        colonnes={listColonne}
        lignes={listClient}
        cleLigne={(client) => client.id_client}
        messageVide="Aucun client pour le moment."
      />

      {/* Modal de création / modification */}
      <Modal
        ouvert={modalOuvert}
        titre={clientEnEdition ? 'Modifier le client' : 'Nouveau client'}
        onFermer={() => setModalOuvert(false)}
      >
        <form onSubmit={soumettreFormulaire} className="space-y-4">
          <NoteObligatoire />
          <Champ
            id="txtPrenomClient"
            libelle="Prénom"
            value={frmClient.prenom}
            onChange={(e) => modifierChamp('prenom', e.target.value)}
            minLength={2}
            maxLength={100}
            pattern={motifNom}
            title="Lettres, espaces, tirets et apostrophes uniquement (2 caractères minimum)."
            required
          />
          <Champ
            id="txtNomClient"
            libelle="Nom"
            value={frmClient.nom}
            onChange={(e) => modifierChamp('nom', e.target.value)}
            minLength={2}
            maxLength={100}
            pattern={motifNom}
            title="Lettres, espaces, tirets et apostrophes uniquement (2 caractères minimum)."
            required
          />
          <Champ
            id="txtTelephoneClient"
            libelle="Téléphone (facultatif)"
            type="tel"
            value={frmClient.telephone}
            onChange={(e) => modifierChamp('telephone', e.target.value)}
            pattern={motifTelephone}
            title="6 à 20 caractères : chiffres, espaces et + - . ( ) uniquement."
          />
          <Champ
            id="txtEmailClient"
            libelle="Email (facultatif)"
            type="email"
            value={frmClient.email}
            onChange={(e) => modifierChamp('email', e.target.value)}
          />
          <Champ
            id="txtAdresseClient"
            libelle="Adresse (facultative)"
            value={frmClient.adresse}
            onChange={(e) => modifierChamp('adresse', e.target.value)}
            maxLength={255}
          />

          <div className="flex justify-end gap-2">
            <Bouton variante="secondaire" onClick={() => setModalOuvert(false)}>
              Annuler
            </Bouton>
            <Bouton type="submit" disabled={enEnvoi}>
              {enEnvoi ? 'Enregistrement...' : 'Enregistrer'}
            </Bouton>
          </div>
        </form>
      </Modal>

      {/* Modal d'historique : les 10 dernières ventes du client */}
      <Modal
        ouvert={clientHistorique !== null}
        titre={`Historique : ${nomClientHistorique}`}
        onFermer={() => setClientHistorique(null)}
        large
      >
        <Table
          colonnes={listColonneVente}
          lignes={listVenteHistorique}
          cleLigne={(vente) => vente.id_vente}
          messageVide={chargementHistorique ? 'Chargement...' : 'Aucune vente pour ce client.'}
        />
      </Modal>
    </div>
  )
}