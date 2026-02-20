# AGENTS.md - Quality Technology Frontend

Agentic coding guidelines for this React frontend repository.

## Build, Lint, Test Commands

```bash
# Development server (port 3000)
npm start

# Production build (output: /dist)
npm run build

# Preview production build
npm run preview

# Run tests once (CI mode)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npx vitest run --coverage
```

## Project Structure

```
/
├── index.html                          # Vite entry point (raíz, NO en /public)
├── vite.config.js                      # Vite + Vitest config
├── src/
│   ├── index.jsx                       # React root (ReactDOM.createRoot)
│   ├── App.jsx                         # Router y rutas principales
│   ├── setupTests.js                   # Vitest setup (@testing-library/jest-dom)
│   ├── components/                     # Componentes React (PascalCase.jsx)
│   │   └── registro-operativo/         # Bitácoras y registros operativos
│   ├── layout/                         # CorporateLayout, etc.
│   └── utils/                          # api.js, auth.js
├── public/
│   └── images/                         # Imágenes estáticas (logo, etc.)
└── docker/                             # Configuraciones Docker (dev/prod)
```

## Technology Stack

- **Framework**: React 19 + Vite 6
- **UI Library**: MUI v7 (@mui/material, @mui/icons-material, @mui/lab, @mui/x-charts, @mui/x-date-pickers)
- **Routing**: React Router v7
- **HTTP Client**: axios
- **Animation**: framer-motion
- **Charts**: recharts, @mui/x-charts, react-heatmap-grid
- **PDF Export**: jspdf v4 + jspdf-autotable, html2canvas, html-to-image
- **Excel Export**: exceljs + file-saver
- **Fechas**: dayjs
- **Testing**: Vitest + @testing-library/react v16 + jsdom

## Code Style Guidelines

### File Organization
- Componentes: `PascalCase.jsx` (e.g., `Usuarios.jsx`, `Login.jsx`)
- Utilidades: `camelCase.js` (e.g., `api.js`, `auth.js`)
- Un componente por archivo
- Comentario de ruta al inicio: `// src/components/ComponentName.jsx`
- **Todos los archivos con JSX deben usar extensión `.jsx`** (requerido por Rollup/Vite)

### Imports Order
1. React y hooks
2. Librerías de terceros (MUI, axios, framer-motion)
3. Utilidades internas
4. Componentes relativos

```jsx
import React, { useState, useEffect, useCallback } from "react";
import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import PageHeader from "./PageHeader";
```

### Component Patterns

**Function Components:** Arrow functions o funciones regulares (ambas aceptadas)

```jsx
// Arrow function (preferida para componentes simples)
const Login = () => { ... };
export default Login;

// Función regular
export default function UsuariosRegistro() { ... }
```

**State Management:**
- `useState` para estado local
- `useEffect` para side effects
- `useCallback` para funciones usadas en dependencias de useEffect

```jsx
const [form, setForm] = useState({ nombre: "", contraseña: "", rol_id: "" });
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const cargarDatos = useCallback(async () => {
  // fetch logic
}, [usuario_id]);

useEffect(() => {
  if (usuario_id) cargarDatos();
}, [usuario_id, cargarDatos]);
```

### API Calls

Usar `apiFetch` para requests autenticados:

```jsx
import { apiFetch } from "../utils/api";

const obtenerUsuarios = async () => {
  try {
    const data = await apiFetch("/usuarios");
    setUsuarios(data);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    setError(error.message);
  }
};
```

Para requests simples, axios también es aceptable:

```jsx
import axios from "axios";
const res = await axios.get("http://localhost:5000/usuarios");
```

### Error Handling
- Siempre envolver llamadas a la API en try-catch
- Loguear errores a consola con mensajes descriptivos
- Mostrar mensajes de error amigables en la UI
- Manejar respuestas 204 No Content correctamente

### MUI v7 Styling

Usar prop `sx` para estilos inline:

```jsx
<Box sx={{
  minHeight: "100vh",
  display: "flex",
  backgroundColor: "#f4f6f8"
}}>
```

**Grid API v7** — usar `size` en lugar de `item xs`:

```jsx
// CORRECTO (MUI v7)
<Grid size={{ xs: 12, md: 4 }}>

// INCORRECTO (MUI v5/v6, no usar)
<Grid item xs={12} md={4}>
```

**TextField con InputAdornment** — usar `slotProps` en lugar de `InputProps`:

```jsx
// CORRECTO (MUI v7)
slotProps={{
  input: {
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon color="primary" />
      </InputAdornment>
    ),
  },
}}

// INCORRECTO (deprecado, no usar)
InputProps={{ startAdornment: ... }}
```

Paleta de colores:
- Verde primario: `#2E7D32`, `#1B5E20`
- Azul secundario: `#0D47A1`
- Fondo: `#f4f6f8`
- Texto claro: `#C8E6C9` (verde claro), blanco

### Rutas de imágenes estáticas

Las imágenes viven en `/public/images/` y se referencian con rutas absolutas:

```jsx
// CORRECTO
src="/images/quality.png"
const logo = `/images/${nombre}.png`;

// INCORRECTO (ruta relativa, falla en subrutas)
src="images/quality.png"
```

### Authentication & Routes

```jsx
import { isAuthenticated } from "../utils/auth";

const PrivateRoute = ({ rolesPermitidos }) => {
  const auth = isAuthenticated();
  const rol = (localStorage.getItem("rol") || "").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").trim();

  if (!auth) return <Navigate to="/login" replace />;
  if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
    return <Navigate to="/sin-acceso" replace />;
  }
  return <Outlet />;
};
```

Auth en localStorage: `token`, `rol`, `nombre`, `usuario_id`, `granja`.

### Naming Conventions

- **Componentes**: PascalCase (e.g., `BitacoraPlagas`, `CorporateLayout`)
- **Funciones**: camelCase (e.g., `handleLogin`, `obtenerUsuarios`)
- **Variables**: camelCase (e.g., `usuarioSeleccionado`, `loading`)
- **Constantes globales**: UPPER_SNAKE_CASE fuera del componente
- **Archivos**: Coincidir exactamente con el nombre del componente, extensión `.jsx`

### Testing

```jsx
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app component', () => {
  render(<App />);
  const element = screen.getByText(/texto esperado/i);
  expect(element).toBeInTheDocument();
});
```

El setup file `src/setupTests.js` importa `@testing-library/jest-dom` para los matchers.
Vitest está configurado con `globals: true`, por lo que `describe/test/expect` están disponibles sin importar.

## Environment Variables

- Prefijo `VITE_*` requerido para variables accesibles en el cliente (e.g., `VITE_API_URL`)
- API base URL: `http://localhost:5000`
- **No usar** `process.env.REACT_APP_*` (era CRA, ya no aplica)
- En Vite las variables se acceden con `import.meta.env.VITE_*`

## Git Workflow

1. Crear ramas feature desde `main`
2. Usar mensajes de commit convencionales
3. NO commitear `.env`, `node_modules/`, ni `dist/`
4. Correr tests antes de commitear

## Backend API

Base URL: `http://localhost:5000`

Endpoints comunes:
- `POST /usuarios/login` - Autenticación
- `GET /usuarios` - Listar usuarios
- `GET /roles` - Listar roles

## Docker Support

Development (requiere `.env` con `DOCKER_DEV_NAME` y `DOCKER_DEV_REACT_PORT`):
```bash
docker-compose -f docker/dev/compose.yaml up
```

Production:
```bash
docker-compose -f docker/prod/compose.yaml up
```
