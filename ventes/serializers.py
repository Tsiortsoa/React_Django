from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import LigneVente, Vente


class LigneVenteSerializer(serializers.ModelSerializer):
    """Une ligne de vente. Prix et sous-total sont calculés côté serveur (lecture seule)."""

    nom_produit = serializers.CharField(source='produit.nom_produit', read_only=True)

    class Meta:
        model = LigneVente
        fields = ['id_ligne_vente', 'produit', 'nom_produit', 'quantite',
                  'prix_unitaire_vente', 'sous_total']
        read_only_fields = ['prix_unitaire_vente', 'sous_total']


class VenteSerializer(serializers.ModelSerializer):
    """
    Une vente avec ses lignes. En entrée : client + lignes (produit, quantite).
    Le total, la date et l'utilisateur sont déterminés par le serveur.
    """

    lignes = LigneVenteSerializer(many=True)
    nom_client = serializers.StringRelatedField(source='client', read_only=True)
    utilisateur = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Vente
        fields = ['id_vente', 'date_vente', 'montant_total', 'client', 'nom_client',
                  'utilisateur', 'lignes']
        read_only_fields = ['date_vente', 'montant_total']

    def validate_lignes(self, lignes):
        """Exige au moins une ligne et interdit le même produit sur deux lignes."""
        if not lignes:
            raise serializers.ValidationError("Une vente doit contenir au moins une ligne.")
        ids_produits = [ligne['produit'].pk for ligne in lignes]
        if len(ids_produits) != len(set(ids_produits)):
            raise serializers.ValidationError(
                "Un même produit ne peut apparaître qu'une fois : regroupez les quantités."
            )
        return lignes

    def create(self, validated_data):
        """Délègue au modèle (transaction + stock) et traduit son erreur en réponse HTTP 400."""
        lignes = [{'produit': l['produit'], 'quantite': l['quantite']}
                  for l in validated_data['lignes']]
        try:
            return Vente.creer_vente(
                client=validated_data['client'],
                utilisateur=self.context['request'].user,
                lignes=lignes,
            )
        except DjangoValidationError as erreur:
            raise serializers.ValidationError({'lignes': erreur.messages})