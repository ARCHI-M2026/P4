# DataShare

Application web de **transfert de fichiers par lien temporaire**. Un utilisateur connecté téléverse un fichier (jusqu'à 1 Go), choisit une durée de validité de 1 à 7 jours et, s'il le souhaite, un mot de passe. Il obtient un lien de partage, utilisable par n'importe qui jusqu'à l'expiration ; le fichier est ensuite supprimé automatiquement.

## Fonctionnalités

| | Fonctionnalité | Accès |
|---|---|---|
| US01 | Téléverser un fichier, avec expiration (1 à 7 jours) et mot de passe optionnel | Connecté |
| US02 | Télécharger un fichier depuis son lien de partage | Public |
| US03 | Créer un compte | Public |
| US04 | Se connecter et se déconnecter | Public / connecté |
| US05 | Consulter l'historique de ses fichiers | Connecté |
| US06 | Supprimer un de ses fichiers | Connecté |

## Stack technique

| Domaine | Technologies |
|---|---|
| Frontend | Angular 21 (composants standalone, signals, formulaires réactifs) |
| Backend | NestJS 11 sur Express 5, Prisma 7, JWT, bcrypt |
| Données | PostgreSQL (Prisma Postgres hébergé), MinIO (stockage S3), Redis + BullMQ (expiration) |
| Tests | Jest + Supertest (backend), Playwright + monocart (E2E et couverture), Vitest (frontend), k6 (performance) |
| Outillage | mise, Docker Compose, Lefthook, commitlint, ESLint, Prettier |
| CI / sécurité | GitHub Actions : Trivy, CodeQL, Dependabot |
| Documentation | MkDocs + Material for MkDocs, OpenAPI généré depuis le code |

```text
Navigateur ──► Frontend Angular (:4200) ──► API NestJS (:3000) ──┬──► PostgreSQL (métadonnées)
    │                                                             ├──► MinIO (contenu des fichiers)
    │                                                             └──► Redis / BullMQ (jobs d'expiration)
    └──────────── URL présignée (5 min) ──────────────────────────────► MinIO
```

## Démarrage

La procédure d'installation complète, pour Linux et pour Windows (WSL 2), est décrite dans **[QUICKSTART.md](QUICKSTART.md)**.

En résumé, une fois mise, Git et Docker installés :

```bash
mise trust && mise install
cp .env.example .env && cp backend/.env.example backend/.env   # puis compléter backend/.env
mise run setup
(cd backend && npx prisma generate --config prisma7.config.ts)
mise run dev
```

| Service | Adresse |
|---|---|
| Application | <http://localhost:4200> |
| API | <http://localhost:3000> |
| Swagger UI (développement) | <http://localhost:3000/api-docs> |
| Console MinIO | <http://localhost:9001> |

## Commandes

Toutes les commandes passent par mise, depuis la racine du projet. `mise tasks` en affiche la liste.

| Commande | Action |
|---|---|
| `mise run setup` | Installe les dépendances npm et les hooks git |
| `mise run dev` | Démarre Docker (MinIO, Redis), le backend et le frontend |
| `mise run dev-back` / `mise run dev-front` | Démarre uniquement le backend ou le frontend |
| `mise run docker-up` / `mise run docker-down` | Démarre ou arrête MinIO et Redis |
| `mise run lint` | ESLint sur le backend et le frontend |
| `mise run test` | Tests unitaires du backend |
| `mise run k6 <scénario>` | Test de performance : `smoke`, `load`, `stress`, `soak`, `spike` |
| `mise run k6-report <scénario> [nom]` | Test de performance avec rapport HTML dans `k6/reports/` |
| `mise run docs-install` | Installe MkDocs dans le venv `.venv` activé |
| `mise run docs` | Sert la documentation sur <http://127.0.0.1:8000> |
| `mise run docs-build` | Construit la documentation dans `site/` |
| `mise run docs-openapi` | Régénère la spec OpenAPI et la copie dans la documentation |

Commandes propres à chaque partie :

```bash
# backend/
npm run test:int          # tests d'intégration (base de test dédiée !)
npm run test:cov:merge    # couverture unitaire + intégration

# frontend/
npm run play:run          # tests E2E Playwright + couverture (coverage/e2e/)
npm run play:open         # tests E2E en mode interface
```

## Structure du dépôt

```text
.
├── .github/              # Workflows Trivy et CodeQL, configuration Dependabot
├── backend/              # API NestJS
│   ├── prisma/           #   schéma de la base
│   ├── src/              #   modules auth, file, download, storage, queue
│   └── test/             #   tests d'intégration
├── frontend/             # Application Angular
│   ├── src/app/          #   pages, layouts, services, guard, intercepteur
│   └── playwright/       #   tests E2E
├── k6/                   # Scénarios de performance et rapports
├── docs/                 # Documentation MkDocs
├── docker-compose.yml    # MinIO + Redis
├── mise.toml             # Versions des outils, variables d'environnement, tâches
├── lefthook.yml          # Hooks git
├── mkdocs.yml            # Configuration de la documentation
├── requirements-docs.txt # Dépendances Python de la documentation
├── QUICKSTART.md         # Procédure d'installation
└── README.md
```

## Documentation

La documentation technique complète est un site MkDocs dans `docs/` :

| Page | Contenu |
|---|---|
| Présentation, Stack et versions | Architecture, outils, liste complète des versions |
| Backend | Structure, modules, modèle de données, fonctionnement, API interactive (Swagger UI) |
| Frontend | Structure, routes, services, attributs `test-id` |
| Tests | Stratégie, couverture fonctionnelle, fonctionnement de chaque niveau |
| Performance | Scénarios k6 et analyse des résultats |
| Maintenance | Procédures de mise à jour, base de données, dépannage |
| Sécurité | Mesures en place, CI de sécurité, risques connus |

Pour la consulter en local (après l'étape 8 de [QUICKSTART.md](QUICKSTART.md)) :

```bash
source .venv/bin/activate
mise run docs
```

## Contribuer

- Le développement se fait sur la branche **`develop`** ; `main` reçoit les versions stables par pull request.
- Les messages de commit suivent **Conventional Commits** (`feat(file): …`, `fix(auth): …`, `ci: …`) et sont vérifiés par commitlint.
- Avant chaque commit, Lefthook lance ESLint sur les fichiers modifiés.
- Chaque pull request est analysée par **Trivy** (dépendances, secrets) et **CodeQL** (code) ; les résultats apparaissent dans l'onglet *Security* du dépôt.
- Les dépendances sont mises à jour chaque semaine par **Dependabot**.
