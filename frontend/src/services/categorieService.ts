import type { Categorie } from '../types'
import instanceApi from './api'

// Données envoyées pour créer ou modifier une catégorie
export type DonneesCategorie = Pick<Categorie, 'nom_categorie' | 'description'>

// GET /api/categories/ : liste de toutes les catégories
export async function listerCategories(): Promise<Categorie[]> {
  const reponse = await instanceApi.get<Categorie[]>('/categories/')
  return reponse.data
}

// POST /api/categories/ : création (Admin)
export async function creerCategorie(donnees: DonneesCategorie): Promise<Categorie> {
  const reponse = await instanceApi.post<Categorie>('/categories/', donnees)
  return reponse.data
}

// PUT /api/categories/<id>/ : modification (Admin)
export async function modifierCategorie(id: number, donnees: DonneesCategorie): Promise<Categorie> {
  const reponse = await instanceApi.put<Categorie>(`/categories/${id}/`, donnees)
  return reponse.data
}

// DELETE /api/categories/<id>/ : suppression (Admin) ; refusée en 409 si des produits y sont rattachés
export async function supprimerCategorie(id: number): Promise<void> {
  await instanceApi.delete(`/categories/${id}/`)
}