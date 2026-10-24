import { useEffect, useState, type FormEvent } from 'react'

import Alert from '../components/Alert'
import Bouton from '../components/Bouton'
import Champ from '../components/Champ'
import ChampSelect from '../components/ChampSelect'
import Header from '../components/Header'
import Modal from '../components/Modal'
import NoteObligatoire from '../components/NoteObligatoire'
import Table, { type Colonne } from '../components/Table'
import { useAuth } from '../context/AuthContext'
import { useConfirmation } from '../context/ConfirmationContext'
import { useToast } from '../context/ToastContext'
import { listerCategories } from '../services/categorieService'
import { extraireMessageErreur } from '../services/erreurs'
import {
  ajusterStock,
  creerProduit,
  listerProduits,
  modifierProduit,
  supprimerProduit,
} from '../services/produitService'
import type { Categorie, Produit } from '../types'

interface FormulaireProduit {
  nom_produit: string
  prix_unitaire: string
  quantite_stock: string
  seuil_minimum: string
  categorie: string
}

const formulaireVide: FormulaireProduit = {
  nom_produit: '',
  prix_unitaire: '',
  quantite_stock: '0',
  seuil_minimum: '5',
  categorie: '',
}

export default function ProduitsPage() {
  const { utilisateur } = useAuth()
  const { afficherErreur, afficherSucces } = useToast()
  const demanderConfirmation = useConfirmation()
  const estAdmin = utilisateur?.estAdmin ?? false

  const [listProduit, setListProduit] = useState<Produit[]>([])
  const [listCategorie, setListCategorie] = useState<Categorie[]>([])
  const [compteurRechargement, setCompteurRechargement] = useState(0)

  const [modalOuvert, setModalOuvert] = useState(false)
  const [produitEnEdition, setProduitEnEdition] = useState<Produit | null>(null)
  const [frmProduit, setFrmProduit] = useState<FormulaireProduit>(formulaireVide)

  const [produitStock, setProduitStock] = useState<Produit | null>(null)
  const [txtAjoutStock, setTxtAjoutStock] = useState('')

  const [enEnvoi, setEnEnvoi] = useState(false)

  useEffect(() => {
    Promise.all([listerProduits(), listerCategories()])
      .then(([produits, categories]) => {
        setListProduit(produits)
        setListCategorie(categories)
      })
      .catch((erreur) => afficherErreur(extraireMessageErreur(erreur)))
  }, [compteurRechargement, afficherErreur])

  function nomCategorie(idCategorie: number): string {
    return listCategorie.find((c) => c.id_categorie === idCategorie)?.nom_categorie ?? '—'
  }

  function modifierChamp(nom: keyof FormulaireProduit, valeur: string) {
    setFrmProduit((precedent) => ({ ...precedent, [nom]: valeur }))
  }

  function ouvrirCreation() {
    setProduitEnEdition(null)
    setFrmProduit(formulaireVide)
    setModalOuvert(true)
  }

  function ouvrirModification(produit: Produit) {
    setProduitEnEdition(produit)
    setFrmProduit({
      nom_produit: produit.nom_produit,
      prix_unitaire: produit.prix_unitaire,
      quantite_stock: String(produit.quantite_stock),
      seuil_minimum: String(produit.seuil_minimum),
      categorie: String(produit.categorie),
    })
    setModalOuvert(true)
  }

  async function soumettreFormulaire(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault()
    setEnEnvoi(true)
    const donnees = {
      nom_produit: frmProduit.nom_produit,
      prix_unitaire: frmProduit.prix_unitaire,
      quantite_stock: Number(frmProduit.quantite_stock),
      seuil_minimum: Number(frmProduit.seuil_minimum),
      categorie: Number(frmProduit.categorie),
    }
    try {
      if (produitEnEdition) {
        await modifierProduit(produitEnEdition.id_produit, donnees)
        afficherSucces('Produit modifié.')
      } else {
        await creerProduit(donnees)
        afficherSucces('Produit créé.')
      }
      setModalOuvert(false)
      setCompteurRechargement((n) => n + 1)
    } catch (erreur) {
      afficherErreur(extraireMessageErreur(erreur))
    } finally {
      setEnEnvoi(false)
    }
  }

  async function supprimer(produit: Produit) {
    const confirme = await demanderConfirmation({
      titre: 'Supprimer le produit',
      message: `Supprimer le produit « ${produit.nom_produit} » ? Cette action est définitive.`,
      libelleConfirmer: 'Supprimer',
      danger: true,
    })
    if (!confirme) return

    try {
      await supprimerProduit(produit.id_produit)
      afficherSucces('Produit supprimé.')
      setCompteurRechargement((n) => n + 1)
    } catch (erreur) {
      afficherErreur(extraireMessageErreur(erreur))
    }
  }

  function ouvrirAjoutStock(produit: Produit) {
    setProduitStock(produit)
    setTxtAjoutStock('')
  }

  // Ajoute la quantité saisie au stock actuel
  async function soumettreAjoutStock(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault()
    if (!produitStock) return
    setEnEnvoi(true)
    try {
      await ajusterStock(produitStock.id_produit, produitStock.quantite_stock + Number(txtAjoutStock))
      afficherSucces(`Stock de « ${produitStock.nom_produit} » mis à jour.`)
      setProduitStock(null)
      setCompteurRechargement((n) => n + 1)
    } catch (erreur) {
      afficherErreur(extraireMessageErreur(erreur))
    } finally {
      setEnEnvoi(false)
    }
  }

  const listColonne: Colonne<Produit>[] = [
    { cle: 'nom', titre: 'Produit', rendu: (produit) => produit.nom_produit },
    { cle: 'categorie', titre: 'Catégorie', rendu: (produit) => nomCategorie(produit.categorie) },
    {
      cle: 'prix',
      titre: 'Prix',
      rendu: (produit) =>
        Number(produit.prix_unitaire).toLocaleString('fr-FR', { minimumFractionDigits: 2 }),
    },
    {
      cle: 'stock',
      titre: 'Stock',
      rendu: (produit) => (
        <span>
          {produit.quantite_stock}
          {produit.stock_bas && (
            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              Stock bas
            </span>
          )}
        </span>
      ),
    },
    {
      cle: 'actions',
      titre: 'Actions',
      rendu: (produit) => (
        <div className="flex flex-wrap gap-2">
          <Bouton variante="secondaire" onClick={() => ouvrirAjoutStock(produit)}>
            + Stock
          </Bouton>
          {estAdmin && (
            <>
              <Bouton variante="secondaire" onClick={() => ouvrirModification(produit)}>
                Modifier
              </Bouton>
              <Bouton variante="danger" onClick={() => supprimer(produit)}>
                Supprimer
              </Bouton>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <Header titre="Produits">
        {estAdmin && (
          <Bouton id="btnNouveauProduit" onClick={ouvrirCreation}>
            Nouveau produit
          </Bouton>
        )}
      </Header>

      <Table
        colonnes={listColonne}
        lignes={listProduit}
        cleLigne={(produit) => produit.id_produit}
        messageVide="Aucun produit pour le moment."
      />

      {/* Modal de création / modification (Admin) */}
      <Modal
        ouvert={modalOuvert}
        titre={produitEnEdition ? 'Modifier le produit' : 'Nouveau produit'}
        onFermer={() => setModalOuvert(false)}
      >
        <form onSubmit={soumettreFormulaire} className="space-y-4">
          <NoteObligatoire />
          <Champ
            id="txtNomProduit"
            libelle="Nom"
            value={frmProduit.nom_produit}
            onChange={(e) => modifierChamp('nom_produit', e.target.value)}
            minLength={2}
            maxLength={150}
            required
          />
          <Champ
            id="txtPrixProduit"
            libelle="Prix unitaire"
            type="number"
            min="0.01"
            max="99999999.99"
            step="0.01"
            value={frmProduit.prix_unitaire}
            onChange={(e) => modifierChamp('prix_unitaire', e.target.value)}
            required
          />
          <Champ
            id="txtStockProduit"
            libelle="Quantité en stock"
            type="number"
            min="0"
            max="1000000"
            step="1"
            value={frmProduit.quantite_stock}
            onChange={(e) => modifierChamp('quantite_stock', e.target.value)}
            required
          />
          <Champ
            id="txtSeuilProduit"
            libelle="Seuil minimum"
            type="number"
            min="0"
            max="1000000"
            step="1"
            value={frmProduit.seuil_minimum}
            onChange={(e) => modifierChamp('seuil_minimum', e.target.value)}
            required
          />
          <ChampSelect
            id="selCategorieProduit"
            libelle="Catégorie"
            value={frmProduit.categorie}
            onChange={(e) => modifierChamp('categorie', e.target.value)}
            required
          >
            <option value="">Choisir une catégorie</option>
            {listCategorie.map((categorie) => (
              <option key={categorie.id_categorie} value={categorie.id_categorie}>
                {categorie.nom_categorie}
              </option>
            ))}
          </ChampSelect>

          {listCategorie.length === 0 && (
            <Alert type="info" message="Aucune catégorie : créez-en une avant d'ajouter un produit." />
          )}

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

      {/* Modal d'ajout de stock (Admin et Employé) */}
      <Modal
        ouvert={produitStock !== null}
        titre={`Ajouter du stock : ${produitStock?.nom_produit ?? ''}`}
        onFermer={() => setProduitStock(null)}
      >
        <form onSubmit={soumettreAjoutStock} className="space-y-4">
          <NoteObligatoire />
          <p className="text-sm text-gray-600">Stock actuel : {produitStock?.quantite_stock}</p>
          <Champ
            id="txtAjoutStock"
            libelle="Quantité à ajouter"
            type="number"
            min="1"
            max="100000"
            step="1"
            value={txtAjoutStock}
            onChange={(e) => setTxtAjoutStock(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2">
            <Bouton variante="secondaire" onClick={() => setProduitStock(null)}>
              Annuler
            </Bouton>
            <Bouton type="submit" disabled={enEnvoi}>
              {enEnvoi ? 'Ajout...' : 'Ajouter'}
            </Bouton>
          </div>
        </form>
      </Modal>
    </div>
  )
}