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
├── App.jsx                    # Router + all routes
├── index.jsx                  # ReactDOM.createRoot entry
├── setupTests.js              # imports @testing-library/jest-dom
├── components/                # PascalCase.jsx — one component per file
│   ├── PrivateRoute.jsx
│   ├── PageHeader.jsx
│   └── registro-operativo/    # Operational log components
├── layout/
│   └── CorporateLayout.jsx    # Sidebar + AppBar, renders <Outlet />
└── utils/
    ├── api.js                 # API_URL constant + apiFetch()
    ├── auth.js                # isAuthenticated, getUserRole, logout
    ├── axiosInstance.js       # Axios with Bearer token interceptor
    └── GlobalStyles.jsx       # MUI GlobalStyles component
```

## Technology Stack

- **Framework**: React 19 + Vite 6
- **UI**: MUI v7 (`@mui/material`, `@mui/icons-material`, `@mui/lab`, `@mui/x-charts`, `@mui/x-date-pickers`)
- **Routing**: React Router v7
- **HTTP**: `apiFetch` (fetch-based) or `axiosInstance` / `axios` directly
- **Animation**: framer-motion
- **Charts**: recharts, `@mui/x-charts`, react-heatmap-grid
- **Exports**: jspdf v4 + jspdf-autotable, html2canvas, html-to-image, exceljs + file-saver
- **Dates**: dayjs
- **Testing**: Vitest + `@testing-library/react` v16 + jsdom

## File Conventions

- All JSX files use `.jsx` extension (required by Vite/Rollup)
- First line comment: `// src/components/ComponentName.jsx`
- Components: `PascalCase.jsx` | Utilities: `camelCase.js`
- One component per file

## Import Order

```jsx
import React, { useState, useEffect, useCallback } from "react";
import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import PageHeader from "./PageHeader";
```
1. React + hooks  2. Third-party libs  3. Internal utils  4. Relative components

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

## HTTP Utilities

**`apiFetch`** — for authenticated fetch calls (handles 204, throws on error):
```js
import { apiFetch } from "../utils/api";
const data = await apiFetch("/usuarios");                    // GET
await apiFetch("/usuarios", { method: "POST", body: JSON.stringify(payload) });
```

**`axiosInstance`** — axios with auto Bearer token injection:
```js
import axiosInstance from "../utils/axiosInstance";
const { data } = await axiosInstance.get("/usuarios");
await axiosInstance.post("/usuarios", payload);
```

Direct `axios` with `API_URL` is also acceptable for simpler cases.

## Authentication & Route Protection

localStorage keys: `token`, `rol`, `nombre`, `usuario_id`, `granja`, `modulos` (JSON array).

```jsx
// Protect by role:
<Route element={<PrivateRoute rolesPermitidos={["Administrador", "Jefe de Empresa"]} />}>

// Protect by module name (checked against localStorage "modulos"):
<Route element={<PrivateRoute modulo="Operaciones" />}>
  <Route element={<CorporateLayout />}>
    <Route path="registro-operativo/plagas" element={<BitacoraPlagas />} />
  </Route>
</Route>
```

Role strings are accent-normalized: `.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()`

## MUI v7 Patterns

**Grid** — use `size` prop (not `item xs`):
```jsx
<Grid size={{ xs: 12, md: 4 }}>   // correct v7
<Grid item xs={12} md={4}>        // WRONG — v5/v6 only
```

**TextField with adornments** — use `slotProps` (not `InputProps`):
```jsx
slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
// InputProps={{ ... }}  WRONG — deprecated
```

**Styling** — `sx` prop for all inline styles:
```jsx
<Box sx={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
```

**Color palette**: primary green `#2E7D32` / `#1B5E20`, secondary blue `#0D47A1`, background `#f4f6f8`.

## Static Images

Images live in `/public/images/`. Always use absolute paths:
```jsx
<img src="/images/quality.png" />        // correct
const logo = `/images/${name}.png`;      // correct
<img src="images/quality.png" />         // WRONG — breaks on sub-routes
```

## Testing

```jsx
// src/components/Example.test.jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("renders title", () => {
  render(<Example />);
  expect(screen.getByText(/titulo/i)).toBeInTheDocument();
});
```

- Vitest `globals: true` — `describe`/`test`/`expect` available without imports
- `@testing-library/jest-dom` matchers loaded via `src/setupTests.js`
- Wrap routed components with `<MemoryRouter>` when needed

## Environment Variables

```js
import { API_URL } from "./utils/api";  // "http://localhost:5000"
import.meta.env.VITE_API_URL            // for .env overrides
```
Use `VITE_*` prefix — `process.env.REACT_APP_*` is CRA-only and will not work.

## Git Workflow

- Branch from `main` using conventional commits
- Never commit `.env`, `node_modules/`, or `dist/`
- Run tests before committing: `npm test`
