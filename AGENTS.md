# AGENTS.md - Quality Technology Frontend

Agentic coding guidelines for this React frontend repository.

## Build, Lint, Test Commands

```bash
# Development server
npm start

# Production build
npm run build

# Run all tests in watch mode
npm test

# Run single test file
npm test -- App.test.js

# Run tests once (CI mode)
npm test -- --watchAll=false

# Run tests with coverage
npm test -- --coverage --watchAll=false
```

## Project Structure

- `/src/components/` - React components (PascalCase .jsx files)
- `/src/components/registro-operativo/` - Operational registry subcomponents
- `/src/layout/` - Layout components
- `/src/utils/` - Utility functions (api.js, auth.js)
- `/public/images/` - Static images
- `/docker/` - Docker configurations (dev/prod)

## Technology Stack

- **Framework**: React 18 (Create React App)
- **UI Library**: Material-UI (MUI) v7 with @emotion/styled
- **Routing**: React Router v7
- **HTTP Client**: axios
- **Animation**: framer-motion
- **Charts**: @mui/x-charts, recharts
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint (react-app config)

## Code Style Guidelines

### File Organization
- Components: `PascalCase.jsx` (e.g., `Usuarios.jsx`, `Login.jsx`)
- Utilities: `camelCase.js` (e.g., `api.js`, `auth.js`)
- One component per file
- Place component comment at top: `// src/components/ComponentName.jsx`

### Imports Order
1. React and hooks
2. Third-party libraries (MUI, axios, framer-motion)
3. Internal utilities
4. Relative components

```jsx
import React, { useState, useEffect } from "react";
import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import PageHeader from "./PageHeader";
```

### Component Patterns

**Function Components:** Use arrow functions or regular functions (both accepted)

```jsx
// Arrow function (preferred for simple components)
const Login = () => { ... };
export default Login;

// Regular function
export default function UsuariosRegistro() { ... }
```

**State Management:**
- Use `useState` for local state
- Use `useEffect` for side effects
- Initialize state with default values

```jsx
const [form, setForm] = useState({ nombre: "", contraseña: "", rol_id: "" });
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
```

### API Calls

Use `apiFetch` utility for authenticated requests:

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

For simple requests, axios is also acceptable:

```jsx
import axios from "axios";
const res = await axios.get("http://localhost:5000/usuarios");
```

### Error Handling
- Always wrap API calls in try-catch
- Log errors to console with descriptive messages
- Show user-friendly error messages in UI
- Handle 204 No Content responses properly

### MUI Styling

Use `sx` prop for inline styles:

```jsx
<Box sx={{ 
  minHeight: "100vh", 
  display: "flex",
  backgroundColor: "#f4f6f8" 
}}>
```

Use color scheme:
- Primary green: `#2E7D32`, `#1B5E20`
- Secondary blue: `#0D47A1`
- Background: `#f4f6f8`
- Text: `#C8E6C9` (light green), white

### Authentication & Routes

Check auth using `isAuthenticated()` from `utils/auth`:

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

### Naming Conventions

- **Components**: PascalCase (e.g., `BitacoraPlagas`, `CorporateLayout`)
- **Functions**: camelCase (e.g., `handleLogin`, `obtenerUsuarios`)
- **Variables**: camelCase (e.g., `usuarioSeleccionado`, `loading`)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Files**: Match component name exactly

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

## Environment Variables

- `REACT_APP_*` prefix required for client-side env vars
- API base URL: `http://localhost:5000`

## Git Workflow

1. Create feature branches from main
2. Use conventional commit messages
3. Do NOT commit `.env`, `node_modules/`, or `build/`
4. Run tests before committing

## Backend API

Base URL: `http://localhost:5000`

Common endpoints:
- `POST /usuarios/login` - Authentication
- `GET /usuarios` - List users
- `GET /roles` - List roles

## Docker Support

Development:
```bash
docker-compose -f docker/dev/compose.yaml up
```

Production:
```bash
docker-compose -f docker/prod/compose.yaml up
```
