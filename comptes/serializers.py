from django.contrib.auth import password_validation
from django.contrib.auth.models import Group
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers

from .authentication import session_valide
from .models import Utilisateur


class UtilisateurSerializer(serializers.ModelSerializer):

    est_admin = serializers.SerializerMethodField()
    en_ligne = serializers.SerializerMethodField()

    class Meta:
        model = Utilisateur
        fields = ['id', 'username', 'first_name', 'last_name', 'email',
                  'is_active', 'est_admin', 'en_ligne']

    def get_est_admin(self, utilisateur):
        return utilisateur.est_admin()

    def get_en_ligne(self, utilisateur):
        token = getattr(utilisateur, 'auth_token', None)
        return token is not None and session_valide(token)


class CreationUtilisateurSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = Utilisateur
        fields = ['username', 'password', 'first_name', 'last_name', 'email']
        extra_kwargs = {
            'username': {'min_length': 3, 'validators': [UnicodeUsernameValidator()]},
            'first_name': {'required': True, 'allow_blank': False, 'min_length': 2},
            'last_name': {'required': True, 'allow_blank': False, 'min_length': 2},
        }

    def validate_username(self, valeur):
        if Utilisateur.objects.filter(username__iexact=valeur).exists():
            raise serializers.ValidationError("Cet identifiant est déjà utilisé.")
        return valeur

    def validate(self, donnees):
        utilisateur_temporaire = Utilisateur(
            username=donnees.get('username', ''),
            first_name=donnees.get('first_name', ''),
            last_name=donnees.get('last_name', ''),
            email=donnees.get('email', ''),
        )
        try:
            password_validation.validate_password(donnees['password'], utilisateur_temporaire)
        except DjangoValidationError as erreur:
            raise serializers.ValidationError({'password': list(erreur.messages)})
        return donnees

    def create(self, donnees):
        mot_de_passe = donnees.pop('password')
        with transaction.atomic():
            utilisateur = Utilisateur(**donnees)
            utilisateur.set_password(mot_de_passe)
            utilisateur.save()
            utilisateur.groups.add(Group.objects.get(name='Employe'))
        return utilisateur