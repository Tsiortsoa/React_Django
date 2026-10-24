from rest_framework.permissions import SAFE_METHODS, BasePermission


class ProduitPermission(BasePermission):
    """
    Lecture : tout utilisateur connecté.
    Modification (PUT/PATCH, ex. ajuster le stock) : Admin et Employé.
    Création / suppression : Admin uniquement.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        if request.method in ('POST', 'DELETE'):
            return request.user.groups.filter(name='Admin').exists()
        return True  # PUT / PATCH