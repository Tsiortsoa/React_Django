import type { Compte } from '../types'
import instanceApi from './api'

// Données envoyées pour créer un compte
export interface DonneesNouvelUtilisateur {
  username: string
  password: string
  first_name: string
  last_name: string
  email: string
}

export async function listerUtilisateurs(): Promise<Compte[]> {
  const reponse = await instanceApi.get<Compte[]>('/utilisateurs/')
  return reponse.data
}

export async function creerUtilisateur(donnees: DonneesNouvelUtilisateur): Promise<Compte> {
  const reponse = await instanceApi.post<Compte>('/utilisateurs/', donnees)
  return reponse.data
}

export async function promouvoirUtilisateur(id: number): Promise<Compte> {
  const reponse = await instanceApi.post<Compte>(`/utilisateurs/${id}/promouvoir/`)
  return reponse.data
}