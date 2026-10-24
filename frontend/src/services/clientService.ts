import type { Client, Vente } from '../types'
import instanceApi from './api'

// Données envoyées pour créer ou modifier un client
export type DonneesClient = Omit<Client, 'id_client'>

// GET /api/clients/ : liste de tous les clients
export async function listerClients(): Promise<Client[]> {
  const reponse = await instanceApi.get<Client[]>('/clients/')
  return reponse.data
}

// POST /api/clients/ : création
export async function creerClient(donnees: DonneesClient): Promise<Client> {
  const reponse = await instanceApi.post<Client>('/clients/', donnees)
  return reponse.data
}

// PUT /api/clients/<id>/ : modification
export async function modifierClient(id: number, donnees: DonneesClient): Promise<Client> {
  const reponse = await instanceApi.put<Client>(`/clients/${id}/`, donnees)
  return reponse.data
}

// DELETE /api/clients/<id>/ : suppression ; refusée en 409 si le client a des ventes
export async function supprimerClient(id: number): Promise<void> {
  await instanceApi.delete(`/clients/${id}/`)
}

// GET /api/clients/<id>/ventes/ : aperçu des 10 dernières ventes du client
export async function listerVentesClient(id: number): Promise<Vente[]> {
  const reponse = await instanceApi.get<Vente[]>(`/clients/${id}/ventes/`)
  return reponse.data
}