# API (OpenAPI)

La spécification OpenAPI 3.0 est **générée à partir des décorateurs `@nestjs/swagger`** du code (`@ApiTags`, `@ApiOperation`, `@ApiProperty`, etc.). Elle n'est jamais écrite à la main : le code reste la seule source de vérité.

## Vue d'ensemble des routes

| Méthode | Route | Accès | Rôle | Réponses |
|---|---|---|---|---|
| `POST` | `/auth/register` | Public | Créer un compte | 201, 400, 401 |
| `POST` | `/auth/login` | Public | Obtenir un JWT | 201, 401 |
| `POST` | `/file` | JWT | Téléverser un fichier (multipart, 1 Go max) | 201, 400, 401 |
| `GET` | `/file` | JWT | Historique des fichiers de l'utilisateur | 200, 401 |
| `DELETE` | `/file/{id}` | JWT | Supprimer un fichier | 204, 401, 403, 404 |
| `POST` | `/file/{id}/force-expire` | JWT | [Dev] Forcer l'expiration | 204, 401, 403, 404 |
| `GET` | `/download/{token}` | Public | Métadonnées d'un fichier partagé | 200, 404, 410 |
| `POST` | `/download/{token}` | Public | URL de téléchargement (mot de passe si requis) | 201, 400, 401, 404, 410 |
| `GET` | `/` | Public | Route par défaut de NestJS | 200 |

Les routes protégées attendent l'en-tête `Authorization: Bearer <access_token>`. Dans Swagger UI, cliquez sur **Authorize** et collez le token obtenu avec `/auth/login`.

!!! note "Code de retour de `/auth/login`"
    La spec annonce `200`, mais la route répond `201` : c'est le code par défaut de NestJS pour un `POST`, et aucun `@HttpCode(200)` n'est déclaré. Les tests d'intégration et le frontend s'appuient sur le `201` réel.

## Documentation interactive

<iframe class="swagger-frame" src="../swagger.html" title="Swagger UI de l'API DataShare"></iframe>

[Ouvrir Swagger UI en plein écran](swagger.html){ target="_blank" } · [Télécharger openapi.json](openapi.json)

Le bouton **Try it out** envoie les requêtes à `http://localhost:3000` : l'API doit être lancée (`mise run dev-back`).

## Mettre à jour la spec

La spec publiée ici est une copie de `backend/openapi.json`. Après une modification des routes ou des DTO :

```bash
mise run docs-openapi
```

Cette tâche lance `npm run docs:openapi` dans `backend/` (compilation, démarrage de l'application Nest sans écoute réseau, écriture de `openapi.json`), puis copie le fichier dans `docs/backend/`. Redis doit être démarré (`mise run docker-up`), car le module BullMQ s'y connecte au démarrage.

En développement, l'API sert aussi sa propre Swagger UI, toujours à jour, sur <http://localhost:3000/api-docs>.
