from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.response import Response


class SuppressionProtegeeMixin:
    """
    À placer AVANT ModelViewSet dans la liste des classes parentes.
    Renvoie une réponse 409 claire au lieu d'une erreur 500 quand la
    suppression est bloquée par une clé étrangère on_delete=PROTECT.
    """

    message_protege = "Suppression impossible : cet élément est encore utilisé."

    def destroy(self, request, *args, **kwargs):
        """Tente la suppression ; en cas de blocage PROTECT, renvoie le message du viewset."""
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response({'detail': self.message_protege}, status=status.HTTP_409_CONFLICT)