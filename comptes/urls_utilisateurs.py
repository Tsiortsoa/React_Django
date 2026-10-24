from rest_framework.routers import SimpleRouter

from .views_utilisateurs import UtilisateurViewSet

router = SimpleRouter()
router.register('utilisateurs', UtilisateurViewSet, basename='utilisateur')

urlpatterns = router.urls