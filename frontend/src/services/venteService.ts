import type { Vente } from '../types'
import instanceApi from './api'

// Une ligne envoyée au serveur : seulement le produit et la quantité.
// Le prix et le sous-total sont calculés par le serveur.
export interface DonneesLigneVente {
  produit: number
  quantite: number
}

// Données envoyées pour créer une vente
export interface DonneesVente {
  client: number
  lignes: DonneesLigneVente[]
}

// GET /api/ventes/ : liste des ventes, la plus récente d'abord
export async function listerVentes(): Promise<Vente[]> {
  const reponse = await instanceApi.get<Vente[]>('/ventes/')
  return reponse.data
}

// POST /api/ventes/ : enregistre la vente et met à jour le stock (refusée en 400 si stock insuffisant)
export async function creerVente(donnees: DonneesVente): Promise<Vente> {
  const reponse = await instanceApi.post<Vente>('/ventes/', donnees)
  return reponse.data
}