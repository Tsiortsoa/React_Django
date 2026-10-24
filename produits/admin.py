from django.contrib import admin

from .models import Categorie, Produit


@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ('nom_categorie', 'nombre_produits')
    search_fields = ('nom_categorie',)


@admin.register(Produit)
class ProduitAdmin(admin.ModelAdmin):
    list_display = ('nom_produit', 'categorie', 'prix_unitaire', 'quantite_stock', 'stock_bas')
    list_filter = ('categorie',)
    search_fields = ('nom_produit',)