# Electro Store — API Backend

API REST Node.js / Express pour la boutique **Electro Store** (électroménager & high-tech, Côte d’Ivoire).

## Stack

- Node.js, Express 5
- Sequelize + MySQL
- JWT (admin + clients)
- Helmet, CORS, rate limiting
- Swagger UI (hors production) : `/api-docs`

## Prérequis

- Node.js 18+
- MySQL 8+
- Variables d’environnement (voir `.env.example`)

## Installation

```bash
npm install
cp .env.example .env
# Renseigner DB_*, JWT_SECRET, CORS_ORIGIN
npm run db:create   # si besoin
npm run dev         # http://localhost:3000
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur + nodemon |
| `npm start` | Production |
| `npm run db:create` | Création de la base |
| `npm run db:seed` | Données de démo |
| `npm run db:enrich` | Enrichissement contenus démo |
| `npm run db:migrate` | Migrations Sequelize |
| `npm run db:update` | Sauvegarde puis applique les migrations : **la seule commande de mise à jour du schéma** |
| `npm run db:baseline` | Donne un historique de migrations à une base créée par `sync()` (une seule fois) |
| `npm run db:backup` | Sauvegarde la base dans `backups/` (14 conservées) |
| `npm run db:backup:verify` | Sauvegarde et vérifie la restauration sur une base temporaire |
| `npm run images:migrate` | Compte les images base64 ; `-- --apply` les déplace vers `uploads/` |
| `npm test` | Tests de l'API sur une base `<DB_NAME>_test` créée puis supprimée |
| `npm run db:fix-marques` | Rend le rayon des marques optionnel et élargit le logo, sur une base créée via `sync()` (rejouable) |

## Principales routes

Préfixe : `/api`

| Zone | Exemples |
|------|----------|
| Public | `/products`, `/settings`, `/contact`, `/site-categories` |
| Clients | `/clients`, `/orders`, `/wishlist` |
| Admin | `/admin/products`, `/admin/orders`, `/admin/clients`, `/admin/dashboard`, `/admin/settings`, `/admin/contact` |
| Auth admin | `POST /admins/login` (ou `/admin/login`) |

## Sécurité

- `JWT_SECRET` **obligatoire** en production
- Rate limit global + login admin + formulaire contact
- Helmet, body limité à 1 Mo
- CORS via `CORS_ORIGIN` (liste séparée par virgules)
- Swagger désactivé si `NODE_ENV=production`
- Stock insuffisant / produit indisponible → commande refusée

## Documentation

- Swagger (dev) : http://localhost:3000/api-docs
- Health : `GET /api/health`

## Déploiement

1. `npm ci`
2. `npm run db:update` **avant** de démarrer le nouveau code. Il sauvegarde la base, puis applique les migrations.
3. Redémarrer l'API, puis déployer le dashboard et le site.
4. Une fois l'API en ligne : `npm run images:migrate`, puis `npm run images:migrate -- --apply` (une seule fois).

À définir en production :

| Variable | Rôle |
|----------|------|
| `PUBLIC_API_URL` | Adresse publique de l'API : obligatoire derrière un proxy HTTPS, sinon les images partent en `http://` |
| `UPLOADS_DIR` | Dossier des images, sur un **volume persistant** : il doit survivre aux déploiements |
| `BACKUP_DIR` | Dossier des sauvegardes, idéalement hors du serveur de base de données |
| `SMTP_*`, `NOTIFY_EMAILS` | Alertes e-mail des nouvelles commandes et demandes de devis (facultatif) |

Sauvegarde quotidienne (cron), à compléter par une copie de `UPLOADS_DIR` et `BACKUP_DIR` hors du serveur :

```cron
0 3 * * * cd /chemin/opportune-backend && npm run -s db:backup >> backups/backup.log 2>&1
```

## Rôles du back-office

| Rôle | Droits |
|------|--------|
| `admin` | Tout (comptes existants) |
| `catalogue` | Articles, rayons, catégories, marques, publicités, apparence |
| `commandes` | Commandes, clients, devis, messages |
