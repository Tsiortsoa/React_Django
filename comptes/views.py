from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class LoginView(ObtainAuthToken):
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        # « created » sert de date de dernière activité : on la remet à zéro à chaque connexion
        Token.objects.filter(pk=token.pk).update(created=timezone.now())
        return Response({
            'token': token.key,
            'username': user.username,
            'is_admin': user.est_admin(),
        })


class LogoutView(APIView):
    """Déconnexion : supprime le token"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response(status=204)


class WhoAmIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'username': request.user.username,
            'is_admin': request.user.est_admin(),
        })