# clients/urls.py
from rest_framework.routers import SimpleRouter

from .views import ClientViewSet

# SimpleRouter : pas de page racine d'API, celle de produits/urls.py suffit
router = SimpleRouter()
router.register('clients', ClientViewSet, basename='client')

urlpatterns = router.urls