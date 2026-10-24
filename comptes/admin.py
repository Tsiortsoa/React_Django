from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Utilisateur


@admin.register(Utilisateur)
class UtilisateurAdmin(UserAdmin):
    """
    Réutilise l'interface admin standard de Django (UserAdmin) :
    gestion du mot de passe, des permissions, et surtout des groupes
    (Admin / Employe) — sans rien réécrire nous-mêmes.
    """
    pass