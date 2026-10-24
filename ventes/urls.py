# ventes/urls.py
from rest_framework.routers import SimpleRouter

from .views import VenteViewSet

router = SimpleRouter()
router.register('ventes', VenteViewSet, basename='vente')

urlpatterns = router.urls