# AGENTS.md - Quality Technology Frontend

Agentic coding guidelines for this React 19 + Vite 6 frontend.

## Commands

```bash
npm start                          # Dev server (port 3000)
npm run build                      # Production build → /dist
npm test                           # Run all tests once (CI)
npm run test:watch                 # Run tests in watch mode
npx vitest run src/App.test.jsx    # Run a single test file
npx vitest run -t "test name"      # Run a single test by name
npx vitest run --coverage          # Tests with coverage report
```

## Project Structure

```
src/
├── App.jsx                    # BrowserRouter + all routes
├── index.jsx                  # ReactDOM.createRoot entry
├── setupTests.js              # imports @testing-library/jest-dom
├── components/                # PascalCase.jsx — one component per file
│   ├── PrivateRoute.jsx
│   ├── PageHeader.jsx
│   └── registro-operativo/    # Operational log sub-module
├── layout/
│   └── CorporateLayout.jsx    # Sidebar + AppBar, renders <Outlet />
└── utils/
    ├── api.js                 # API_URL constant + apiFetch()
    ├── auth.js                # isAuthenticated, getUserRole, logout
    ├── axiosInstance.js       # Axios with Bearer token interceptor
    └── GlobalStyles.jsx       # MUI GlobalStyles component
```

## Technology Stack

- **Framework**: React 19 + Vite 6 — pure JavaScript, no TypeScript
- **UI**: MUI v7 (`@mui/material`, `@mui/icons-material`, `@mui/lab`, `@mui/x-charts`, `@mui/x-date-pickers`)
- **Routing**: React Router v7
- **HTTP**: `apiFetch` (fetch-based) or `axiosInstance` / `axios` directly
- **Animation**: framer-motion
- **Charts**: recharts, `@mui/x-charts`, react-heatmap-grid
- **Exports**: jspdf v4 + jspdf-autotable, html2canvas, html-to-image, exceljs + file-saver
- **Dates**: dayjs | **Testing**: Vitest + `@testing-library/react` v16 + jsdom

**Tooling**: No ESLint config, no Prettier config, no TypeScript. All JSX files use `.jsx` extension.

## File Conventions

- First line comment: `// src/components/ComponentName.jsx`
- Components: `PascalCase.jsx` | Utilities: `camelCase.js`
- One component per file; no barrel `index.js` files

## Import Order

```jsx
import React, { useState, useEffect, useCallback } from "react";  // 1. React
import { Box, Button } from "@mui/material";                       // 2. Third-party
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";                           // 3. Internal utils
import PageHeader from "./PageHeader";                             // 4. Relative components
```

## Component Pattern

```jsx
// src/components/Example.jsx
import React, { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../utils/api";

export default function Example({ id }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiFetch(`/recurso/${id}`);
      setData(result);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);
}
```

- `window.confirm()` before destructive API calls
- `Intl.NumberFormat` for numeric display

## HTTP Utilities

**`apiFetch`** — preferred; handles 204, injects Bearer token, throws on error:
```js
import { apiFetch } from "../utils/api";
const data = await apiFetch("/usuarios");
await apiFetch("/usuarios", { method: "POST", body: JSON.stringify(payload) });
```

**`axiosInstance`** — auto Bearer token via interceptor:
```js
import axiosInstance from "../utils/axiosInstance";
const { data } = await axiosInstance.get("/usuarios");
```

## Authentication & Route Protection

localStorage keys: `token`, `rol`, `nombre`, `usuario_id`, `granja`, `modulos` (JSON array of `{fc_nombre}`).

```jsx
<Route element={<PrivateRoute rolesPermitidos={["Administrador", "Jefe de Empresa"]} />}>
<Route element={<PrivateRoute modulo="Operaciones" />}>
  <Route element={<CorporateLayout />}>
    <Route path="registro-operativo/plagas" element={<BitacoraPlagas />} />
  </Route>
</Route>
```

Role strings are accent-normalized: `.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()`

## MUI v7 Patterns

**Grid** — use `size` prop, not `item xs`:
```jsx
<Grid size={{ xs: 12, md: 4 }}>   // correct v7
<Grid item xs={12} md={4}>        // WRONG — v5/v6 only
```

**TextField adornments** — use `slotProps`, not `InputProps`:
```jsx
slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
```

**Styling** — `sx` prop only. Never `makeStyles`, `styled()`, or plain `className` for layout.

**Color palette**: primary green `#2E7D32` / `#1B5E20`, secondary blue `#0D47A1`, background `#f4f6f8`.

## Static Images

Images in `/public/images/`. Always use absolute paths — relative paths break on sub-routes:
```jsx
<img src="/images/quality.png" />   // correct
<img src="images/quality.png" />    // WRONG
```

## Environment Variables

`API_URL` is hardcoded to `"http://localhost:5000"` in `src/utils/api.js`. To override, add `.env` and update `api.js` to use `import.meta.env.VITE_API_URL`. Use `VITE_*` prefix — `process.env.REACT_APP_*` is CRA-only.

## Testing

```jsx
import { render, screen } from "@testing-library/react";

test("renders title", () => {
  render(<Example />);
  expect(screen.getByText(/titulo/i)).toBeInTheDocument();
});
```

- Vitest `globals: true` — `describe`/`test`/`expect` available without imports
- `@testing-library/jest-dom` matchers loaded via `src/setupTests.js`
- Wrap routed components with `<MemoryRouter>` when needed
- Prefer `screen.getByRole` / `screen.getByText` over test IDs

## Code Style Rules

- **No emojis** in code comments, documentation, or inline strings
- **No `console.log`** in committed code; use `console.error` only inside catch blocks
- Spanish is used for variable names, function names, and UI strings — follow this convention
- Strings use double quotes `"` consistently

## Git Workflow

- Branch from `dev`, main is only used for production releases; never commit `.env`, `node_modules/`, or `dist/`
- Run `npm test` before committing

**Commit format** — gitmoji + short English imperative, 50 characters max (gitmoji.dev):
```
✨ Add new feature
🐛 Fix bug causing crash on startup
📝 Update documentation for API changes
🔥 Remove deprecated code
♻️ Refactor for better readability
```
Use the commit body for additional context.
