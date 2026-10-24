# ventes/admin.py
from django.contrib import admin

from .models import LigneVente, Vente


class LigneVenteInline(admin.TabularInline):
    model = LigneVente
    extra = 0


@admin.register(Vente)
class VenteAdmin(admin.ModelAdmin):
    list_display = ('id_vente', 'client', 'utilisateur', 'date_vente', 'montant_total')
    inlines = [LigneVenteInline]