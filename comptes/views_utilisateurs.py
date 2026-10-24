from django.contrib.auth.models import Group
from django.db import transaction
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Utilisateur
from .permissions import EstAdmin
from .serializers import CreationUtilisateurSerializer, UtilisateurSerializer


class UtilisateurViewSet(mixins.CreateModelMixin, viewsets.ReadOnlyModelViewSet):

    queryset = Utilisateur.objects.select_related('auth_token').order_by('username')
    permission_classes = [EstAdmin]

    def get_serializer_class(self):
        if self.action == 'create':
            return CreationUtilisateurSerializer
        return UtilisateurSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        utilisateur = serializer.save()
        return Response(UtilisateurSerializer(utilisateur).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def promouvoir(self, request, pk=None):
        utilisateur = self.get_object()

        if utilisateur.est_admin():
            return Response(
                {'detail': "Cet utilisateur est déjà administrateur."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        groupe_admin = Group.objects.get(name='Admin')
        groupe_employe = Group.objects.get(name='Employe')

        with transaction.atomic():
            utilisateur.groups.remove(groupe_employe)
            utilisateur.groups.add(groupe_admin)

        return Response(UtilisateurSerializer(utilisateur).data)