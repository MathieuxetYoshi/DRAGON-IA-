# DRAGON IA — SaaS starter

Starter de développement pour une plateforme SaaS multi-entreprise d'agents IA, avec interface bleu futuriste, API FastAPI et PostgreSQL.

> **Important :** ce dépôt est un socle de prototype. L'authentification, l'isolation stricte des tenants, les contrôles de sécurité, l'observabilité et les tests de charge doivent être complétés avant toute mise en production ou utilisation avec des données réelles d'entreprise.

## Architecture

- `apps/api` : API Python / FastAPI, endpoints de santé, missions et agents.
- `apps/web` : interface Next.js App Router.
- `infra` : PostgreSQL et Redis via Docker Compose.
- `docs/ARCHITECTURE.md` : architecture cible et plan de durcissement.

## Prérequis

- Python 3.11+
- Node.js 20+
- Docker Desktop

## Démarrage local

### 1. Démarrer PostgreSQL et Redis

```bash
docker compose -f infra/docker-compose.yml up -d
```

### 2. Démarrer l'API

```bash
cd apps/api
python -m venv .venv
# macOS / Linux
source .venv/bin/activate
# Windows PowerShell : .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Documentation API : http://localhost:8000/docs

### 3. Démarrer le tableau de bord

Dans un autre terminal :

```bash
cd apps/web
npm install
npm run dev
```

Ouvrir http://localhost:3000.

Le tableau de bord appelle l'API sur `http://localhost:8000`. Modifier `NEXT_PUBLIC_API_URL` si nécessaire.

## API de démonstration

Les endpoints de démonstration acceptent un en-tête `X-Tenant-ID` pour simuler le contexte d'une entreprise :

```bash
curl -H "X-Tenant-ID: entreprise-demo" http://localhost:8000/api/v1/agents
```

Créer une mission :

```bash
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: entreprise-demo" \
  -d '{"title":"Préparer une synthèse","description":"Résumer les indicateurs du trimestre"}'
```

Le stockage de ces exemples est volontairement en mémoire : les données sont perdues au redémarrage. Ne pas y mettre d'informations confidentielles.

## Prochaines étapes

1. Authentification OIDC/SSO et gestion des organisations.
2. PostgreSQL avec migrations Alembic et politiques d'isolation multi-tenant.
3. Orchestration durable des agents, avec file de tâches et reprise après incident.
4. Connecteurs métiers avec autorisations minimales.
5. Journaux d'audit, approbations humaines et observabilité.
6. Tests de sécurité, sauvegardes, reprise après sinistre et déploiement cloud.
