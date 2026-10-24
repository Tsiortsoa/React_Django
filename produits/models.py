from django.core.validators import MinValueValidator
from django.db import models
from django.db.models.functions import Lower


class Categorie(models.Model):
    """Catégorie de produits — permet de les regrouper et d'en compter le nombre."""

    id_categorie = models.AutoField(primary_key=True)
    nom_categorie = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'categorie'
        verbose_name = 'Catégorie'
        verbose_name_plural = 'Catégories'
        ordering = ['nom_categorie']

    def __str__(self):
        return self.nom_categorie

    @property
    def nombre_produits(self):
        """Compteur de produits de la catégorie (exigé par le cahier des charges)."""
        return self.produits.count()


class Produit(models.Model):
    """Produit en vente, avec suivi de stock et détection de stock bas."""

    id_produit = models.AutoField(primary_key=True)
    nom_produit = models.CharField(max_length=150)
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    quantite_stock = models.PositiveIntegerField(default=0)
    seuil_minimum = models.PositiveIntegerField(default=5)
    date_creation = models.DateTimeField(auto_now_add=True)
    categorie = models.ForeignKey(
        Categorie,
        on_delete=models.PROTECT,
        related_name='produits',
        db_column='id_categorie',
    )

    class Meta:
        db_table = 'produit'
        verbose_name = 'Produit'
        verbose_name_plural = 'Produits'
        ordering = ['nom_produit']
        constraints = [
            # Un nom de produit ne peut exister qu'une fois
            models.UniqueConstraint(Lower('nom_produit'), name='produit_nom_unique_ci'),
        ]

    def __str__(self):
        return self.nom_produit

    @property
    def stock_bas(self):
        """Vrai si le stock est au seuil minimum ou en dessous (exigé par le cahier des charges)."""
        return self.quantite_stock <= self.seuil_minimum