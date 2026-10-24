from django.db import models


class Client(models.Model):
    """
    Client de l'entreprise. L'historique de ses ventes sera accessible via la relation inverse depuis
    Vente à l'étape suivante — aucun code à ajouter ici pour ça.
    """

    id_client = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    telephone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    adresse = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = 'client'
        verbose_name = 'Client'
        verbose_name_plural = 'Clients'
        ordering = ['nom', 'prenom']

    def __str__(self):
        return f"{self.prenom} {self.nom}"