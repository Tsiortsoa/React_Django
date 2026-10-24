from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from comptes.mixins import SuppressionProtegeeMixin
from comptes.permissions import EstAdminOuLectureSeule

from .models import Categorie, Produit
from .permissions import ProduitPermission
from .serializers import CategorieSerializer, ProduitSerializer


class CategorieViewSet(SuppressionProtegeeMixin, viewsets.ModelViewSet):
    """CRUD des catégories : lecture pour tous, écriture réservée à l'Admin."""

    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    permission_classes = [IsAuthenticated, EstAdminOuLectureSeule]
    message_protege = "Impossible de supprimer cette catégorie : des produits y sont rattachés."


class ProduitViewSet(SuppressionProtegeeMixin, viewsets.ModelViewSet):
    """CRUD des produits : voir ProduitPermission pour la répartition Admin / Employé."""

    queryset = Produit.objects.select_related('categorie').all()
    serializer_class = ProduitSerializer
    permission_classes = [IsAuthenticated, ProduitPermission]
    message_protege = "Impossible de supprimer ce produit : il apparaît dans des ventes."

    def update(self, request, *args, **kwargs):
        """
        PUT et PATCH passent tous deux par cette méthode.
        Un Employé ne peut modifier que la quantité en stock ; tout autre champ est refusé.
        """
        if not request.user.est_admin():
            champs_interdits = set(request.data.keys()) - {'quantite_stock'}
            if champs_interdits:
                return Response(
                    {'detail': "Un employé ne peut modifier que la quantité en stock."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        return super().update(request, *args, **kwargs)