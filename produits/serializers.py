from rest_framework import serializers

from .models import Categorie, Produit

# Plafond de stock et de seuil
LIMITE_STOCK = 1_000_000


class CategorieSerializer(serializers.ModelSerializer):
    nombre_produits = serializers.ReadOnlyField()

    class Meta:
        model = Categorie
        fields = ['id_categorie', 'nom_categorie', 'description', 'nombre_produits']
        extra_kwargs = {'nom_categorie': {'min_length': 2}}


class ProduitSerializer(serializers.ModelSerializer):
    stock_bas = serializers.ReadOnlyField()

    class Meta:
        model = Produit
        fields = [
            'id_produit', 'nom_produit', 'prix_unitaire', 'quantite_stock',
            'seuil_minimum', 'date_creation', 'categorie', 'stock_bas',
        ]
        extra_kwargs = {
            'nom_produit': {'min_length': 2},
            'quantite_stock': {'max_value': LIMITE_STOCK},
            'seuil_minimum': {'max_value': LIMITE_STOCK},
        }

    def validate_nom_produit(self, valeur):
        """Refuse un nom déjà utilisé"""
        doublons = Produit.objects.filter(nom_produit__iexact=valeur)
        if self.instance:  # en modification, le produit ne se compare pas à lui-même
            doublons = doublons.exclude(pk=self.instance.pk)
        if doublons.exists():
            raise serializers.ValidationError("Un produit portant ce nom existe déjà.")
        return valeur

    def validate_prix_unitaire(self, valeur):
        """Le prix doit être strictement positif."""
        if valeur <= 0:
            raise serializers.ValidationError("Le prix doit être supérieur à 0.")
        return valeur