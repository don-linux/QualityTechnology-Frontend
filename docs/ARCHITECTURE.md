# Architecture

## Purpose

Single-page web application for **Quality Technology** (*Sistema Integral Quality Technology*). The UI is grouped by domain (catalogs, inventories, sales, finance, HR, operational logs, security) behind authentication and module-based access control.

## Runtime stack

From `package.json`:

- **UI:** React 19, React DOM 19
- **Routing:** `react-router-dom` 7
- **Build / dev server:** Vite 8 with `@vitejs/plugin-react`
- **UI library:** MUI 7 (`@mui/material`, `@mui/icons-material`) with Emotion
- **HTTP:** `axios` via `src/shared/lib/axiosInstance.js` (shared instance with request/response interceptors for auth and token refresh)
- **Other notable libraries:** `dayjs`, `exceljs`, `file-saver`, `framer-motion`, `jspdf` / `jspdf-autotable`, `recharts`

## Entry points and bootstrap

1. **`index.html`** loads the Vite module entry **`src/index.jsx`**.
2. **`src/index.jsx`** mounts the app under `#root`, wraps it in `React.StrictMode`, and applies MUI **`ThemeProvider`** with `createTheme()`.
3. **`src/app/App.jsx`** sets up **`BrowserRouter`**, `CssBaseline`, app-wide styles, and delegates to **`AppRouter`**.
4. **`src/app/router.jsx`** defines all route tree with **`Suspense`** and lazy-loaded page wrappers.

## Source organization (`src/`)

Feature-based layout with shared infrastructure:

```
src/
├── app/                          # Bootstrap
│   ├── App.jsx                   # Providers composition (Router, CssBaseline, GlobalStyles)
│   ├── router.jsx                # Route tree (lazy-loaded pages, PrivateRoute guards)
│   └── providers/                # (future) Theme, Auth, QueryClient
├── pages/                        # One file per route (thin wrappers for lazy loading)
│   ├── auth/LoginPage.jsx
│   ├── inicio/InicioPage.jsx
│   ├── perfil/MiPerfilPage.jsx
│   ├── catalogos/                # UsuariosPage, RolesPage, PuestosPage, DepartamentosPage, ClientePage
│   ├── inventarios/              # InfraestructuraFisicaPage, AlevinajePage, ReproductoresPage, EngordaPage, ...
│   ├── ventas/                   # VentaPage, ListaEsperaPage, FlujoCajaPage, TesoreriaGeneralPage
│   ├── rrhh/                     # EmpleadosPage, NominaPage, VacacionesPage, CajaAhorroPage, ProveedoresPage
│   ├── registro-operativo/       # ControlFaunaNocivaPage, BioBiometriasPage, ...
│   └── seguridad/ModulosPorRolPage.jsx
├── features/                     # Domain logic
│   ├── auth/
│   │   ├── components/Login.jsx
│   │   └── services/authService.js
│   ├── catalogos/
│   │   ├── components/           # Usuarios, Roles, Puestos, Departamentos, Cliente
│   │   └── services/             # usuariosService, rolesService, puestosService, ...
│   ├── inventarios/
│   │   ├── components/           # InfraestructuraFisica, Alevinaje, Reproductores, Engorda, Equipos, EficienciaReproductiva, CiclosEngorda, Trazabilidad
│   │   └── services/             # infraestructuraFisicaService, alevinajeService, reproductoresService, engordaService, eficienciaReproductivaService, trazabilidadService, equiposService
│   ├── ventas/
│   │   ├── components/           # Venta, ListaEspera, FlujoCaja, TesoreriaGeneral, CuentasDialog
│   │   └── services/             # ventasService, listaEsperaService, flujoCajaService, tesoreriaService
│   ├── rrhh/
│   │   ├── components/           # Empleados, Nomina, Vacaciones, CajaAhorro, Proveedores, DocumentosEmpleado, MiPerfil
│   │   └── services/             # empleadosService, nominaService, vacacionesService, ...
│   ├── registro-operativo/
│   │   ├── components/           # 11 bitacora + biometria components
│   │   └── services/             # bitacorasService, biometriasService
│   └── seguridad/
│       ├── components/ModulosPorRol.jsx
│       └── services/seguridadService.js
├── shared/                       # Cross-cutting concerns
│   ├── components/               # PageHeader, PasswordField, Copyright, SinAcceso
│   ├── layout/AppLayout.jsx
│   ├── guards/PrivateRoute.jsx
│   ├── hooks/                    # useConfirm, useFormValidation
│   ├── lib/                      # axiosInstance, auth, config, tokenRefresh, uploadUrl
│   ├── styles/GlobalStyles.jsx
│   └── constants/
├── index.jsx
└── setupTests.js
```

## Vite path aliases

Defined in `vite.config.js`:

| Alias | Resolves to |
|-------|------------|
| `@app` | `src/app` |
| `@pages` | `src/pages` |
| `@features` | `src/features` |
| `@shared` | `src/shared` |

All inter-module imports use these aliases instead of relative paths.

## Routing and code splitting

- Page files in `src/pages/` are thin re-exports that serve as **lazy loading boundaries** (`React.lazy` in `router.jsx`).
- **Protected shell:** Routes nest under **`PrivateRoute`** (with optional `modulo` prop), then under **`AppLayout`**, which provides the navigation drawer and renders child routes via **`Outlet`**.
- **Module gates:** When `modulo` is set, access depends on `localStorage` key `modulos` (JSON array; matching uses `nombre` with Unicode normalization).
- **Catch-all:** Unknown paths **`Navigate` to `/login`**.

## Authentication and session

- **`src/shared/lib/auth.js`:** `isAuthenticated()` checks for a `token` in `localStorage`; `logout` clears storage and redirects to `/login`.
- **`src/shared/lib/axiosInstance.js`:** Shared axios instance with `baseURL` from config. Request interceptor injects `Authorization: Bearer <token>`; response interceptor retries on 401/403 after refresh.
- **`src/shared/lib/tokenRefresh.js`:** Uses native `fetch()` (not axios) to avoid circular dependency with the axios interceptors.
- **Backend base URL:** **`src/shared/lib/config.js`** sets `API_URL` from `import.meta.env.VITE_API_URL`, defaulting to `http://localhost:5000/api`.

## API access pattern

- **Service files** under `features/<domain>/services/` encapsulate all HTTP calls for each domain. Import the specific service function rather than using `axiosInstance` directly in components.
- **`src/shared/lib/uploadUrl.js`** exports `getUploadUrl(path)` for building authenticated download/upload URLs.

## Build and artifacts

- Vite **`build`** emits static output to **`dist/`**.

## Container and dev environment

- **Dev container** (`.devcontainer/devcontainer.json`): Docker Compose-based, **Node.js 24.x** + **npm**, port **3000** forwarded; `npm install` on create, `npm run dev` on start.
- **Dev Docker Compose** (`docker/dev/compose.yaml`): image `node:24.16.0-slim` (`docker/dev/Dockerfile`), bind-mounts the repo, runs `npm install && npm run dev`.
- **Production Docker** (`docker/prod/`): multi-stage image on **Node 24**, **`npm ci`** + **`npm run build`**, final stage copies **`dist/`** to a mounted volume.
