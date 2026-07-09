# Agent context (index)

Short entry point for humans and AI assistants. Keep deep detail in **`docs/`** rather than duplicating it here.

## Workspace

Default working directory is the **repository root** (e.g. `/workspaces/QualityTechnology-Frontend` in the dev container). Run install and scripts from that root unless a task specifies otherwise.

## Toolchain: Node.js + npm

The project uses **Node.js 24.x** and **npm**. Lockfile: **`package-lock.json`**.

- Install: `npm install` (reproducible: `npm ci`)
- Scripts: `npm run <script>` (see **`docs/COMMANDS.md`** for the full table)
- One-off tools: `npx <package>`

## Vite path aliases

| Alias | Path |
|-------|------|
| `@app` | `src/app` |
| `@pages` | `src/pages` |
| `@features` | `src/features` |
| `@shared` | `src/shared` |

Use these aliases for imports between modules. Avoid fragile relative paths across feature boundaries.

## Read when...

- System shape, routing, auth, and containers: **`docs/ARCHITECTURE.md`**
- Style, MUI, API patterns, testing, linting: **`docs/CONVENTIONS.md`**
- Setup, scripts, Docker, dev container: **`docs/COMMANDS.md`**
- Listado filters, export, `TablasPorUbicacionGranja`: **`docs/HOW_TO_ADD_LISTADO_FILTERS.md`**
