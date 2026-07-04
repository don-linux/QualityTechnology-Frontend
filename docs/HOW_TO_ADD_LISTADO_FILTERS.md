# How to add listado filters

Modular filtering and export for location-grouped tables (`TablasPorUbicacionGranja`). Three concerns are separated: declarative per-table config, a filter registry (one module per filter), and runtime wiring (hook, toolbar, export modal).

## Location

| Role | Path |
|------|------|
| Table shell (unchanged import path) | `src/shared/components/TablasPorUbicacionGranja.jsx` |
| Runtime | `src/shared/components/listado/` |
| Filter modules | `src/shared/components/listado/filtros/` |
| Export helpers | `src/shared/utils/exportarTabla.js` |

Consumers import `TablasPorUbicacionGranja` from `@shared/components/TablasPorUbicacionGranja`. Listado internals live under `listado/` and are not imported directly by feature screens.

## Architecture

```
TablasPorUbicacionGranja
  └── ListadoUbicacionItem (per accordion / location)
        ├── useFiltrosListado          ← filter state + row pipelines
        ├── ListadoToolbar
        │     ├── ListadoFiltros       ← renders registry UI components
        │     └── BotonesExportar
        ├── renderTabla(filas)         ← view rows (all active filters)
        └── DialogExportarListado      ← export date range (independent of view)
```

1. **Declarative config per table** — `filtros` (enabled filter ids) and `filtroConfig` (per-id options).
2. **Filter registry** — `REGISTRO_FILTROS` in `filtros/registroFiltros.js`; each entry is one filter module with UI + pure apply logic.
3. **Runtime** — `useFiltrosListado`, `ListadoToolbar`, and `DialogExportarListado` orchestrate state, rendering, and export.

## TablasPorUbicacionGranja API

### Current props

```jsx
<TablasPorUbicacionGranja
  grupos={[{ value, label, rows }, ...]}
  renderTabla={(filas) => <ListadoTabla ... />}
  filtros={["busqueda", "fechas"]}   // default: []
  filtroConfig={{
    busqueda: { keys: ["campo1", "campo2"], placeholder: "Buscar..." },
    // fechas.campo defaults via campoFecha prop (see below)
  }}
  campoFecha="fecha"                 // default: "fecha"; used by fechas filter + export
  exportar={{
    columnas,                        // array or () => array
    titulo,
    subtitulo,
    nombreArchivo,
  }}
  getLogo={(value) => ...}
  getColor={(value) => ...}
  defaultExpanded={false}
  accordionSx={...}
  detailsSx={...}
/>
```

`campoFecha` is injected into `filtroConfig.fechas.campo` when `"fechas"` is in `filtros`, unless overridden in `filtroConfig.fechas.campo`.

### Removed props (no fallbacks)

Do not pass these; they were removed in the refactor:

- `buscar`, `searchKeys`, `filtrar`, `placeholderBusqueda`
- `filtroFecha`, `mostrarConteo`
- `exportar.campoFecha` (use top-level `campoFecha` instead)

## Filter module contract

Each filter in `filtros/` exports a definition object:

| Field | Purpose |
|-------|---------|
| `id` | Registry key; must match the string in `filtros={[...]}` |
| `Componente` | React UI; receives `valor`, `onChange`, `config` |
| `valorVacio` | Initial value (cloned via `structuredClone` in `valoresIniciales`) |
| `estaActivo(valor)` | Whether the filter counts as active (toolbar count, chip label) |
| `aplicar(rows, valor, config)` | Pure function; returns filtered rows |
| `enExportacion` | If `true`, filter applies to `filasExportacion`; if `false`, view only |

### Built-in filters

| id | `enExportacion` | Config keys | Notes |
|----|-----------------|-------------|-------|
| `busqueda` | `true` | `keys`, `placeholder` | Case-insensitive substring match on listed row fields |
| `fechas` | `false` | `campo` (default `"fecha"`) | Inclusive date range on screen; export uses modal dates instead |

## useFiltrosListado

Hook used internally by `TablasPorUbicacionGranja`; signature:

```js
useFiltrosListado({ rows, filtros = [], config = {} })
```

Returns:

