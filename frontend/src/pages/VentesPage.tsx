import { useEffect, useState, type FormEvent } from 'react'

import Alert from '../components/Alert'
import Bouton from '../components/Bouton'
import Champ from '../components/Champ'
import ChampSelect from '../components/ChampSelect'
import Header from '../components/Header'
import Modal from '../components/Modal'
import NoteObligatoire from '../components/NoteObligatoire'
import Table, { type Colonne } from '../components/Table'
import { useToast } from '../context/ToastContext'
import { listerClients } from '../services/clientService'
import { extraireMessageErreur } from '../services/erreurs'
import { listerProduits } from '../services/produitService'
import { creerVente, listerVentes } from '../services/venteService'
import type { Client, LigneVente, Produit, Vente } from '../types'
import { formaterDate, formaterMontant } from '../utils/format'

interface LigneFormulaire {
  produit: string
  quantite: string
}

const ligneVide: LigneFormulaire = { produit: '', quantite: '1' }

const listColonneLigne: Colonne<LigneVente>[] = [
  { cle: 'produit', titre: 'Produit', rendu: (ligne) => ligne.nom_produit },
  { cle: 'quantite', titre: 'Quantité', rendu: (ligne) => ligne.quantite },
  { cle: 'prix', titre: 'Prix unitaire', rendu: (ligne) => formaterMontant(ligne.prix_unitaire_vente) },
  { cle: 'sousTotal', titre: 'Sous-total', rendu: (ligne) => formaterMontant(ligne.sous_total) },
]

