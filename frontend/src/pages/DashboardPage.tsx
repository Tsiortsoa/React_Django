import { useEffect, useState } from 'react'

import Card from '../components/Card'
import CarteIndicateur from '../components/CarteIndicateur'
import GraphiqueVentes from '../components/GraphiqueVentes'
import Header from '../components/Header'
import Table, { type Colonne } from '../components/Table'
import { useToast } from '../context/ToastContext'
import { chargerDashboard } from '../services/dashboardService'
import { extraireMessageErreur } from '../services/erreurs'
import type { DonneesDashboard, Produit, Vente } from '../types'
import { formaterDate, formaterMontant } from '../utils/format'

// Colonnes du tableau des produits dont le stock est bas
const listColonneStockBas: Colonne<Produit>[] = [
  { cle: 'nom', titre: 'Produit', rendu: (produit) => produit.nom_produit },
  { cle: 'stock', titre: 'Stock', rendu: (produit) => produit.quantite_stock },
  { cle: 'seuil', titre: 'Seuil', rendu: (produit) => produit.seuil_minimum },
]

// Colonnes du tableau des ventes récentes
const listColonneVente: Colonne<Vente>[] = [
  { cle: 'numero', titre: 'N°', rendu: (vente) => vente.id_vente },
  { cle: 'date', titre: 'Date', rendu: (vente) => formaterDate(vente.date_vente) },
  { cle: 'client', titre: 'Client', rendu: (vente) => vente.nom_client },
  { cle: 'total', titre: 'Total', rendu: (vente) => formaterMontant(vente.montant_total) },
]

export default function DashboardPage() {
  const { afficherErreur } = useToast()
  const [donnees, setDonnees] = useState<DonneesDashboard | null>(null)
  const [echec, setEchec] = useState(false)

  useEffect(() => {
    chargerDashboard()
      .then(setDonnees)
      .catch((erreur) => {
        setEchec(true)
        afficherErreur(extraireMessageErreur(erreur))
      })
  }, [afficherErreur])

  return (
    <div className="space-y-6">
      <Header titre="Tableau de bord" />

      {!donnees && !echec && <p className="text-sm text-gray-500">Chargement...</p>}
      {echec && <p className="text-sm text-gray-500">Impossible d'afficher le tableau de bord.</p>}

      {donnees && (
        <>
          {/* Chiffres clés : les deux derniers n'existent que dans la réponse destinée à un Admin */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CarteIndicateur titre="Revenu du jour" valeur={formaterMontant(donnees.revenu_du_jour)} />
            <CarteIndicateur titre="Produits" valeur={String(donnees.nombre_produits)} />
            {donnees.revenu_total !== undefined && (
              <CarteIndicateur titre="Revenu total" valeur={formaterMontant(donnees.revenu_total)} />
            )}
            {donnees.nombre_ventes !== undefined && (
              <CarteIndicateur titre="Nombre de ventes" valeur={String(donnees.nombre_ventes)} />
            )}
          </div>

          {/* Graphique : réservé aux Admin */}
          {donnees.evolution_ventes !== undefined && (
            <Card titre="Évolution des ventes (30 derniers jours)">
              <GraphiqueVentes donnees={donnees.evolution_ventes} />
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="min-w-0">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Alertes de stock bas
              </h2>
              <Table
                colonnes={listColonneStockBas}
                lignes={donnees.produits_stock_bas}
                cleLigne={(produit) => produit.id_produit}
                messageVide="Aucun produit en stock bas."
              />
            </section>

            <section className="min-w-0">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Ventes récentes
              </h2>
              <Table
                colonnes={listColonneVente}
                lignes={donnees.ventes_recentes}
                cleLigne={(vente) => vente.id_vente}
                messageVide="Aucune vente pour le moment."
              />
            </section>
          </div>
        </>
      )}
    </div>
  )
}