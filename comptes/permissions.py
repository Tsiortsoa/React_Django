from rest_framework.permissions import SAFE_METHODS, BasePermission


class EstAdminOuLectureSeule(BasePermission):
    """Lecture (GET) ouverte à tout utilisateur connecté. Écriture réservée au groupe Admin."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.groups.filter(name='Admin').exists()


class EstAdmin(BasePermission):
    """Réservé au groupe Admin, en lecture comme en écriture."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.est_admin()