export default function VentesPage() {
  const { afficherErreur, afficherSucces } = useToast()

  // Données de la page
  const [listVente, setListVente] = useState<Vente[]>([])
  const [listClient, setListClient] = useState<Client[]>([])
  const [listProduit, setListProduit] = useState<Produit[]>([])
  const [compteurRechargement, setCompteurRechargement] = useState(0)

  // Modal de création d'une vente
  const [modalOuvert, setModalOuvert] = useState(false)
  const [selClient, setSelClient] = useState('')
  const [listLigneFormulaire, setListLigneFormulaire] = useState<LigneFormulaire[]>([{ ...ligneVide }])
  const [enEnvoi, setEnEnvoi] = useState(false)

  // Modal de détail d'une vente
  const [venteDetail, setVenteDetail] = useState<Vente | null>(null)

  useEffect(() => {
    Promise.all([listerVentes(), listerClients(), listerProduits()])
      .then(([ventes, clients, produits]) => {
        setListVente(ventes)
        setListClient(clients)
        setListProduit(produits)
      })
      .catch((erreur) => afficherErreur(extraireMessageErreur(erreur)))
  }, [compteurRechargement, afficherErreur])

  function ouvrirCreation() {
    setSelClient('')
    setListLigneFormulaire([{ ...ligneVide }])
    setModalOuvert(true)
  }

  function ajouterLigne() {
    setListLigneFormulaire((precedent) => [...precedent, { ...ligneVide }])
  }

  function supprimerLigne(position: number) {
    setListLigneFormulaire((precedent) => precedent.filter((_, i) => i !== position))
  }

  function modifierLigne(position: number, champ: keyof LigneFormulaire, valeur: string) {
    setListLigneFormulaire((precedent) =>
      precedent.map((ligne, i) => (i === position ? { ...ligne, [champ]: valeur } : ligne)),
    )
  }

  const totalEnCours = listLigneFormulaire.reduce((total, ligne) => {
    const produit = listProduit.find((p) => p.id_produit === Number(ligne.produit))
    return produit ? total + Number(produit.prix_unitaire) * Number(ligne.quantite || 0) : total
  }, 0)

  const listIdProduitChoisi = listLigneFormulaire.map((ligne) => ligne.produit)

  async function soumettreFormulaire(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault()
    setEnEnvoi(true)
    try {
      const vente = await creerVente({
        client: Number(selClient),
        lignes: listLigneFormulaire.map((ligne) => ({
          produit: Number(ligne.produit),
          quantite: Number(ligne.quantite),
        })),
      })
      setModalOuvert(false)
      afficherSucces(`Vente n° ${vente.id_vente} enregistrée (${formaterMontant(vente.montant_total)}).`)
      setCompteurRechargement((n) => n + 1)
    } catch (erreur) {
      afficherErreur(extraireMessageErreur(erreur))
    } finally {
      setEnEnvoi(false)
    }
  }

  const listColonne: Colonne<Vente>[] = [
    { cle: 'numero', titre: 'N°', rendu: (vente) => vente.id_vente },
    { cle: 'date', titre: 'Date', rendu: (vente) => formaterDate(vente.date_vente) },
    { cle: 'client', titre: 'Client', rendu: (vente) => vente.nom_client },
    { cle: 'vendeur', titre: 'Enregistrée par', rendu: (vente) => vente.utilisateur },
    {
      cle: 'articles',
      titre: 'Articles',
      rendu: (vente) => vente.lignes.reduce((total, ligne) => total + ligne.quantite, 0),
    },
    { cle: 'total', titre: 'Total', rendu: (vente) => formaterMontant(vente.montant_total) },
    {
      cle: 'actions',
      titre: 'Actions',
      rendu: (vente) => (
        <Bouton variante="secondaire" onClick={() => setVenteDetail(vente)}>
          Détail
        </Bouton>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <Header titre="Ventes">
        <Bouton id="btnNouvelleVente" onClick={ouvrirCreation}>
          Nouvelle vente
        </Bouton>
      </Header>

      <Table
        colonnes={listColonne}
        lignes={listVente}
        cleLigne={(vente) => vente.id_vente}
        messageVide="Aucune vente pour le moment."
      />

      {/* Modal de création d'une vente */}
      <Modal ouvert={modalOuvert} titre="Nouvelle vente" onFermer={() => setModalOuvert(false)} large>
        <form onSubmit={soumettreFormulaire} className="space-y-4">
          <NoteObligatoire />

          <ChampSelect
            id="selClientVente"
            libelle="Client"
            value={selClient}
            onChange={(e) => setSelClient(e.target.value)}
            required
          >
            <option value="">Choisir un client</option>
            {listClient.map((client) => (
              <option key={client.id_client} value={client.id_client}>
                {`${client.prenom} ${client.nom}`}
              </option>
            ))}
          </ChampSelect>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Produits vendus{' '}
              <span className="text-red-600" aria-hidden="true">
                *
              </span>
            </p>
            {listLigneFormulaire.map((ligne, position) => (
              <div key={position} className="flex items-end gap-2">
                <div className="min-w-0 flex-1">
                  <ChampSelect
                    id={`selProduitLigne${position}`}
                    aria-label="Produit"
                    value={ligne.produit}
                    onChange={(e) => modifierLigne(position, 'produit', e.target.value)}
                    required
                  >
                    <option value="">Choisir un produit</option>
                    {listProduit
                      .filter(
                        (produit) =>
                          String(produit.id_produit) === ligne.produit ||
                          !listIdProduitChoisi.includes(String(produit.id_produit)),
                      )
                      .map((produit) => (
                        <option
                          key={produit.id_produit}
                          value={produit.id_produit}
                          disabled={produit.quantite_stock === 0}
                        >
                          {`${produit.nom_produit} (stock : ${produit.quantite_stock})`}
                        </option>
                      ))}
                  </ChampSelect>
                </div>
                <div className="w-24 shrink-0">
                  <Champ
                    id={`txtQuantiteLigne${position}`}
                    aria-label="Quantité"
                    type="number"
                    min="1"
                    value={ligne.quantite}
                    onChange={(e) => modifierLigne(position, 'quantite', e.target.value)}
                    required
                  />
                </div>
                <Bouton
                  variante="danger"
                  aria-label="Retirer la ligne"
                  disabled={listLigneFormulaire.length === 1}
                  onClick={() => supprimerLigne(position)}
                  className="mb-1 shrink-0"
                >
                  ✕
                </Bouton>
              </div>
            ))}
            <Bouton id="btnAjouterLigne" variante="secondaire" onClick={ajouterLigne}>
              + Ajouter une ligne
            </Bouton>
          </div>

          <p className="text-right text-lg font-semibold text-gray-800">
            Total : {formaterMontant(totalEnCours)}
          </p>

          {(listClient.length === 0 || listProduit.length === 0) && (
            <Alert type="info" message="Il faut au moins un client et un produit pour enregistrer une vente." />
          )}

          <div className="flex justify-end gap-2">
            <Bouton variante="secondaire" onClick={() => setModalOuvert(false)}>
              Annuler
            </Bouton>
            <Bouton type="submit" disabled={enEnvoi}>
              {enEnvoi ? 'Enregistrement...' : 'Enregistrer la vente'}
            </Bouton>
          </div>
        </form>
      </Modal>

      {/* Modal de détail d'une vente */}
      <Modal
        ouvert={venteDetail !== null}
        titre={`Vente n° ${venteDetail?.id_vente ?? ''}`}
        onFermer={() => setVenteDetail(null)}
        large
      >
        {venteDetail && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {venteDetail.nom_client} · {formaterDate(venteDetail.date_vente)} · enregistrée par{' '}
              {venteDetail.utilisateur}
            </p>
            <Table
              colonnes={listColonneLigne}
              lignes={venteDetail.lignes}
              cleLigne={(ligne) => ligne.id_ligne_vente}
            />
            <p className="text-right text-lg font-semibold text-gray-800">
              Total : {formaterMontant(venteDetail.montant_total)}
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}