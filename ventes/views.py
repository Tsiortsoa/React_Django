from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Vente
from .serializers import VenteSerializer


class VenteViewSet(mixins.CreateModelMixin,
                   mixins.ListModelMixin,
                   mixins.RetrieveModelMixin,
                   viewsets.GenericViewSet):
    """
    Ventes : liste, détail et création uniquement (pas de PUT/PATCH/DELETE).
    Admin et Employé peuvent enregistrer une vente.
    """

    queryset = (Vente.objects
                .select_related('client', 'utilisateur')
                .prefetch_related('lignes__produit'))
    serializer_class = VenteSerializer
    permission_classes = [IsAuthenticated]