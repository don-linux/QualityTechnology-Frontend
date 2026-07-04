# Conventions

This file records conventions that are **evident from repository configuration and code**. For additional editorial rules used by automation and contributors, see **`AGENTS.md`** in the repository root (it may overlap; this doc does not replace it).

## Language and modules

- **Language:** JavaScript with **JSX** (`.jsx` files). There is no TypeScript configuration in the project root **verified** from the inspected manifests.
- **Module system:** ESM via Vite (`import` / `export`).
- **Component files:** React screens and shared UI use **PascalCase** filenames (e.g. `Usuarios.jsx`, `AppLayout.jsx`). Service and utility modules use **camelCase** (e.g. `axiosInstance.js`, `useFormValidation.js`, `usuariosService.js`). Page wrappers use **PascalCase** with a `Page` suffix (e.g. `UsuariosPage.jsx`).

## Formatting (observed in source, not enforced by repo config)

The following appear consistently in reviewed entry files (`src/index.jsx`, `src/App.jsx`, utilities):

- Double-quoted strings
- Semicolon-terminated statements
- 2-space indentation

**Linting:** **oxlint** via **`npm run lint`** / **`npm run lint:fix`** (config: **`.oxlintrc.json`**, devDependency **`oxlint`**). The dev container recommends the **oxc.oxc-vscode** extension (`.devcontainer/devcontainer.json`).

**Formatting:** No committed Prettier config was found. The dev container recommends **Prettier** (`esbenp.prettier-vscode`); whether formatting is enforced via editor only is **unknown**.

## React patterns

- **Functional components** and hooks (observed across `App.jsx`, layouts, and utilities).
- **Lazy loading** of route-level pages with **`Suspense`** and a shared fallback (`src/app/router.jsx`). Page files in `src/pages/` serve as thin re-export boundaries for code splitting.

## MUI usage

- **`sx`** prop is used for component-level styling (e.g. layout fallback in `App.jsx`; widespread in components).
- **MUI Grid v2-style API** with the `size` prop is used in the codebase (example: `Grid size={{ xs: 12, md: 6 }}` in `src/features/inventarios/components/InfraestructuraFisica.jsx`). Prefer matching this pattern in new code for consistency.

## Routing and URLs

- Route path segments use **kebab-case** (e.g. `bitacoras/flujo-insumos`, `ventas/flujo-caja`). New routes should follow existing naming in `src/app/router.jsx` and navigation links in `AppLayout.jsx`.

## API and configuration

- **Environment:** Vite exposes variables prefixed with **`VITE_`**. Backend base URL is read as **`VITE_API_URL`** in `src/shared/lib/config.js` (falls back to `http://localhost:5000/api`).
- **Service layer:** Each domain has service files under `features/<domain>/services/` that encapsulate all HTTP calls. Prefer importing service functions (`import { listUsuarios } from "../services/usuariosService"`) rather than using `axiosInstance` directly in components.
- **HTTP instance:** `axiosInstance` lives at `@shared/lib/axiosInstance`. Service files already import it; components should not need to import it directly.
- **Upload URLs:** Use `getUploadUrl` from `@shared/lib/uploadUrl` for authenticated file download/upload URLs.

## Testing

- **Runner:** Vitest (see `package.json` and `vite.config.js`).
- **Environment:** `jsdom`, **`globals: true`**, setup file **`src/setupTests.js`** (imports `@testing-library/jest-dom`).
- **Location / naming:** At least one test uses the pattern **`src/app/App.test.jsx`** (Vitest picks up tests per `vite.config.js` defaults). There is no custom `include`/`exclude` in `vite.config.js` beyond Vitest defaults.
- **Listado filter pipeline:** Co-locate pure filter/registry tests with the registry — **`src/shared/components/listado/filtros/registroFiltros.test.js`**. Run with `npm test -- --run src/shared/components/listado/filtros/registroFiltros.test.js`.

## Listado filters (`TablasPorUbicacionGranja`)

Location-grouped tables use a registry-based filter system. See **`docs/HOW_TO_ADD_LISTADO_FILTERS.md`** for the full guide.

- **Declarative config:** Pass `filtros={["busqueda", ...]}` and `filtroConfig={{ busqueda: { keys, placeholder }, ... }}` on `TablasPorUbicacionGranja`. Use top-level `campoFecha` for date field name (default `"fecha"`).
- **Registry:** One module per filter under `src/shared/components/listado/filtros/`; register in `REGISTRO_FILTROS` in `registroFiltros.js`. Each entry exports `id`, `Componente`, `valorVacio`, `estaActivo`, `aplicar`, `enExportacion`.
- **No legacy props:** Do not use removed props (`buscar`, `searchKeys`, `filtrar`, `placeholderBusqueda`, `filtroFecha`, `mostrarConteo`, `exportar.campoFecha`). There are no fallbacks.
- **Export vs view:** Filters with `enExportacion: false` (e.g. `fechas`) affect the table only; export row selection and report footer dates come from `DialogExportarListado` plus filters with `enExportacion: true` (e.g. `busqueda`).
- **Reference implementation:** `ControlLimpieza.jsx` (`filtros={["busqueda", "fechas"]}`); search-only bitácoras use `filtros={["busqueda"]}` only.

## Docker / toolchain

- **Runtime:** Node.js **24.x** and **npm** (dev image: `node:24.16.0-slim` in `docker/dev/Dockerfile`).
- **Lockfile:** **`package-lock.json`**. Reproducible installs: **`npm ci`** (production Docker build).
- **Dev container:** `postCreateCommand` → `npm install`; `postStartCommand` → `npm run dev` (`.devcontainer/devcontainer.json`).
- **Docker dev service:** `npm install && npm run dev` (`docker/dev/compose.yaml`).
- **Production Docker:** build with **`npm ci`** and **`npm run build`** (`docker/prod/Dockerfile`).

Local and container workflows use **`npm install`**, **`npm run …`**, and **`npx`** for one-off tools. See **`docs/COMMANDS.md`** for script names.

## Static assets

- `src/features/auth/components/Login.jsx` uses absolute paths such as **`/images/ceiba.png`**. In this project, that pattern resolves from the **`public/`** directory through Vite’s static asset handling. Match that approach when adding shared static images.
