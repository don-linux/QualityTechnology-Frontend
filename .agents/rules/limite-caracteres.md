---
description: "Límite de caracteres coherente en 3 capas (DB, backend, frontend) y truncado visual en tablas."
alwaysApply: true
---

# Límite de caracteres

La idea: **el backend impone el límite real**, el frontend lo espeja para feedback inmediato, y la tabla de listado evita que textos largos rompan el layout.

## 1. Tres capas consistentes

El mismo número `N` aparece en las tres capas y se cambia en la **misma PR**:

- **DB (`db.sql`)**: la columna se declara como `varchar(N)` — fuente de verdad.
- **Backend (controller)**: valida `.length > N` en `create` y `update`, responde `400` con un mensaje claro.
- **Frontend (form)**: usa `inputProps={{ maxLength: N }}` y `helperText` con contador `x/N`.

## 2. Input con contador en el formulario

```jsx
<TextField
  name="motivo"
  value={form.motivo}
  onChange={handleChange}
  inputProps={{ maxLength: 300 }}
  helperText={`${form.motivo.length}/300`}
  // ...
/>
```

El `maxLength` actúa como tope suave (no deja escribir más) y el `helperText` muestra el contador en vivo.

## 3. Truncado visual en tablas de listado

En listados, reutiliza los helpers del [Patrón de tablas](./patron-tablas.md):

```jsx
const TRUNCAR_MAX = 40;
const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;
```

La celda envuelve el valor con `<span title={valor}>{truncar(valor)}</span>` para ver el texto completo al pasar el ratón sin que la fila se expanda:

```jsx
<TableCell sx={{ maxWidth: 160 }}>
  <span title={r.observaciones}>{truncar(r.observaciones)}</span>
</TableCell>
```

## 4. Valores actuales

| Campo              | Límite | Módulo de referencia                          |
|--------------------|-------:|-----------------------------------------------|
| `motivo`           |    300 | `control_visitas`                             |
| `observaciones`    |    500 | `control_visitas` (alineado con recepción)   |

Cuando añadas un campo de texto libre nuevo, decide su `N`, actualiza `db.sql`, la validación del controller y el `maxLength` + contador del formulario a la vez.
