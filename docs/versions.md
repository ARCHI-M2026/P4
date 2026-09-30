# Stack et versions

Cette page recense tous les outils et toutes les dépendances du projet.

- **Contrainte** : ce qui est déclaré dans `package.json` (`^` accepte les mises à jour mineures et correctives, `~` les correctifs seulement).
- **Installée** : la version réellement figée dans `package-lock.json`, celle que `npm ci` installe.

!!! info "État au 30 septembre 2026"
    Les versions installées évoluent avec les PR Dependabot. Pour les vérifier à tout moment : `npm ls --depth=0` dans `backend/`, `frontend/` ou à la racine.

## Environnement et outillage

| Outil | Version | Défini dans |
|---|---|---|
| Node.js | 22 (dernière 22.x) | `mise.toml` |
| npm | 10.9.8 | `frontend/package.json` (`packageManager`) |
| Python | 3.12 | `mise.toml` (utilisé par MkDocs) |
| Lefthook | dernière version | `mise.toml` |
| mise | version installée sur le poste | — |
| Docker / Docker Compose | version installée sur le poste | — |

## Infrastructure (Docker)

| Service | Image | Rôle |
|---|---|---|
| MinIO | `minio/minio:latest` | Stockage objet (API S3 sur `:9000`, console sur `:9001`) |
| MinIO init | `minio/mc:latest` | Création du bucket `file-transfer` au démarrage |
| Redis | `redis:7-alpine` | File de jobs BullMQ (`:6379`) |
| k6 | `grafana/k6` (dernière) | Tests de performance, lancés par `mise run k6` |
| PostgreSQL | Prisma Postgres (hébergé) | Base de données, hors Docker |