| Field | Description |
|-------|-------------|
| `valores` | Current filter values keyed by filter id |
| `setFiltro(id, valor)` | Update one filter |
| `filas` | Rows after all enabled filters (table view) |
| `filasExportacion` | Rows after filters where `enExportacion === true` only |
| `hayFiltroActivo` | Whether any enabled filter is active |

Registry helpers in `registroFiltros.js`: `valoresIniciales`, `aplicarFiltros`, `hayFiltroActivo`, `filtrosExportacion`, `rangoFechasDesdeSeleccion`.

## Export flow

1. Excel/PDF buttons in `BotonesExportar` open `DialogExportarListado`.
2. User sets a date range in the modal (independent of the on-screen `fechas` filter).
3. Row selection for export:
   - Start from `filasExportacion` (search applied when active).
   - Apply modal date range via `REGISTRO_FILTROS.fechas.aplicar(filasExportacion, fechasModal, config.fechas)`.
4. Report footer `rangoFechas` comes from modal dates (`rangoFechasDesdeSeleccion`), not min/max of exported rows.
5. Empty export is allowed (0 rows with a valid footer period).
6. The view-only `fechas` filter does **not** restrict export row selection.

`calcularRangoFechas` in `exportarTabla.js` is shown in the modal as an informational hint (`rangoDatosDisponibles`); it must not drive report footers.

## Adding a new filter

1. Create `src/shared/components/listado/filtros/FiltroX.jsx` with:
   - A UI component (`valor`, `onChange`, `config`).
   - A pure `aplicar` function.
   - An exported definition object (`id`, `Componente`, `valorVacio`, `estaActivo`, `aplicar`, `enExportacion`).
2. Register it in `REGISTRO_FILTROS` in `registroFiltros.js`.
3. Enable per table:

```jsx
<TablasPorUbicacionGranja
  filtros={["busqueda", "x"]}
  filtroConfig={{
    busqueda: { keys: [...], placeholder: "..." },
    x: { /* filter-specific options */ },
  }}
  ...
/>
```

Set `enExportacion: true` when the filter should affect exported rows; `false` when export needs a separate control (like `fechas`).

## Consumer migration status

Bitácoras using `TablasPorUbicacionGranja`:

| Screen | `filtros` | Notes |
|--------|-----------|-------|
| ControlLimpieza | `["busqueda", "fechas"]` | Pilot — full filter set |
| ParametrosFisicoQuimicos, BitacoraInventario, BioBiometrias, Medicamentos, ControlFaunaNociva, ControlVisitas, BitacoraLimpiezaInstalaciones, BioAlimentacion | `["busqueda"]` | Search only; `filtroConfig.busqueda` per screen |
| FlujoInsumos | (none) | Export only; flat table — planned refactor elsewhere |
| Inventarios (6 screens) | (none) | Unchanged — no filter props |

### Pilot and replication

Use **ControlLimpieza** as the reference for enabling both search and date filters:

```jsx
filtros={["busqueda", "fechas"]}
filtroConfig={{
  busqueda: {
    keys: ["tipo_instalacion", "realizado_por", "observaciones"],
    placeholder: "Buscar tipo, responsable u observaciones",
  },
}}
```

To add date filtering to another bitácora, copy the `filtros` array and ensure `campoFecha` matches the row date field if not `"fecha"`. Search-only bitácoras only need `filtros={["busqueda"]}` and `filtroConfig.busqueda.keys` / `placeholder`.

## Tests

Pure filter pipeline tests live next to the registry:

- `src/shared/components/listado/filtros/registroFiltros.test.js` (7 tests: initial values, search, dates, composition, partial apply, active detection, export footer range)

Run:

```bash
npm test -- --run src/shared/components/listado/filtros/registroFiltros.test.js
```

When adding a filter, extend this file with tests for `aplicar`, `estaActivo`, and any registry integration.

## Related files

- `src/shared/components/listado/ListadoToolbar.jsx` — filter row + export buttons
- `src/shared/components/listado/ListadoFiltros.jsx` — maps `filtros` ids to registry components
- `src/shared/components/listado/DialogExportarListado.jsx` — export date confirmation modal
- `src/shared/utils/exportarTabla.js` — `exportarTablaPDF`, `exportarTablaExcel`, `calcularRangoFechas`
