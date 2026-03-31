# Architecture

## Purpose

Single-page web application for **Quality Technology** (see `index.html` title and meta description). The UI is organized by functional areas (catalogs, inventories, sales, HR, operational logs, security) behind authentication and module-based access control.

## Runtime stack

Verified from `package.json`:

- **UI:** React 19, React DOM 19
- **Routing:** `react-router-dom` 7
- **Build / dev server:** Vite 8 with `@vitejs/plugin-react`
- **UI library:** MUI 7 (`@mui/material`, `@mui/icons-material`) with Emotion
- **HTTP:** `fetch`-based helper in `src/utils/api.js` (`apiFetch`); `axios` is also a dependency and used via `src/utils/axiosInstance.js` where that pattern is already established
- **Other notable libraries:** `dayjs`, `exceljs`, `file-saver`, `framer-motion`, `jspdf` / `jspdf-autotable`, `recharts`

## Entry points and bootstrap

1. **`index.html`** loads the Vite module entry **`src/index.jsx`**.
2. **`src/index.jsx`** mounts the app under `#root`, wraps it in `React.StrictMode`, and applies MUI **`ThemeProvider`** with `createTheme()` (default theme unless extended later).
3. **`src/App.jsx`** sets up **`BrowserRouter`**, `CssBaseline`, app-wide styles (`src/utils/GlobalStyles.jsx`), and the route tree inside **`Suspense`** with a shared loading fallback.

## Routing and code splitting

- Most feature screens are **`React.lazy`** imports; login, layout, and `PrivateRoute` load eagerly.
- **Protected shell:** Routes nest under **`PrivateRoute`** (and sometimes **`PrivateRoute` with a `modulo` prop**), then under **`CorporateLayout`** (`src/layout/CorporateLayout.jsx`), which provides the shell (e.g. navigation drawer) and renders child routes via **`Outlet`**.
- **Module gates:** When `modulo` is set, access depends on `localStorage` key `modulos` (JSON array of objects; matching uses `fc_nombre`, with Unicode normalization consistent with `PrivateRoute`).
- **Catch-all:** Unknown paths **`Navigate` to `/login`** (`src/App.jsx`).

**Unverified behavior note:** `PrivateRoute` redirects failed role/module checks to **`/sin-acceso`**, but `App.jsx` does not define a route for that path. Those navigations will hit the catch-all and end up at `/login` unless another route is added elsewhere.

## Authentication and session

- **`src/utils/auth.js`:** `isAuthenticated()` checks for a `token` in `localStorage`; `logout` clears storage and redirects to `/login`, optionally calling the backend logout endpoint when a `refreshToken` exists.
- **`src/utils/api.js`:** `apiFetch` sends `Authorization: Bearer <token>` when present; on 401/403 it may retry after refresh via **`src/utils/tokenRefresh.js`** when the error is treated as an expired token.
- **Backend base URL:** **`src/utils/config.js`** sets `API_URL` from `import.meta.env.VITE_API_URL` when defined, otherwise defaults to `http://localhost:5000`.

## API access pattern

- Prefer **`apiFetch`** for JSON `fetch` calls with shared auth and refresh behavior (see `src/utils/api.js`).
- Use **`axiosInstance`** where existing code already depends on axios behavior (`src/utils/axiosInstance.js`).

## Build and artifacts

- Vite **`build`** emits static output to **`dist/`** (used by `docker/prod/Dockerfile`, which copies `/app/dist` into the final image).

## Container and dev environment

- **Dev container** (`.devcontainer/devcontainer.json`): Docker Compose-based, **`containerUser` / `remoteUser` `bun`**, workspace under `/workspaces/...`, port **3000** forwarded, **`postCreateCommand`** runs `bun install` (frozen lockfile preferred), **`postStartCommand`** runs `bun run dev`.
- **Dev Docker Compose** (`docker/dev/compose.yaml`): builds from `docker/dev/Dockerfile` (Bun base image), bind-mounts the repo, exposes host port from **`DOCKER_DEV_REACT_PORT`** to container **3000**, runs `bun install && bun run dev`.
- **Production Docker** (`docker/prod/`): multi-stage image builds with **`bun run build`**, final stage is minimal Alpine with **`dist`**; compose file mounts a **`dist` volume** and copies build output into it (orchestration details depend on how that volume is consumed—**unverified** beyond the compose comment).

## Exploring the codebase

Use your editor or local commands to list `src/`; this document intentionally avoids embedding a directory tree. High-signal locations: `src/components/` (features and subfolders such as `registro-operativo/`), `src/layout/`, `src/utils/`, `src/hooks/`.
