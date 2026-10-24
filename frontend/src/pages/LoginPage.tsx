import { useEffect, useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { Navigate } from 'react-router-dom'

import Champ from '../components/Champ'
import NoteObligatoire from '../components/NoteObligatoire'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { cleMessageSession } from '../services/api'

export default function LoginPage() {
  const { utilisateur, seConnecter } = useAuth()
  const { afficherErreur, afficherInfo } = useToast()

  const [txtUsername, setTxtUsername] = useState('')
  const [txtMotDePasse, setTxtMotDePasse] = useState('')
  const [enChargement, setEnChargement] = useState(false)

  useEffect(() => {
    const message = sessionStorage.getItem(cleMessageSession)
    if (message) afficherInfo(message)
    sessionStorage.removeItem(cleMessageSession)
  }, [afficherInfo])

  if (utilisateur) return <Navigate to="/" replace />

  async function soumettreFormulaire(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault()
    setEnChargement(true)
    try {
      await seConnecter(txtUsername, txtMotDePasse)
    } catch (erreur) {
      if (isAxiosError(erreur) && erreur.response?.status === 400) {
        afficherErreur('Identifiant ou mot de passe incorrect.')
      } else {
        afficherErreur('Connexion impossible. Vérifiez que le serveur est démarré.')
      }
    } finally {
      setEnChargement(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={soumettreFormulaire}
        className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow sm:p-8"
      >
        <h1 className="text-2xl font-bold text-gray-800">Connexion</h1>
        <NoteObligatoire />

        <Champ
          id="txtUsername"
          libelle="Identifiant"
          value={txtUsername}
          onChange={(e) => setTxtUsername(e.target.value)}
          autoComplete="username"
          required
        />
        <Champ
          id="txtMotDePasse"
          libelle="Mot de passe"
          type="password"
          value={txtMotDePasse}
          onChange={(e) => setTxtMotDePasse(e.target.value)}
          autoComplete="current-password"
          required
        />

        <button
          id="btnConnexion"
          type="submit"
          disabled={enChargement}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {enChargement ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}