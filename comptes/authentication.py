from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import AuthenticationFailed

DELAI_RAFRAICHISSEMENT = timedelta(minutes=1)


def duree_max_inactivite():
    """Durée d'inactivité tolérée"""
    return timedelta(minutes=settings.SESSION_INACTIVITE_MAX_MINUTES)


def session_valide(token):
    """Vrai si le token a été utilisé assez récemment pour être encore accepté."""
    return timezone.now() - token.created <= duree_max_inactivite()


class TokenExpirante(TokenAuthentication):
    """
    Authentification par token avec expiration
    Un token resté inutilisé trop longtemps est supprimé et refusé.
    """

    def authenticate_credentials(self, key):
        utilisateur, token = super().authenticate_credentials(key)
        maintenant = timezone.now()

        if maintenant - token.created > duree_max_inactivite():
            token.delete()
            raise AuthenticationFailed("Session expirée. Veuillez vous reconnecter.")

        if maintenant - token.created > DELAI_RAFRAICHISSEMENT:
            Token.objects.filter(pk=token.pk).update(created=maintenant)

        return utilisateur, token