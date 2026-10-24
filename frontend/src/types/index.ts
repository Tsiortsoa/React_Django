export interface Categorie {
  id_categorie: number
  nom_categorie: string
  description: string
  nombre_produits: number 
}

export interface Produit {
  id_produit: number
  nom_produit: string
  prix_unitaire: string
  quantite_stock: number
  seuil_minimum: number
  date_creation: string
  categorie: number 
  stock_bas: boolean 
}

export interface Client {
  id_client: number
  nom: string
  prenom: string
  telephone: string
  email: string
  adresse: string
}

export interface LigneVente {
  id_ligne_vente: number
  produit: number 
  nom_produit: string
  quantite: number
  prix_unitaire_vente: string
  sous_total: string
}

export interface Vente {
  id_vente: number
  date_vente: string 
  montant_total: string
  client: number 
  nom_client: string
  utilisateur: string 
  lignes: LigneVente[]
}

export interface Compte {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  is_active: boolean
  est_admin: boolean
  en_ligne: boolean
}

export interface PointEvolution {
  jour: string
  total: number
}

export interface DonneesDashboard {
  revenu_du_jour: number
  nombre_produits: number
  produits_stock_bas: Produit[]
  ventes_recentes: Vente[]
  revenu_total?: number
  nombre_ventes?: number
  evolution_ventes?: PointEvolution[]
}