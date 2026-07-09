# Commands

Source of truth for setup, scripts, and container workflows. Script names come from **`package.json` `scripts`**.

## Prerequisites

- **Node.js 24.x** (dev image: `node:24.16.0-slim` in `docker/dev/Dockerfile`)
- **npm** (ships with Node)

## Local setup

```bash
npm install
npm run dev
```

Dev server: **http://localhost:3000** (`vite.config.js`: port **3000**, `host: true`).

Optional backend URL: set **`VITE_API_URL`** for Vite (read in `src/shared/lib/config.js`; default `http://localhost:5000/api`). Vite loads `.env` files per its usual rules.

## npm scripts

| Script | Command (from `package.json`) | Purpose |
| ------ | ----------------------------- | ------- |
| `dev` | `vite` | Start Vite development server |
| `start` | `vite preview` | Serve production build locally (run `build` first) |
| `build` | `vite build` | Production build to `dist/` |
| `test` | `vitest run` | Run tests once |
| `test:watch` | `vitest` | Run Vitest in watch mode |
| `lint` | `oxlint src/` | Lint source with oxlint |
| `lint:fix` | `oxlint --fix src/` | Lint and apply safe fixes |

**Test config** (`vite.config.js`): `globals: true`, `environment: 'jsdom'`, `setupFiles: './src/setupTests.js'`.

## Reproducible installs

Use **`npm ci`** when you need a clean install from the lockfile (CI, production Docker build, or matching another machine exactly). Requires an up-to-date **`package-lock.json`**.

```bash
npm ci
```

## Dev container

Open the repo in VS Code / Cursor with Dev Containers using **`.devcontainer/devcontainer.json`**.

- Compose files: **`docker/dev/compose.yaml`** + **`.devcontainer/compose.yaml`**
- **`postCreateCommand`:** `npm install`
- **`postStartCommand`:** `npm run dev`
- Port **3000** forwarded
- Recommended extension: **`oxc.oxc-vscode`** (oxlint)

The dev service image is **`node:24.16.0-slim`** (`docker/dev/Dockerfile`).

## Docker (optional)

Sources: `docker/dev/compose.yaml`, `docker/prod/compose.yaml`, and `docker/dev/.env.example` / `docker/prod/.env.example`.

### Development

- Env vars: **`DOCKER_DEV_NAME`**, **`DOCKER_DEV_REACT_PORT`** (see `docker/dev/.env.example`)
- Service command: `npm install && npm run dev`
- Maps `${DOCKER_DEV_REACT_PORT}:3000`

Example:

```bash
docker compose -f docker/dev/compose.yaml --env-file docker/dev/.env.example up
```

Adjust `--env-file` and paths to your environment.

### Production

- Env var: **`DOCKER_PROD_NAME`** (see `docker/prod/.env.example`)
- Build stage: **`node:24.16.0-alpine`**, **`npm ci`**, **`npm run build`** (`docker/prod/Dockerfile`)
- Final image copies **`dist/`**; compose mounts `../../dist` and copies artifacts from the container

Example:

```bash
docker compose -f docker/prod/compose.yaml --env-file docker/prod/.env.example up --build
```

## One-off tools (npx)

```bash
npx -y react-doctor@latest . --verbose --diff
```

See **`.agents/skills/react-doctor/SKILL.md`** for when to run it.

## CI

No **`.github/workflows`** (or similar) were found in the repository; automated CI commands are **unverified**.
