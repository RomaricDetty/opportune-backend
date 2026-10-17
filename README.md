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
