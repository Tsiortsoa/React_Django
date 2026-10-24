import re

from rest_framework import serializers

from .models import Client

MOTIF_NOM = re.compile(r"^[^\W\d_]+(?:[ '’\-][^\W\d_]+)*$")
MOTIF_TELEPHONE = re.compile(r"^\+?[0-9 .\-()]{6,20}$")

MESSAGE_NOM = "Lettres, espaces, tirets et apostrophes uniquement."


class ClientSerializer(serializers.ModelSerializer):
    """Convertit un Client en JSON (et inversement) pour l'API, avec ses règles de saisie."""

    class Meta:
        model = Client
        fields = ['id_client', 'nom', 'prenom', 'telephone', 'email', 'adresse']
        extra_kwargs = {
            'nom': {'min_length': 2},
            'prenom': {'min_length': 2},
        }

    def validate_nom(self, valeur):
        if not MOTIF_NOM.match(valeur):
            raise serializers.ValidationError(MESSAGE_NOM)
        return valeur

    def validate_prenom(self, valeur):
        if not MOTIF_NOM.match(valeur):
            raise serializers.ValidationError(MESSAGE_NOM)
        return valeur

    def validate_telephone(self, valeur):
        if valeur and not MOTIF_TELEPHONE.match(valeur):
            raise serializers.ValidationError(
                "6 à 20 caractères : chiffres, espaces et + - . ( ) uniquement."
            )
        return valeur