# Agent context (index)

Short entry point for humans and AI assistants. Keep deep detail in **`docs/`** rather than duplicating it here.

## Workspace

Default working directory is the **repository root** (e.g. `/workspaces/QualityTechnology-Frontend` in the dev container). Run install and scripts from that root unless a task specifies otherwise.

## Toolchain: Bun only

The project is set up for **Bun**. Do not rely on `npm`, `npx`, `node`, or `yarn` in this environment. Use `bun install`, `bun run <script>`, `bunx <package>`, and `bun <file>`. Lockfile: **`bun.lock`**.

## Main npm scripts (invoke with `bun run`)

From **`package.json`**:

| Script | Command | Purpose |
| ------ | ------- | ------- |
| `dev` | `vite` | Development server |
| `build` | `vite build` | Production build to `dist/` |
| `test` | `vitest run` | Run tests once |

Also available: `start` (`vite preview`, after a build), `test:watch` (Vitest watch).

## Project structure (feature-based)

```
src/
├── app/          # Bootstrap: App.jsx (providers), router.jsx (routes)
├── pages/        # Thin re-export wrappers per route (lazy loading boundaries)
├── features/     # Domain logic organized by business area
│   ├── auth/           components/ + services/
│   ├── catalogos/      components/ + services/
│   ├── inventarios/    components/ + services/
│   ├── ventas/         components/ + services/
│   ├── rrhh/           components/ + services/
│   ├── registro-operativo/  components/ + services/
│   └── seguridad/      components/ + services/
├── shared/       # Cross-cutting: components/, layout/, guards/, hooks/, lib/, styles/
├── index.jsx
└── setupTests.js
```

## Vite path aliases

| Alias | Path |
|-------|------|
| `@app` | `src/app` |
| `@pages` | `src/pages` |
| `@features` | `src/features` |
| `@shared` | `src/shared` |

Use these aliases for imports between modules. Avoid fragile relative paths across feature boundaries.

## Key folders

- **`src/app/`** — App bootstrap (`App.jsx`, `router.jsx`).
- **`src/features/`** — Domain components and API service files.
- **`src/shared/`** — Shared infrastructure (axiosInstance, auth, hooks, layout, guards, styles).
- **`src/pages/`** — One file per route, re-exporting from features for lazy loading.
- **`public/`** — Static assets served as-is (e.g. paths like `/images/...`).
- **`docs/`** — Architecture, conventions, and commands (see below).

## Read when...

- System shape, routing, auth, and containers: **`docs/ARCHITECTURE.md`**
- Style, MUI, API patterns, testing: **`docs/CONVENTIONS.md`**
- Setup, scripts, Docker, dev container: **`docs/COMMANDS.md`**
