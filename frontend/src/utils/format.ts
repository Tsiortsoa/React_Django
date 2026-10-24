// Formate un montant reçu de l'API ("12.5" ou 12.5) : "12,50"
export function formaterMontant(valeur: string | number): string {
  return Number(valeur).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Formate une date ISO de l'API : "16/10/2026 06:56"
export function formaterDate(dateIso: string): string {
  return new Date(dateIso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}