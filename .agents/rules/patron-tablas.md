---
description: "Patrón de diseño para tablas MUI: contenedor con scroll horizontal, truncado de texto, columna Acciones y acordeones."
alwaysApply: true
---

# Patrón de tablas MUI

Cuando construyas un listado en tabla (MUI `Table`), sigue esta plantilla para que funcione bien en pantallas estrechas y con textos largos. Ejemplo canónico: `src/features/registro-operativo/components/BitacoraVisitas.jsx`.

## 1. Contenedor y scroll horizontal

- Envuelve la tabla en `Paper` con `sx={{ width: "100%" }}` para usar todo el ancho sin desbordar el layout.
- Dentro, usa `TableContainer` con `sx={{ width: "100%", overflowX: "auto" }}` para que en pantallas estrechas la tabla haga scroll horizontal en vez de romper el diseño.
- Sobre `Table`, fija un `minWidth` razonable según columnas (típicamente entre `960` y `1350`) para que el scroll tenga sentido y las columnas no se compriman demasiado.

```jsx
<Paper sx={{ width: "100%" }}>
  <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
    <Table sx={{ minWidth: 1180 }}>
      {/* ... */}
    </Table>
  </TableContainer>
</Paper>
```

## 2. Texto largo en celdas

Declara helpers locales al componente:

```jsx
const TRUNCAR_MAX = 40;
const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;
```

En celdas con texto variable (motivo, observaciones, descripciones, nombres), fija un `maxWidth` y usa `title` para ver el valor completo al pasar el ratón:

```jsx
<TableCell sx={{ maxWidth: 160 }}>
  <span title={r.fc_observaciones}>{truncar(r.fc_observaciones)}</span>
</TableCell>
```

## 3. Columna "Acciones"

Cabecera (alineación centrada y ancho mínimo):

```jsx
<TableCell align="center" sx={{ minWidth: 180, whiteSpace: "nowrap" }}>Acciones</TableCell>
```

Sube el `minWidth` cuando haya más botones (p. ej. `260` con Ver + Editar + Eliminar, como en `BitacoraPlagas.jsx`).

Cuerpo (misma alineación + `verticalAlign: "middle"`, botones agrupados en un `Box`):

```jsx
<TableCell
  align="center"
  sx={{ minWidth: 180, verticalAlign: "middle", whiteSpace: "nowrap" }}
>
  <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 1, flexWrap: "nowrap" }}>
    {/* botones */}
  </Box>
</TableCell>
```

No uses `mr` / `ml` entre botones: la separación la da `gap`.

## 4. Tablas dentro de acordeones

Cuando la tabla vive dentro de un `Accordion`, usa `AccordionDetails` con `sx={{ p: 0 }}` para que el `Paper` / `TableContainer` llegue al borde sin padding extra (ver `BitacoraMedicamentos.jsx`, `BioBiometrias.jsx`).

```jsx
<AccordionDetails sx={{ p: 0 }}>
  <Paper sx={{ width: "100%" }}>
    {/* TableContainer + Table */}
  </Paper>
</AccordionDetails>
```
