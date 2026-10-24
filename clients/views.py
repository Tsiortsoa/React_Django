from django.db.models import ProtectedError
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ventes.serializers import VenteSerializer

from .models import Client
from .serializers import ClientSerializer


class ClientViewSet(viewsets.ModelViewSet):
    """CRUD des clients : Admin et Employé ont les mêmes droits (cf. tableau des rôles)."""

    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'])
    def ventes(self, request, pk=None):
        """GET /api/clients/<id>/ventes/ : aperçu des 10 dernières ventes du client."""
        client = self.get_object()
        dernieres = (client.ventes
                     .select_related('utilisateur')
                     .prefetch_related('lignes__produit')[:10])
        return Response(VenteSerializer(dernieres, many=True).data)

    def destroy(self, request, *args, **kwargs):
        """Refuse proprement (409) la suppression d'un client qui a déjà des ventes."""
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {'detail': "Impossible de supprimer ce client : il a des ventes enregistrées."},
                status=status.HTTP_409_CONFLICT,
            )