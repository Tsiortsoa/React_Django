from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models, transaction

from clients.models import Client
from produits.models import Produit


class Vente(models.Model):
    """
    Vente enregistrée par un utilisateur pour un client.
    Ne pas créer directement avec Vente.objects.create() : passer par
    Vente.creer_vente(), qui gère les lignes, le stock et le total.
    """

    id_vente = models.AutoField(primary_key=True)
    date_vente = models.DateTimeField(auto_now_add=True)
    montant_total = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)]
    )
    client = models.ForeignKey(
        Client, on_delete=models.PROTECT, related_name='ventes', db_column='id_client'
    )
    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='ventes', db_column='id_utilisateur'
    )

    class Meta:
        db_table = 'vente'
        verbose_name = 'Vente'
        verbose_name_plural = 'Ventes'
        ordering = ['-date_vente']

    def __str__(self):
        return f"Vente #{self.id_vente} — {self.client}"

    @classmethod
    @transaction.atomic
    def creer_vente(cls, client, utilisateur, lignes):
        """
        Crée une vente complète avec ses lignes, en une seule transaction.

        lignes : liste de dicts {'produit': Produit, 'quantite': int}

        1. Vérifie le stock de CHAQUE ligne avant toute écriture.
        2. Crée la vente et ses lignes.
        3. Décrémente le stock de chaque produit.
        4. Calcule et enregistre le total.
        Si une seule ligne échoue, tout est annulé (transaction.atomic).
        """
        # 1. Vérification préalable, avant toute écriture en base
        for ligne in lignes:
            produit = ligne['produit']
            if produit.quantite_stock < ligne['quantite']:
                raise ValidationError(
                    f"Stock insuffisant pour « {produit.nom_produit} » "
                    f"(disponible : {produit.quantite_stock}, demandé : {ligne['quantite']})"
                )

        # 2. Création de la vente (total calculé après les lignes)
        vente = cls.objects.create(client=client, utilisateur=utilisateur, montant_total=0)

        total = Decimal('0')
        for ligne in lignes:
            produit = ligne['produit']
            quantite = ligne['quantite']
            sous_total = produit.prix_unitaire * quantite

            LigneVente.objects.create(
                vente=vente,
                produit=produit,
                quantite=quantite,
                prix_unitaire_vente=produit.prix_unitaire,
                sous_total=sous_total,
            )

            # 3. Mise à jour atomique du stock
            produit.quantite_stock -= quantite
            produit.save(update_fields=['quantite_stock'])

            total += sous_total

        # 4. Enregistrement du total
        vente.montant_total = total
        vente.save(update_fields=['montant_total'])
        return vente


class LigneVente(models.Model):
    """Ligne d'une vente : un produit, sa quantité, et son prix au moment de la vente."""

    id_ligne_vente = models.AutoField(primary_key=True)
    quantite = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    prix_unitaire_vente = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    sous_total = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    vente = models.ForeignKey(
        Vente, on_delete=models.CASCADE, related_name='lignes', db_column='id_vente'
    )
    produit = models.ForeignKey(
        Produit, on_delete=models.PROTECT, related_name='lignes_vente', db_column='id_produit'
    )

    class Meta:
        db_table = 'ligne_vente'
        verbose_name = 'Ligne de vente'
        verbose_name_plural = 'Lignes de vente'

    def __str__(self):
        return f"{self.quantite} x {self.produit.nom_produit}"