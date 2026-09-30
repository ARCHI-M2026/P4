# Frontend

Le frontend est une application **Angular 21** construite avec le builder `@angular/build` (esbuild et Vite). Tous les composants sont autonomes (standalone) : il n'y a pas de `NgModule`. L'état local des composants utilise les **signals**, et les formulaires sont des **formulaires réactifs**.

## Structure du dossier

```text
frontend/
├── angular.json                 # Build, serveur de dev, tests, lint
├── playwright.config.ts         # Configuration des tests E2E
├── playwright/                  # Tests E2E (voir la page Tests)
├── public/                      # Favicon et icônes SVG
└── src/
    ├── main.ts                  # bootstrapApplication(App, appConfig)
    ├── index.html
    ├── styles.css               # Styles globaux
    ├── styles-form-container.css
    ├── environments/
    │   └── environment.ts       # URLs de l'API
    └── app/
        ├── app.ts / app.html    # Composant racine (<router-outlet>)
        ├── app.config.ts        # Router, HttpClient + intercepteur
        ├── app.routes.ts        # Table des routes
        ├── _helpers/            # authGuard, tokenInterceptor
        ├── _interfaces/         # Types des réponses de l'API
        ├── _services/           # AuthService, FileService, TokenService
        ├── _utils/              # Validateur PasswordCheck
        ├── layout/
        │   ├── public/          # Mise en page publique (en-tête, lien de connexion)
        │   └── admin/           # Mise en page connectée (menu latéral, déconnexion)
        └── pages/
            ├── home/            # Accueil
            ├── login/           # Connexion
            ├── register/        # Inscription
            └── files/
                ├── file-upload/   # Téléversement
                ├── file-list/     # Historique et suppression
                └── file-details/  # Page de téléchargement publique
```

## Routes

| URL | Mise en page | Composant | Protection | User story |
|---|---|---|---|---|
| `/` | Publique | `Home` | — | — |
| `/login` | Publique | `LoginComponent` | — | US04 |
| `/register` | Publique | `RegisterComponent` | — | US03 |
| `/files/upload` | Publique | `FileUploadComponent` | `authGuard` | US01 |
| `/file/:id` | Publique | `FileDetailsComponent` | — | US02 |
| `/files` | Connectée (`AdminLayout`) | `FileListComponent` | `authGuard` | US05, US06 |

Le paramètre `:id` de `/file/:id` est le **token de partage** (`downloadToken`), pas l'identifiant du fichier.

## Services et communication avec l'API

| Élément | Rôle |
|---|---|
| `AuthService` | `login()` et `register()` sur `/auth/login` et `/auth/register` |
| `FileService` | `getAll()`, `upload()`, `delete()` sur `/file` ; `findByToken()` et `downloadFile()` sur `/download/:token` |
| `TokenService` | Enregistre, lit et supprime le JWT dans le `localStorage` (clé `ds_token`) |
| `tokenInterceptor` | Ajoute `Authorization: Bearer <token>` à chaque requête quand un token existe. Sur une réponse `401` (hors `/download`), supprime le token et redirige vers `/login`. |
| `authGuard` | Redirige vers `/login` si aucun token n'est enregistré |

Les URLs de l'API sont définies dans `src/environments/environment.ts` (`http://localhost:3000/...`).

## Parcours principaux

**Connexion** : le formulaire valide l'email et la présence du mot de passe, appelle `AuthService.login()`, enregistre le token puis redirige vers `/files`. Les erreurs sont traduites en messages : serveur injoignable (`status 0`), identifiants incorrects (`401`), autre erreur.

**Inscription** : email valide, mot de passe de 8 caractères minimum et confirmation identique (validateur `PasswordCheck` au niveau du groupe).

**Téléversement** : l'utilisateur choisit un fichier, une durée (1 à 7 jours, 7 par défaut) et un mot de passe facultatif (6 caractères minimum). Le composant envoie un `FormData`, puis affiche le lien de partage `<origine>/file/<downloadToken>` avec un bouton de copie.

**Historique** : la liste se filtre sur les fichiers actifs, expirés ou tous, avec un libellé d'expiration (« Expire demain », « Expiré »…). La suppression demande une confirmation (`window.confirm`), puis retire le fichier de la liste sans recharger.

**Téléchargement** : la page publique affiche le nom, la taille et l'expiration, demande le mot de passe si besoin, puis ouvre l'URL présignée renvoyée par l'API.

## Attributs `test-id`

Les éléments utilisés par les tests Playwright portent un attribut `test-id`. Le helper `selector()` des tests les cible avec `[test-id=...]`. Renommer ou supprimer l'un de ces attributs casse les tests.

| Zone | `test-id` |
|---|---|
| Mises en page | `public-layout`, `admin-layout`, `admin-link`, `admin-logout` |
| Connexion | `email`, `password`, `admin-login`, `error-message` |
| Inscription | `register-form`, `email`, `password`, `password-confirmation`, `register-button`, `login-link`, `bad-email`, `bad-password`, `password-mismatch`, `error-message` |
| Téléversement | `go-to-upload`, `upload-page`, `input-upload`, `upload-button`, `upload-confirmation`, `file-url` |
| Historique | `file-item`, `delete-file` |
| Téléchargement | `download-page`, `download-button` |

## Scripts npm

| Commande | Action |
|---|---|
| `npm start` | Serveur de dev sur <http://localhost:4200> (configuration `development`, source maps actives) |
| `npm run build` | Build de production dans `dist/` (budgets : 500 kB d'avertissement, 1 MB d'erreur) |
| `npm test` | Tests unitaires Vitest |
| `npm run lint` | ESLint (TypeScript et templates, dont les règles d'accessibilité) |
| `npm run play:run` | Tests Playwright avec couverture |
| `npm run play:open` | Tests Playwright en mode interface |
| `npm run play:report` | Ouvre le dernier rapport Playwright |
