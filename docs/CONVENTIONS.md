# Conventions

This file records conventions that are **evident from repository configuration and code**. For additional editorial rules used by automation and contributors, see **`AGENTS.md`** and **`CLAUDE.md`** in the repository root (they may overlap; this doc does not replace them).

## Language and modules

- **Language:** JavaScript with **JSX** (`.jsx` files). There is no TypeScript configuration in the project root **verified** from the inspected manifests.
- **Module system:** ESM via Vite (`import` / `export`).
- **Component files:** React screens and shared UI use **PascalCase** filenames (e.g. `Usuarios.jsx`, `CorporateLayout.jsx`). Utility modules under `utils/` and `hooks/` use **camelCase** (e.g. `axiosInstance.js`, `useFormValidation.js`).

## Formatting (observed in source, not enforced by repo config)

The following appear consistently in reviewed entry files (`src/index.jsx`, `src/App.jsx`, utilities):

- Double-quoted strings
- Semicolon-terminated statements
- 2-space indentation

**Unverified:** No `eslint.config.*`, `.eslintrc*`, or committed Prettier config was found in the repository. The dev container recommends the ESLint and Prettier VS Code extensions (`.devcontainer/devcontainer.json`); whether the team enforces rules via editor only or unpublished config is **unknown**.

## React patterns

- **Functional components** and hooks (observed across `App.jsx`, layouts, and utilities).
- **Lazy loading** of route-level components with **`Suspense`** and a shared fallback (`src/App.jsx`).

## MUI usage

- **`sx`** prop is used for component-level styling (e.g. layout fallback in `App.jsx`; widespread in components).
- **MUI Grid v2-style API** with the `size` prop is used in the codebase (example: `Grid size={{ xs: 12, md: 6 }}` in `src/components/Pileta.jsx`). Prefer matching this pattern in new code for consistency.

## Routing and URLs

- Route path segments use **kebab-case** in multiple places (e.g. `registro-operativo/recepcion-insumos`, `ventas/flujo-caja` in `src/App.jsx`). New routes should follow existing naming in `App.jsx` and navigation links in `CorporateLayout.jsx`.

## API and configuration

- **Environment:** Vite exposes variables prefixed with **`VITE_`**. Backend base URL is read as **`VITE_API_URL`** in `src/utils/config.js` (falls back to `http://localhost:5000`).
- **HTTP helpers:** Use `axiosInstance` from `src/utils/axiosInstance.js` for all HTTP calls. Import as `import axios from "../utils/axiosInstance.js"`. For file download URLs with authentication, use `getUploadUrl` from `src/utils/uploadUrl.js`.

## Testing

- **Runner:** Vitest (see `package.json` and `vite.config.js`).
- **Environment:** `jsdom`, **`globals: true`**, setup file **`src/setupTests.js`** (imports `@testing-library/jest-dom`).
- **Location / naming:** At least one test uses the pattern **`src/App.test.jsx`** (Vitest picks up tests per `vite.config.js` defaults). There is no custom `include`/`exclude` in `vite.config.js` beyond Vitest defaults.

## Docker / toolchain

- **Lockfile:** `bun.lock` is present; production Dockerfile uses **`bun install --frozen-lockfile`**.
- **Dev container and Docker dev service** use **Bun** to install dependencies and run `bun run dev` (see `.devcontainer/devcontainer.json`, `docker/dev/compose.yaml`, `docker/dev/Dockerfile`).

**Local and container workflows** use **Bun** (`bun install`, `bun run …`). Do not assume `npm`, `npx`, `node`, or `yarn` are available in the standard dev environment; compatibility with those tools is **unverified**.

## Static assets

- `src/components/Login.jsx` uses absolute paths such as **`/images/ceiba.png`**. In this project, that pattern resolves from the **`public/`** directory through Vite’s static asset handling. Match that approach when adding shared static images.
