# Gestion Entreprise (Projet académique)

Application web de gestion d'une petite entreprise : produits, catégories, clients, ventes avec mise à jour du stock, tableau de bord et gestion des utilisateurs.

- **Backend** : Python, Django, Django REST Framework, SQLite3
- **Frontend** : React (TypeScript), Vite, Tailwind CSS, React Router, Axios, Recharts

## Fonctionnalités

- Authentification par token (connexion, déconnexion), expiration de session par inactivité
- Catégories et produits : CRUD, stock, seuil minimum, détection du stock bas, nom de produit unique
- Clients : CRUD, historique des ventes
- Ventes : plusieurs lignes par vente, totaux calculés par le serveur, stock mis à jour dans une transaction, vente refusée si le stock est insuffisant
- Tableau de bord : revenu du jour, revenu total, nombre de ventes et de produits, alertes de stock bas, ventes récentes, courbe d'évolution sur 30 jours
- Utilisateurs : création de comptes Employé, promotion d'un Employé en Admin, statut de connexion
- Interface responsive, notifications, boîtes de confirmation

## Rôles et droits

| Action                                            | Admin |            Employé             |
|---------------------------------------------------|-------|--------------------------------|
| Consulter produits, catégories, clients, ventes   | oui   | oui                            |
| Enregistrer une vente, gérer les clients          | oui   | oui                            |
| Ajouter du stock à un produit                     | oui   | oui                            |
| Créer, modifier, supprimer produits et catégories | oui   | non                            |
| Revenu total, nombre de ventes, graphique         | oui   | non (revenu du jour seulement) |
| Gérer les utilisateurs, promouvoir                | oui   | non                            |

Les droits sont portés par les groupes Django `Admin` et `Employe`. Ils sont appliqués par le serveur (permissions DRF) ; l'interface ne fait que masquer ce qui est interdit.

## Structure du dépôt

```
config/        réglages Django et URLs racine
comptes/       utilisateurs, authentification, groupes, promotion
produits/      catégories et produits
clients/       clients et historique
ventes/        ventes et lignes de vente (logique de stock)
dashboard/     indicateurs agrégés
frontend/      application React (src/components, pages, services, context, routes)
```

## Installation en local

Prérequis : Python 3.12 ou plus récent, Node.js (version LTS récente).

### Backend

```bash
python -m venv venv
venv\Scripts\activate          # Linux / macOS : source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate       # crée la base et les groupes Admin / Employe
python manage.py createsuperuser
```

Un super-utilisateur n'appartient à aucun groupe : **il faut l'ajouter au groupe `Admin`** pour qu'il ait les droits Admin de l'application (dans `/admin/` > Utilisateurs, ou avec la commande ci-dessous).

```bash
python manage.py shell -c "from comptes.models import Utilisateur; from django.contrib.auth.models import Group; Utilisateur.objects.get(username='VOTRE_IDENTIFIANT').groups.add(Group.objects.get(name='Admin'))"
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application est disponible sur http://localhost:5173. En développement, le serveur Vite redirige les appels `/api` vers Django (http://127.0.0.1:8000).

Les autres comptes (Employés) se créent ensuite depuis l'application, page **Utilisateurs**.

## Variables d'environnement

Voir `.env.example` (backend) et `frontend/.env.example` (frontend). En local, aucune n'est obligatoire.

| Variable | Rôle |
|---|---|
| `DJANGO_SECRET_KEY` | Clé secrète Django (obligatoire en production) |
| `DJANGO_DEBUG` | `False` en production |
| `DJANGO_ALLOWED_HOSTS` | Noms de domaine autorisés, séparés par des virgules |
| `CORS_ALLOWED_ORIGINS` | Adresse du frontend autorisée à appeler l'API |
| `CSRF_TRUSTED_ORIGINS` | Adresse du backend, pour la connexion à `/admin/` en HTTPS |
| `VITE_API_URL` | Adresse de l'API, côté frontend, en production |

## Principaux endpoints

|         Méthode et route                         |                           Description                      |
|--------------------------------------------------|------------------------------------------------------------|
| `POST /api/auth/login/`                          | Connexion, renvoie le token et le rôle                     |
| `POST /api/auth/logout/`                         | Déconnexion (supprime le token)                            |
| `GET /api/auth/whoami/`                          | Utilisateur connecté et son rôle                           |
| `/api/categories/`, `/api/produits/`             | CRUD (écriture Admin ; un Employé ne modifie que le stock) |
| `/api/clients/`, `GET /api/clients/<id>/ventes/` | CRUD et historique                                         |
| `GET, POST /api/ventes/`                         | Liste, détail et création de vente                         |
| `GET, POST /api/utilisateurs/`                   | Liste et création de comptes (Admin)                       |
| `POST /api/utilisateurs/<id>/promouvoir/`        | Promotion Employé vers Admin (Admin)                       |
| `GET /api/dashboard/`                            | Indicateurs, adaptés au rôle                               |

Toutes les routes, sauf la connexion, demandent l'en-tête `Authorization: Token <token>`.

## Limites connues et pistes d'amélioration

- Pas de tests automatisés : les vérifications ont été faites à la main.
- Pas d'annulation ni de modification d'une vente enregistrée.
- Une seule devise, aucun export de données.
- SQLite convient à un usage modéré ; une base serveur serait préférable pour une forte charge.

## Auteur

Hasina Tsiorintsoa, projet académique, 2026.