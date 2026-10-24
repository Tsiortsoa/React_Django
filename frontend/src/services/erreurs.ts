import { isAxiosError } from 'axios'

const libellesChamps: Record<string, string> = {
  nom_categorie: 'Nom',
  description: 'Description',
  nom_produit: 'Nom du produit',
  prix_unitaire: 'Prix',
  quantite_stock: 'Stock',
  seuil_minimum: 'Seuil minimum',
  categorie: 'Catégorie',
  nom: 'Nom',
  prenom: 'Prénom',
  telephone: 'Téléphone',
  email: 'Email',
  adresse: 'Adresse',
  client: 'Client',
  produit: 'Produit',
  quantite: 'Quantité',
  username: 'Identifiant',
  password: 'Mot de passe',
  first_name: 'Prénom',
  last_name: 'Nom',
}

const champsSansLibelle = ['lignes', 'non_field_errors']

// Transforme la structure d'erreurs de DRF (texte, liste ou objet imbriqué) en liste de messages
function aplatirMessages(erreurs: unknown): string[] {
  if (typeof erreurs === 'string') return [erreurs]
  if (Array.isArray(erreurs)) return erreurs.flatMap(aplatirMessages)
  if (erreurs && typeof erreurs === 'object') {
    return Object.entries(erreurs).flatMap(([champ, contenu]) =>
      aplatirMessages(contenu).map((message) =>
        champsSansLibelle.includes(champ) ? message : `${libellesChamps[champ] ?? champ} : ${message}`,
      ),
    )
  }
  return []
}

export function extraireMessageErreur(erreur: unknown): string {
  if (isAxiosError(erreur) && erreur.response) {
    const donnees = erreur.response.data

    if (typeof donnees?.detail === 'string') return donnees.detail

    if (donnees && typeof donnees === 'object') {
      const messages = aplatirMessages(donnees)
      if (messages.length > 0) return messages.join(' | ')
    }
  }
  return 'Une erreur est survenue. Vérifiez que le serveur est démarré.'
}