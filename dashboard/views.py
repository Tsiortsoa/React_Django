from datetime import timedelta

from django.db.models import F, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from produits.models import Produit
from produits.serializers import ProduitSerializer
from ventes.models import Vente
from ventes.serializers import VenteSerializer


class DashboardView(APIView):
    """
    Données du tableau de bord, agrégées en une seule requête côté frontend.
    Tout le monde reçoit les indicateurs opérationnels ; l'Admin reçoit en plus
    les indicateurs financiers globaux et la courbe d'évolution des ventes.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """GET /api/dashboard/ : renvoie les indicateurs adaptés au rôle de l'utilisateur."""
        est_admin = request.user.groups.filter(name='Admin').exists()
        aujourdhui = timezone.localdate()

        # Revenu des ventes enregistrées aujourd'hui (0 s'il n'y en a pas)
        revenu_du_jour = (Vente.objects.filter(date_vente__date=aujourdhui)
                          .aggregate(total=Sum('montant_total'))['total'] or 0)

        # Même règle que Produit.stock_bas : stock <= seuil minimum
        produits_stock_bas = Produit.objects.filter(quantite_stock__lte=F('seuil_minimum'))

        # Les 5 ventes les plus récentes (Meta.ordering de Vente : plus récente d'abord)
        ventes_recentes = (Vente.objects
                           .select_related('client', 'utilisateur')
                           .prefetch_related('lignes__produit')[:5])

        donnees = {
            'revenu_du_jour': revenu_du_jour,
            'nombre_produits': Produit.objects.count(),
            'produits_stock_bas': ProduitSerializer(produits_stock_bas, many=True).data,
            'ventes_recentes': VenteSerializer(ventes_recentes, many=True).data,
        }

        # Indicateurs réservés à l'Admin
        if est_admin:
            debut = aujourdhui - timedelta(days=29)  # fenêtre de 30 jours, aujourd'hui inclus
            evolution = (Vente.objects.filter(date_vente__date__gte=debut)
                         .annotate(jour=TruncDate('date_vente'))
                         .values('jour')
                         .annotate(total=Sum('montant_total'))
                         .order_by('jour'))
            donnees['revenu_total'] = Vente.objects.aggregate(total=Sum('montant_total'))['total'] or 0
            donnees['nombre_ventes'] = Vente.objects.count()
            donnees['evolution_ventes'] = list(evolution)  # [{'jour': ..., 'total': ...}, ...]

        return Response(donnees)