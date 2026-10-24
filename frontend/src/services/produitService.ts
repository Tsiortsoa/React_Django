import type { Produit } from '../types'
import instanceApi from './api'

// Données envoyées pour créer ou modifier un produit
export interface DonneesProduit {
  nom_produit: string
  prix_unitaire: string
  quantite_stock: number
  seuil_minimum: number
  categorie: number
}

// GET /api/produits/ : liste de tous les produits
export async function listerProduits(): Promise<Produit[]> {
  const reponse = await instanceApi.get<Produit[]>('/produits/')
  return reponse.data
}

// POST /api/produits/ : création (Admin)
export async function creerProduit(donnees: DonneesProduit): Promise<Produit> {
  const reponse = await instanceApi.post<Produit>('/produits/', donnees)
  return reponse.data
}

// PUT /api/produits/<id>/ : modification complète (Admin)
export async function modifierProduit(id: number, donnees: DonneesProduit): Promise<Produit> {
  const reponse = await instanceApi.put<Produit>(`/produits/${id}/`, donnees)
  return reponse.data
}

// PATCH /api/produits/<id>/ : modifie uniquement le stock (Admin et Employé)
export async function ajusterStock(id: number, quantiteStock: number): Promise<Produit> {
  const reponse = await instanceApi.patch<Produit>(`/produits/${id}/`, { quantite_stock: quantiteStock })
  return reponse.data
}

// DELETE /api/produits/<id>/ : suppression (Admin) ; refusée en 409 si le produit figure dans des ventes
export async function supprimerProduit(id: number): Promise<void> {
  await instanceApi.delete(`/produits/${id}/`)
}