!!! warning "Images non figées"
    Les images `latest` peuvent changer d'une installation à l'autre. Voir [Maintenance](maintenance.md#mettre-a-jour-les-images-docker).

## Backend (`backend/package.json`)

### Dépendances

| Paquet | Contrainte | Installée | Rôle |
|---|---|---|---|
| `@nestjs/common` | ^11.0.1 | 11.2.3 | Cœur de NestJS |
| `@nestjs/core` | ^11.0.1 | 11.2.3 | Cœur de NestJS |
| `@nestjs/platform-express` | ^11.0.1 | 11.2.3 | Adaptateur HTTP Express, upload multipart (Multer 2.2.0) |
| `@nestjs/swagger` | ^11.4.7 | 11.4.7 | Génération OpenAPI et Swagger UI |
| `@nestjs/jwt` | ^12.0.1 | 12.0.1 | Signature et vérification des JWT |
| `@nestjs/bullmq` | ^12.0.0 | 12.0.0 | Intégration BullMQ |
| `@nestjs/mapped-types` | * | 12.0.0 | Utilitaires de DTO |
| `@prisma/client` | ^7.10.0 | 7.10.0 | Client de base de données généré |
| `@prisma/adapter-pg` | ^7.10.0 | 7.10.0 | Pilote PostgreSQL pour Prisma |
| `@aws-sdk/client-s3` | ^3.1128.0 | 3.1128.0 | Client S3 (MinIO) |
| `@aws-sdk/s3-request-presigner` | ^3.1128.0 | 3.1128.0 | URL de téléchargement présignées |
| `bullmq` | ^6.3.4 | 6.3.4 | File de jobs d'expiration |
| `ioredis` | ^6.0.0 | 6.0.0 | Client Redis |
| `bcrypt` | ^6.0.0 | 6.0.0 | Hachage des mots de passe |
| `class-validator` | ^0.15.1 | 0.15.1 | Validation des DTO |
| `class-transformer` | ^0.5.1 | 0.5.1 | Conversion des données entrantes |
| `express` | ^5.2.1 | 5.2.1 | Serveur HTTP |
| `load-esm` | ^1.0.3 | 1.0.3 | Chargement de `file-type` (ESM, version 21.3.4) |
| `reflect-metadata` | ^0.2.2 | 0.2.2 | Métadonnées des décorateurs |
| `rxjs` | ^7.8.1 | 7.8.2 | Programmation réactive (requis par NestJS) |

### Dépendances de développement

| Paquet | Contrainte | Installée | Rôle |
|---|---|---|---|
| `typescript` | ^5.7.3 | 5.9.3 | Compilateur |
| `@nestjs/cli` | ^11.0.0 | 11.0.24 | Build et lancement (`nest start`) |
| `@nestjs/schematics` | ^11.0.0 | 11.1.0 | Générateurs de code |
| `@nestjs/testing` | ^11.0.1 | 11.2.3 | Modules de test |
| `prisma` | ^7.10.0 | 7.10.0 | CLI Prisma (génération du client, migrations) |
| `jest` | ^30.0.0 | 30.5.1 | Lanceur de tests |
| `ts-jest` | ^29.4.12 | 29.4.12 | Exécution des tests TypeScript |
| `supertest` | ^7.2.2 | 7.2.2 | Requêtes HTTP dans les tests d'intégration |
| `ts-node` | ^10.9.2 | 10.9.2 | Exécution TypeScript (débogage des tests) |
| `ts-loader` | ^9.5.2 | 9.6.2 | Chargeur TypeScript |
| `tsconfig-paths` | ^4.2.0 | 4.2.0 | Résolution des chemins TypeScript |
| `source-map-support` | ^0.5.21 | 0.5.21 | Traces d'erreur sur le code source |
| `eslint` | ^9.18.0 | 9.39.5 | Lint |
| `@eslint/js` | ^9.18.0 | 9.39.5 | Règles ESLint de base |
| `@eslint/eslintrc` | ^3.2.0 | 3.3.7 | Compatibilité de configuration ESLint |
| `typescript-eslint` | ^8.20.0 | 8.69.0 | Règles ESLint pour TypeScript |
| `eslint-config-prettier` | ^10.0.1 | 10.1.8 | Désactive les règles en conflit avec Prettier |
| `eslint-plugin-prettier` | ^5.2.2 | 5.5.6 | Prettier exécuté par ESLint |
| `prettier` | ^3.4.2 | 3.9.6 | Formatage |
| `globals` | ^17.0.0 | 17.12.0 | Variables globales pour ESLint |
| `@types/node` | ^24.0.0 | 24.13.3 | Types Node.js |
| `@types/express` | ^5.0.6 | 5.0.6 | Types Express |
| `@types/multer` | ^1.4.13 | 1.4.13 | Types Multer |
| `@types/bcrypt` | ^6.0.0 | 6.0.0 | Types bcrypt |
| `@types/jest` | ^30.0.0 | 30.0.0 | Types Jest |
| `@types/supertest` | ^7.0.0 | 7.2.1 | Types Supertest |

## Frontend (`frontend/package.json`)

### Dépendances

| Paquet | Contrainte | Installée | Rôle |
|---|---|---|---|
| `@angular/core` | ^21.2.0 | 21.2.22 | Cœur d'Angular |
| `@angular/common` | ^21.2.0 | 21.2.22 | Client HTTP, directives communes |
| `@angular/compiler` | ^21.2.0 | 21.2.22 | Compilateur de templates |
| `@angular/forms` | ^21.2.0 | 21.2.22 | Formulaires réactifs |
| `@angular/platform-browser` | ^21.2.0 | 21.2.22 | Rendu navigateur |
| `@angular/router` | ^21.2.0 | 21.2.22 | Routage, guards |
| `rxjs` | ~7.8.0 | 7.8.2 | Observables |
| `tslib` | ^2.3.0 | 2.8.1 | Fonctions d'aide TypeScript |

### Dépendances de développement

| Paquet | Contrainte | Installée | Rôle |
|---|---|---|---|
| `@angular/cli` | ^21.2.23 | 21.2.23 | CLI `ng` |
| `@angular/build` | ^21.2.23 | 21.2.23 | Build esbuild et serveur de dev (Vite 7.3.6, esbuild 0.28.1) |
| `@angular/compiler-cli` | ^21.2.0 | 21.2.22 | Compilation AOT |
| `typescript` | ~5.9.2 | 5.9.3 | Compilateur |
| `@playwright/test` | ^1.63.0 | 1.63.0 | Tests de bout en bout |
| `monocart-coverage-reports` | ^2.13.0 | 2.13.0 | Rapport de couverture des tests Playwright |
| `vitest` | ^4.0.8 | 4.1.11 | Tests unitaires |
| `jsdom` | ^28.0.0 | 28.1.0 | DOM simulé pour Vitest |
| `eslint` | ^10.9.0 | 10.10.0 | Lint |
| `@eslint/js` | ^10.0.1 | 10.0.1 | Règles ESLint de base |
| `typescript-eslint` | 8.67.0 | 8.67.0 | Règles ESLint pour TypeScript |
| `angular-eslint` | 22.2.0 | 22.2.0 | Règles ESLint pour Angular (TypeScript et templates) |
| `prettier` | ^3.8.1 | 3.9.6 | Formatage |
| `@types/node` | ^26.6.3 | 26.6.3 | Types Node.js (tests Playwright) |

## Racine du dépôt (`package.json`)

| Paquet | Contrainte | Installée | Rôle |
|---|---|---|---|
| `@commitlint/cli` | ^19.0.0 | 19.8.1 | Vérification des messages de commit |
| `@commitlint/config-conventional` | ^19.0.0 | 19.8.1 | Règles Conventional Commits |

## CI (GitHub Actions)

Les actions sont épinglées par SHA de commit, le numéro de version figure en commentaire. Dependabot les met à jour.

| Action / outil | Version | Utilisée par |
|---|---|---|
| `actions/checkout` | v7.0.1 (`3d3c42e5…`) | Trivy, CodeQL |
| `aquasecurity/trivy-action` | v0.36.0 (`ed142fd0…`) | Trivy |
| Trivy (binaire) | v0.70.0 | Trivy |
| `github/codeql-action` (`init`, `analyze`, `upload-sarif`) | v4.38.2 (`2892aa5e…`) | CodeQL, Trivy |

## Documentation

| Paquet Python | Contrainte (`requirements-docs.txt`) | Rôle |
|---|---|---|
| `mkdocs` | >=1.6,<2 | Générateur de site |
| `mkdocs-material` | >=9.7,<10 | Thème, recherche, diagrammes Mermaid |

Le site a été construit et vérifié avec MkDocs 1.6.1 et Material 9.7.7.
