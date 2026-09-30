# Démarrage rapide

Cette procédure installe un poste de développement DataShare, de zéro jusqu'à l'application lancée. Elle ne se fait qu'une fois par machine.

Toutes les versions d'outils (Node.js, Python, Lefthook) sont définies dans `mise.toml`. **mise** les installe et les active automatiquement dans le dossier du projet : il n'y a rien à installer à la main en dehors de mise, Git et Docker.

## Choisir sa procédure

| Système | Procédure |
|---|---|
| Linux (Ubuntu, Debian, Fedora…) | [Linux](#linux) |
| Windows 10 / 11 | [Windows avec WSL 2](#windows-avec-wsl-2) |
| macOS | [Linux](#linux), en remplaçant l'installation de Docker par Docker Desktop |

> ⚠️ **Windows : WSL 2 obligatoire**
>
> Les tâches mise et plusieurs scripts npm du projet sont écrits pour un shell Unix : `NODE_ENV=development nest start` (backend), `mkdir -p` et `cp` (couverture), `&` et `wait` (`mise run dev`), `$(id -u)` (k6). Sous Windows, mise exécute les tâches avec `cmd`, et npm exécute les scripts avec `cmd` : ces commandes échouent. Le projet se développe donc sous Windows **dans WSL 2**, qui fournit un vrai Linux.

## Linux

### 1. Installer les prérequis

**Git et curl**

```bash
# Debian / Ubuntu
sudo apt update && sudo apt install -y git curl
# Fedora
sudo dnf install -y git curl
```

**Docker** : installer Docker Engine et le plugin Compose en suivant la [documentation Docker](https://docs.docker.com/engine/install/) pour votre distribution, puis autoriser votre utilisateur à s'en servir sans `sudo` :

```bash
sudo usermod -aG docker $USER
```

Fermer la session et se reconnecter pour que le groupe soit pris en compte. Vérifier avec `docker run --rm hello-world`.

### 2. Installer et activer mise

```bash
curl https://mise.run | sh
```

mise est installé dans `~/.local/bin/mise`. L'activer dans votre shell, pour qu'il charge automatiquement les outils du projet :

```bash
# bash
echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc
# zsh
echo 'eval "$(~/.local/bin/mise activate zsh)"' >> ~/.zshrc
```

**Ouvrir un nouveau terminal**, puis vérifier :

```bash
mise --version
mise doctor        # la ligne "activated" doit indiquer "yes"
```

### 3. Récupérer le projet et installer les outils

```bash
git clone <url-du-dépôt> P4
cd P4

mise trust         # autorise mise à lire le mise.toml du projet
mise install       # installe Node.js 22, Python 3.12 et Lefthook
```

`mise trust` est demandé une seule fois par projet : par sécurité, mise n'exécute pas la configuration d'un dossier qu'on ne lui a pas désigné comme sûr.

Vérifier que les bonnes versions sont actives dans le dossier :

```bash
node --version     # v22.x
python --version   # Python 3.12.x
```

### 4. Configurer l'environnement

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

| Fichier | Contenu | À renseigner |
|---|---|---|
| `.env` (racine) | MinIO, Redis ; chargé par mise dans toutes les commandes du projet | Rien pour un usage local, les valeurs par défaut conviennent |
| `backend/.env` | Base de données, JWT, bcrypt, MinIO | `DATABASE_URL`, `JWT_SECRET`, et `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` avec les mêmes valeurs que dans `.env` |

Pour générer un `JWT_SECRET` :

```bash
openssl rand -base64 48
```

> Les deux fichiers `.env` contiennent des secrets : ils sont ignorés par git et ne doivent jamais être commités.

### 5. Installer les dépendances et les hooks git

```bash
mise run setup
```

Cette tâche installe les dépendances npm du backend, du frontend et de la racine (commitlint), puis les hooks git Lefthook (lint avant commit, format du message de commit).

### 6. Préparer la base de données

```bash
cd backend
npx prisma generate --config prisma7.config.ts   # génère le client Prisma (src/_generated/)
npx prisma db push --config prisma7.config.ts    # crée les tables, si la base est vide
cd ..
```

Le client Prisma n'est pas versionné : `prisma generate` est à relancer après chaque `npm install` dans le backend ou changement de `schema.prisma`.

### 7. Installer le navigateur des tests E2E

```bash
cd frontend
npx playwright install --with-deps chromium
cd ..
```

`--with-deps` installe aussi les bibliothèques système dont Chromium a besoin (mot de passe `sudo` demandé).

### 8. Préparer la documentation (facultatif)

La documentation MkDocs s'installe dans un environnement virtuel Python propre au projet, `.venv/`, créé avec le Python 3.12 fourni par mise :

```bash
python -m venv .venv
source .venv/bin/activate
mise run docs-install
```

Dans chaque nouveau terminal où vous travaillez sur la documentation, réactiver l'environnement avant `mise run docs` :

```bash
source .venv/bin/activate
```

### 9. Lancer l'application

```bash
mise run dev
```

Cette tâche démarre MinIO et Redis dans Docker, puis le backend et le frontend. Au premier lancement, Docker télécharge les images : comptez quelques minutes.

| Service | Adresse |
|---|---|
| Application | <http://localhost:4200> |
| API | <http://localhost:3000> |
| Swagger UI | <http://localhost:3000/api-docs> |
| Console MinIO | <http://localhost:9001> |

Arrêter avec `Ctrl+C`, puis `mise run docker-down` pour stopper les conteneurs.

### 10. Vérifier l'installation

```bash
mise run lint                        # lint backend + frontend
mise run test                        # tests unitaires du backend
cd frontend && npm run play:run      # tests E2E (backend et Docker lancés)
```

L'installation est terminée. `mise tasks` liste toutes les commandes disponibles.


## Mémo : les commandes de la première installation

```bash
# Une fois par machine (Linux ou Ubuntu WSL)
curl https://mise.run | sh
echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc
# → ouvrir un nouveau terminal

# Une fois par projet
git clone <url-du-dépôt> P4 && cd P4
mise trust
mise install
cp .env.example .env
cp backend/.env.example backend/.env     # puis compléter DATABASE_URL, JWT_SECRET, MINIO_*
mise run setup
(cd backend && npx prisma generate --config prisma7.config.ts && npx prisma db push --config prisma7.config.ts)
(cd frontend && npx playwright install --with-deps chromium)
python -m venv .venv && source .venv/bin/activate && mise run docs-install   # documentation, facultatif

# Au quotidien
mise run dev
```

## En cas de problème

| Symptôme | Solution |
|---|---|
| `mise: command not found` | Le shell n'a pas été rechargé après l'activation : ouvrir un nouveau terminal |
| `Config files in … are not trusted` | Lancer `mise trust` à la racine du projet |
| `node --version` n'affiche pas la v22 | mise n'est pas activé dans ce shell : vérifier avec `mise doctor` |
| `permission denied … docker.sock` | L'utilisateur n'est pas dans le groupe `docker` (Linux) ou l'intégration WSL n'est pas activée dans Docker Desktop (Windows) |
| L'API ne démarre pas : erreur Prisma ou `DATABASE_URL` | Vérifier `backend/.env`, puis relancer `npx prisma generate --config prisma7.config.ts` |
| L'upload échoue avec une erreur d'accès MinIO | Les identifiants `MINIO_ROOT_*` de `backend/.env` ne correspondent pas à ceux de `.env` |
| `mkdocs: command not found` | Le venv n'est pas activé : `source .venv/bin/activate` |
