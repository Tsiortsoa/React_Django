import { useEffect, useState, type FormEvent } from 'react'

import Bouton from '../components/Bouton'
import Champ from '../components/Champ'
import Header from '../components/Header'
import Modal from '../components/Modal'
import NoteObligatoire from '../components/NoteObligatoire'
import Table, { type Colonne } from '../components/Table'
import { useAuth } from '../context/AuthContext'
import { useConfirmation } from '../context/ConfirmationContext'
import { useToast } from '../context/ToastContext'
import {
  creerCategorie,
  listerCategories,
  modifierCategorie,
  supprimerCategorie,
} from '../services/categorieService'
import { extraireMessageErreur } from '../services/erreurs'
import type { Categorie } from '../types'

export default function CategoriesPage() {
  const { utilisateur } = useAuth()
  const { afficherErreur, afficherSucces } = useToast()
  const demanderConfirmation = useConfirmation()
  const estAdmin = utilisateur?.estAdmin ?? false

  const [listCategorie, setListCategorie] = useState<Categorie[]>([])
  const [compteurRechargement, setCompteurRechargement] = useState(0)

  const [modalOuvert, setModalOuvert] = useState(false)
  const [categorieEnEdition, setCategorieEnEdition] = useState<Categorie | null>(null)
  const [txtNom, setTxtNom] = useState('')
  const [txtDescription, setTxtDescription] = useState('')
  const [enEnvoi, setEnEnvoi] = useState(false)

  useEffect(() => {
    listerCategories()
      .then(setListCategorie)
      .catch((erreur) => afficherErreur(extraireMessageErreur(erreur)))
  }, [compteurRechargement, afficherErreur])

  function ouvrirCreation() {
    setCategorieEnEdition(null)
    setTxtNom('')
    setTxtDescription('')
    setModalOuvert(true)
  }

  function ouvrirModification(categorie: Categorie) {
    setCategorieEnEdition(categorie)
    setTxtNom(categorie.nom_categorie)
    setTxtDescription(categorie.description)
    setModalOuvert(true)
  }

  async function soumettreFormulaire(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault()
    setEnEnvoi(true)
    const donnees = { nom_categorie: txtNom, description: txtDescription }
    try {
      if (categorieEnEdition) {
        await modifierCategorie(categorieEnEdition.id_categorie, donnees)
        afficherSucces('Catégorie modifiée.')
      } else {
        await creerCategorie(donnees)
        afficherSucces('Catégorie créée.')
      }
      setModalOuvert(false)
      setCompteurRechargement((n) => n + 1)
    } catch (erreur) {
      afficherErreur(extraireMessageErreur(erreur))
    } finally {
      setEnEnvoi(false)
    }
  }

  async function supprimer(categorie: Categorie) {
    const confirme = await demanderConfirmation({
      titre: 'Supprimer la catégorie',
      message: `Supprimer la catégorie « ${categorie.nom_categorie} » ? Cette action est définitive.`,
      libelleConfirmer: 'Supprimer',
      danger: true,
    })
    if (!confirme) return

    try {
      await supprimerCategorie(categorie.id_categorie)
      afficherSucces('Catégorie supprimée.')
      setCompteurRechargement((n) => n + 1)
    } catch (erreur) {
      afficherErreur(extraireMessageErreur(erreur))
    }
  }

  const colonneActions: Colonne<Categorie> = {
    cle: 'actions',
    titre: 'Actions',
    rendu: (categorie) => (
      <div className="flex flex-wrap gap-2">
        <Bouton variante="secondaire" onClick={() => ouvrirModification(categorie)}>
          Modifier
        </Bouton>
        <Bouton variante="danger" onClick={() => supprimer(categorie)}>
          Supprimer
        </Bouton>
      </div>
    ),
  }

  const listColonne: Colonne<Categorie>[] = [
    { cle: 'nom', titre: 'Nom', rendu: (categorie) => categorie.nom_categorie },
    { cle: 'description', titre: 'Description', rendu: (categorie) => categorie.description || '—' },
    { cle: 'nombre', titre: 'Produits', rendu: (categorie) => categorie.nombre_produits },
    ...(estAdmin ? [colonneActions] : []),
  ]

  return (
    <div className="space-y-4">
      <Header titre="Catégories">
        {estAdmin && (
          <Bouton id="btnNouvelleCategorie" onClick={ouvrirCreation}>
            Nouvelle catégorie
          </Bouton>
        )}
      </Header>

      <Table
        colonnes={listColonne}
        lignes={listCategorie}
        cleLigne={(categorie) => categorie.id_categorie}
        messageVide="Aucune catégorie pour le moment."
      />

      <Modal
        ouvert={modalOuvert}
        titre={categorieEnEdition ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        onFermer={() => setModalOuvert(false)}
      >
        <form onSubmit={soumettreFormulaire} className="space-y-4">
          <NoteObligatoire />
          <Champ
            id="txtNomCategorie"
            libelle="Nom"
            value={txtNom}
            onChange={(e) => setTxtNom(e.target.value)}
            minLength={2}
            maxLength={100}
            required
          />
          <Champ
            id="txtDescriptionCategorie"
            libelle="Description (facultative)"
            value={txtDescription}
            onChange={(e) => setTxtDescription(e.target.value)}
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
    </div>
  )
}