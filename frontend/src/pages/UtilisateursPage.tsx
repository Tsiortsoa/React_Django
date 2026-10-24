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
import { extraireMessageErreur } from '../services/erreurs'
import {
  creerUtilisateur,
  listerUtilisateurs,
  promouvoirUtilisateur,
} from '../services/utilisateurService'
import type { Compte } from '../types'

interface FormulaireUtilisateur {
  username: string
  first_name: string
  last_name: string
  email: string
  password: string
  confirmation: string
}

const formulaireVide: FormulaireUtilisateur = {
  username: '',
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirmation: '',
}

export default function UtilisateursPage() {
  const { utilisateur } = useAuth()
  const { afficherErreur, afficherSucces } = useToast()
  const demanderConfirmation = useConfirmation()

  const [listCompte, setListCompte] = useState<Compte[]>([])
  const [compteurRechargement, setCompteurRechargement] = useState(0)

  const [modalOuvert, setModalOuvert] = useState(false)
  const [frmUtilisateur, setFrmUtilisateur] = useState<FormulaireUtilisateur>(formulaireVide)
  const [enEnvoi, setEnEnvoi] = useState(false)

  useEffect(() => {
    listerUtilisateurs()
      .then(setListCompte)
      .catch((erreur) => afficherErreur(extraireMessageErreur(erreur)))
  }, [compteurRechargement, afficherErreur])

  function modifierChamp(nom: keyof FormulaireUtilisateur, valeur: string) {
    setFrmUtilisateur((precedent) => ({ ...precedent, [nom]: valeur }))
  }

  function ouvrirCreation() {
    setFrmUtilisateur(formulaireVide)
    setModalOuvert(true)
  }

  async function soumettreFormulaire(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault()

    if (frmUtilisateur.password !== frmUtilisateur.confirmation) {
      afficherErreur('Les deux mots de passe ne correspondent pas.')
      return
    }

    setEnEnvoi(true)
    try {
      await creerUtilisateur({
        username: frmUtilisateur.username,
        password: frmUtilisateur.password,
        first_name: frmUtilisateur.first_name,
        last_name: frmUtilisateur.last_name,
        email: frmUtilisateur.email,
      })
      setModalOuvert(false)
      afficherSucces(`Compte « ${frmUtilisateur.username} » créé avec le rôle Employé.`)
      setCompteurRechargement((n) => n + 1)
    } catch (erreur) {
      afficherErreur(extraireMessageErreur(erreur))
    } finally {
      setEnEnvoi(false)
    }
  }

  // Promeut un Employé en Admin après confirmation, puis recharge la liste
  async function promouvoir(compte: Compte) {
    const confirme = await demanderConfirmation({
      titre: "Promouvoir au rôle d'administrateur",
      message:
        `Promouvoir « ${compte.username} » au rôle d'administrateur ?\n\n` +
        'Cette personne aura accès à toutes les fonctionnalités. ' +
        "Cette action ne peut pas être annulée depuis l'application.",
      libelleConfirmer: 'Promouvoir',
    })
    if (!confirme) return

    try {
      await promouvoirUtilisateur(compte.id)
      afficherSucces(`${compte.username} est maintenant administrateur.`)
      setCompteurRechargement((n) => n + 1)
    } catch (erreur) {
      afficherErreur(extraireMessageErreur(erreur))
    }
  }

  const listColonne: Colonne<Compte>[] = [
    {
      cle: 'username',
      titre: 'Identifiant',
      rendu: (compte) =>
        compte.username === utilisateur?.username ? `${compte.username} (vous)` : compte.username,
    },
    {
      cle: 'nom',
      titre: 'Nom',
      rendu: (compte) => `${compte.first_name} ${compte.last_name}`.trim() || '—',
    },
    { cle: 'email', titre: 'Email', rendu: (compte) => compte.email || '—' },
    {
      cle: 'role',
      titre: 'Rôle',
      rendu: (compte) =>
        compte.est_admin ? (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            Admin
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
            Employé
          </span>
        ),
    },
    {
      cle: 'statut',
      titre: 'Statut',
      rendu: (compte) => {
        if (!compte.is_active) return <span className="text-red-700">Désactivé</span>
        return compte.en_ligne ? (
          <span className="font-medium text-green-700">Connecté</span>
        ) : (
          <span className="text-gray-500">Hors ligne</span>
        )
      },
    },
    {
      cle: 'actions',
      titre: 'Actions',
      // Le bouton n'existe que pour les comptes qui ne sont pas encore administrateurs
      rendu: (compte) =>
        compte.est_admin ? null : (
          <Bouton variante="secondaire" onClick={() => promouvoir(compte)}>
            Promouvoir
          </Bouton>
        ),
    },
  ]

  return (
    <div className="space-y-4">
      <Header titre="Utilisateurs">
        <Bouton id="btnNouvelUtilisateur" onClick={ouvrirCreation}>
          Nouvel utilisateur
        </Bouton>
      </Header>

      <Table
        colonnes={listColonne}
        lignes={listCompte}
        cleLigne={(compte) => compte.id}
        messageVide="Aucun utilisateur."
      />

      {/* Modal de création d'un compte */}
      <Modal ouvert={modalOuvert} titre="Nouvel utilisateur" onFermer={() => setModalOuvert(false)}>
        <form onSubmit={soumettreFormulaire} className="space-y-4">
          <NoteObligatoire />
          <p className="text-sm text-gray-600">
            Le compte sera créé avec le rôle Employé. Vous pourrez ensuite le promouvoir.
          </p>

          <Champ
            id="txtUsernameNouveau"
            libelle="Identifiant"
            value={frmUtilisateur.username}
            onChange={(e) => modifierChamp('username', e.target.value)}
            minLength={3}
            maxLength={150}
            pattern={String.raw`[\w.@+\-]+`}
            title="Lettres, chiffres et @ . + - _ uniquement (3 caractères minimum)."
            autoComplete="off"
            required
          />
          <Champ
            id="txtPrenomNouveau"
            libelle="Prénom"
            value={frmUtilisateur.first_name}
            onChange={(e) => modifierChamp('first_name', e.target.value)}
            minLength={2}
            maxLength={150}
            required
          />
          <Champ
            id="txtNomNouveau"
            libelle="Nom"
            value={frmUtilisateur.last_name}
            onChange={(e) => modifierChamp('last_name', e.target.value)}
            minLength={2}
            maxLength={150}
            required
          />
          <Champ
            id="txtEmailNouveau"
            libelle="Email (facultatif)"
            type="email"
            value={frmUtilisateur.email}
            onChange={(e) => modifierChamp('email', e.target.value)}
          />
          <Champ
            id="txtMotDePasseNouveau"
            libelle="Mot de passe"
            type="password"
            value={frmUtilisateur.password}
            onChange={(e) => modifierChamp('password', e.target.value)}
            minLength={8}
            autoComplete="new-password"
            title="8 caractères minimum, pas uniquement des chiffres, pas un mot de passe courant."
            required
          />
          <Champ
            id="txtConfirmationNouveau"
            libelle="Confirmer le mot de passe"
            type="password"
            value={frmUtilisateur.confirmation}
            onChange={(e) => modifierChamp('confirmation', e.target.value)}
            autoComplete="new-password"
            required
          />

          <div className="flex justify-end gap-2">
            <Bouton variante="secondaire" onClick={() => setModalOuvert(false)}>
              Annuler
            </Bouton>
            <Bouton type="submit" disabled={enEnvoi}>
              {enEnvoi ? 'Création...' : 'Créer le compte'}
            </Bouton>
          </div>
        </form>
      </Modal>
    </div>
  )
}