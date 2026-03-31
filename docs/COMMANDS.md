# Commands

All script names below come from **`package.json` `scripts`**. The runtime used in Docker and the dev container is **Bun** (see `docker/dev/Dockerfile`, `docker/prod/Dockerfile`, `.devcontainer/devcontainer.json`). Invoking scripts with **`bun run <script>`** matches the committed containerized workflow. The repository also contains older `npm` examples in `README.md`, but those are not the runtime used by the current container/devcontainer setup.

| Script | Command (from `package.json`) | Purpose |
| ------ | ----------------------------- | ------- |
| `dev` | `vite` | Start Vite development server |
| `start` | `vite preview` | Serve production build locally (run `build` first) |
| `build` | `vite build` | Production build to `dist/` |
| `test` | `vitest run` | Run tests once |
| `test:watch` | `vitest` | Run Vitest in watch mode |

**Dev server defaults** (from `vite.config.js`): port **3000**, `host: true` (listen on all interfaces). **Test config:** `globals: true`, `environment: 'jsdom'`, `setupFiles: './src/setupTests.js'`.

## Setup

1. Install dependencies: **`bun install`** (dev container uses `bun install --frozen-lockfile` when possible, then falls back—see `.devcontainer/devcontainer.json`).
2. Optional backend URL: set **`VITE_API_URL`** for Vite (see `src/utils/config.js`). **Unverified:** whether a root `.env` or `.env.local` is standard for this team; Vite loads env files per its usual rules.

## Docker (optional)

Sources: `docker/dev/compose.yaml`, `docker/prod/compose.yaml`, and `docker/dev/.env.example` / `docker/prod/.env.example`.

- **Dev compose** expects environment variables such as **`DOCKER_DEV_NAME`** and **`DOCKER_DEV_REACT_PORT`** (see `docker/dev/.env.example`). The React service runs `bun install && bun run dev` inside the container.
- **Prod compose** uses **`DOCKER_PROD_NAME`** (see `docker/prod/.env.example`). The service copies built artifacts from the image’s `/app/dist` to a mounted volume; exact deployment wiring is **unverified** beyond the compose file.

Exact `docker compose` invocations (working directory, project name) are **not** defined in the files inspected; use Compose’s usual `-f` / `--env-file` flags from your environment.

## Dev Containers

Open the folder in VS Code / Cursor with Dev Containers support using **`.devcontainer/devcontainer.json`**, which references **`../docker/dev/compose.yaml`** and an additional **`.devcontainer/compose.yaml`** override.

## CI

No **`.github/workflows`** (or similar) were found in the repository at documentation time; automated CI commands are **unverified**.
