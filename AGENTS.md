# Quality Technology Frontend

## Code Style and Architecture Guidelines

### Imports

- Keep import groups in this order: 1) React, 2) third-party packages, 3) app utilities/hooks/constants, 4) relative components/files.
- Prefer one blank line between groups.
- Prefer existing import style in each file; do not churn unrelated imports for style-only changes.

### Formatting

- Use double quotes for strings.
- Use semicolons.
- Use 2-space indentation.
- Keep lines readable; split long JSX props/objects across lines.
- Prefer `const` by default and `let` only when reassignment is required.

### Types and Data Shapes

- This repo is JavaScript-first; do not introduce TypeScript unless requested.
- When adding complex payload handling, document shape with JSDoc typedefs if needed.
- Normalize numeric input before sending (`Number(...)`, `parseFloat(...)`) when backend expects numbers.
- Guard nullable fields from API responses before rendering.

### Naming Conventions

- Components: PascalCase file names and component names (`Usuarios.jsx`, `PrivateRoute.jsx`).
- Utilities/helpers: camelCase (`apiFetch`, `isAuthenticated`).
- Route paths: kebab-case segments (`registro-operativo/recepcion-insumos`).
- Domain naming is mostly Spanish; keep existing domain terms consistent in touched files.

### React Patterns

- Use functional components and hooks.
- Keep side effects in `useEffect`; include complete dependency arrays.
- For async loaders reused by effects, prefer `useCallback` + `useEffect`.
- Prefer early returns for guard clauses (auth checks, missing selection, invalid form).

### MUI and UI Patterns

- Prefer `sx` for component-level styling.
- Use MUI v7 Grid API (`size={{ xs: 12, sm: 6 }}`), not legacy `item xs={...}`.
- For TextField adornments, prefer `slotProps.input.startAdornment`.
- Keep responsive behavior for forms/tables using MUI breakpoints.
- Static images should use absolute `/images/...` paths from `public/`.

### API Access Rules

- Prefer `apiFetch` for straightforward JSON CRUD endpoints.
- Use `axiosInstance` when endpoint code already depends on axios behavior.
- Avoid importing raw `axios` directly in new code; use the shared instance.
- Reuse `API_URL` from `src/utils/api.js` for absolute endpoint composition.

### Error Handling and User Feedback

- Wrap network operations in `try/catch`.
- Log failures with `console.error(...)` and avoid `console.log` for errors.
- Show user-facing feedback for failures (`alert`, inline error text, or existing pattern in file).
- Confirm destructive operations with `window.confirm(...)` before delete or bulk delete.
- Preserve backend error details when available (`err.message`, response error payload).

### Auth and Route Protection

- Current auth state is localStorage-based.
- Common keys: `token`, `rol`, `nombre`, `usuario_id`, `granja`, `modulos`.
- Role/module checks happen in `PrivateRoute`; keep normalization behavior when extending.

## Testing Guidelines

- Test runner config is in `vite.config.js` (`globals: true`, `environment: "jsdom"`).
- `@testing-library/jest-dom` is loaded in `src/setupTests.js`.
- Prefer Testing Library queries by role/text over implementation details.
- For routed components, render under `MemoryRouter` when route context is required.
- Keep tests deterministic; mock network calls as needed for new component tests.

## Git and Collaboration Conventions

- Branch from `dev`; open PRs into `dev`.
- Branch names from `CONTRIBUTING.md`: `feature/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`.
- Do not commit generated output or local artifacts (`dist/`, `node_modules/`, `.env`).

## Agent Completion Checklist

- Confirm touched files follow local conventions (imports, hooks, naming).
- Confirm no accidental raw `axios` usage in new code.
- Confirm destructive actions still require confirmation prompts.
- Run relevant tests (single test for focused changes, full suite when broad).
- Run build when route/layout/shared components were changed.
- Keep diffs minimal and avoid unrelated refactors.

If you find conflicting conventions in legacy code, prioritize consistency within edited files and avoid broad style rewrites.
