# Architecture

## Purpose

Single-page web application for **Quality Technology** (`index.html` title: *Sistema Integral Quality Technology*; meta description: *Quality Technology*). The UI is grouped by domain (catalogs, inventories, sales, finance, HR, operational logs, security) behind authentication and module-based access control. Route groupings in `src/App.jsx` mirror those domains via `PrivateRoute` `modulo` values (e.g. `Operaciones`, `Finanzas`, `RRHH`, `Catálogos`, `Inventarios`, `Ventas`, `Seguridad`).

## Runtime stack

Verified from `package.json`:

- **UI:** React 19, React DOM 19
- **Routing:** `react-router-dom` 7
- **Build / dev server:** Vite 8 with `@vitejs/plugin-react`
- **UI library:** MUI 7 (`@mui/material`, `@mui/icons-material`) with Emotion
- **HTTP:** `axios` via `src/utils/axiosInstance.js` (shared instance with request/response interceptors for auth and token refresh)
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

- **`src/utils/auth.js`:** `isAuthenticated()` checks for a `token` in `localStorage`; `logout` clears storage and redirects to `/login`, calling the backend logout endpoint via `axiosInstance` when a `refreshToken` exists.
- **`src/utils/axiosInstance.js`:** Shared axios instance with `baseURL` from config. Request interceptor injects `Authorization: Bearer <token>`; response interceptor retries on 401/403 after refresh via **`src/utils/tokenRefresh.js`**.
- **`src/utils/tokenRefresh.js`:** Uses native `fetch()` (not axios) to avoid circular dependency with the axios interceptors. Concurrent callers share a single in-flight refresh promise.
- **Backend base URL:** **`src/utils/config.js`** sets `API_URL` from `import.meta.env.VITE_API_URL` when defined, otherwise defaults to `http://localhost:5000`.

## API access pattern

- Use **`axiosInstance`** (`src/utils/axiosInstance.js`) for all HTTP calls. Import it as `import axios from "../utils/axiosInstance.js"`.
- **`src/utils/uploadUrl.js`** exports `getUploadUrl(path)` for building authenticated download/upload URLs with a token query parameter.

## Build and artifacts

- Vite **`build`** emits static output to **`dist/`** (used by `docker/prod/Dockerfile`, which copies `/app/dist` into the final image).

## Container and dev environment

- **Dev container** (`.devcontainer/devcontainer.json`): Docker Compose-based, **`containerUser` / `remoteUser` `bun`**, workspace under `/workspaces/...`, port **3000** forwarded, **`postCreateCommand`** runs `bun install` (frozen lockfile preferred), **`postStartCommand`** runs `bun run dev`.
- **Dev Docker Compose** (`docker/dev/compose.yaml`): builds from `docker/dev/Dockerfile` (Bun base image), bind-mounts the repo, exposes host port from **`DOCKER_DEV_REACT_PORT`** to container **3000**, runs `bun install && bun run dev`.
- **Production Docker** (`docker/prod/`): multi-stage image builds with **`bun run build`**, final stage is minimal Alpine with **`dist`**; compose file mounts a **`dist` volume** and copies build output into it (orchestration details depend on how that volume is consumed—**unverified** beyond the compose comment).

## Source organization (`src/`)

There is no separate `pages/` directory; screens live as components.

- **`index.jsx`** — Mounts the app, `StrictMode`, MUI `ThemeProvider`.
- **`App.jsx`** — Router, lazy-loaded routes, `Suspense` fallback, `CssBaseline`, `GlobalStyles`.
- **`components/`** — Feature screens (e.g. `Usuarios`, `Empleados`, `Venta`, `Login`, `PrivateRoute`, `PageHeader`, `FormDialog`). Operational log and bio tracking UIs sit under **`components/registro-operativo/`** (bitácora and related modules).
- **`layout/CorporateLayout.jsx`** — Authenticated shell (navigation, `Outlet` for child routes).
- **`hooks/`** — Reusable hooks (e.g. `useConfirm.jsx`, `useFormValidation.js`).
- **`utils/`** — `axiosInstance`, `auth`, `tokenRefresh`, `config` (`VITE_API_URL`), `uploadUrl`, `GlobalStyles.jsx`.

Shared UI helpers such as **`PageHeader`** and **`FormDialog`** live alongside domain components; prefer reusing them when adding screens.

## Exploring the codebase

Use your editor or repository search to list files under `src/`; this document does not embed a full directory tree. Start from `App.jsx` for the route map, then the matching component file under `components/` or `components/registro-operativo/`.
