from django.contrib.auth.models import AbstractUser
from django.db import models


class Utilisateur(AbstractUser):
    """
    Modèle utilisateur personnalisé hérite de AbstractUser.
    Aucun champ 'role' ici : le rôle est déterminé par le groupe Django auquel
    l'utilisateur appartient (Admin ou Employe).
    """

    class Meta:
        db_table = 'utilisateur'

    def __str__(self):
        return self.get_full_name() or self.username

    def est_admin(self):
        """Vrai si l'utilisateur appartient au groupe Admin."""
        return self.groups.filter(name='Admin').exists()