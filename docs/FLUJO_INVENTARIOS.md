# Flujo para llenar los módulos de Inventarios

Guía paso a paso del orden correcto para capturar datos en el módulo **Inventarios** del sistema, respetando las dependencias reales entre componentes del frontend y los endpoints del backend.

> Cada módulo depende de datos previamente creados en otro. Llenarlos fuera de orden causa que los selectores aparezcan vacíos y los registros no se puedan guardar.

## 1. Mapa de dependencias

El módulo **Instalaciones** se retiró de la app: la **infraestructura base** es una sola pantalla, **Infraestructura física** (modelo `InfraestructuraFisica`), donde defines cada estanque con su **etapa** (`alevinaje`, `reproductores`, `engorda`). Todo lo demás cuelga de esas infraestructuras físicas creadas en la sede/granja activa.

```
┌────────────────────────────┐
│   Infraestructura física   │  ← BASE. CRUD modelo `InfraestructuraFisica`
│   (etapa: Alev / Rep / Eng) │     (nombre, dimensiones, material, estado…)
└─────────────┬──────────────┘
              │
     ┌────────┼─────────────────────────┬──────────────────┐
     ▼        ▼                         ▼                  ▼
┌──────────────┐  ┌──────────────────────────┐   ┌──────────────┐
│ Reproductores│  │   Lotes (control repro.) │   │   Equipos    │
│ infraestruct.│  │  (tras reproductores;    │   │ (indepen-    │
│ tipo         │  │   selector API legacy)   │   │  diente)     │
│ reproductores│  │                          │   │              │
└──────┬───────┘  └────────────┬─────────────┘   └──────────────┘
       │                       │
       └───────────┬───────────┘
                   │
                   │ (siembra opcional → ver Alevinaje)
                   ▼
          ┌────────────────────────┐
          │  Registros Alevinaje   │  ← Tabla `alevinaje`; solo infraestructuras
          │  (infraestructuras     │     físicas etapa `alevinaje`
          │   etapa alevinaje)     │
          └───────────┬────────────┘
                      ▼
          ┌────────────────────────┐
          │    Engorda             │  ← infraestructura física destino etapa engorda;
          │                        │     origen opcional = otra infraestructura física
          └────────────────────────┘
```

## 2. Orden correcto de captura

| # | Módulo | Ruta | Depende de |
|---|---|---|---|
| 1 | Infraestructura física | `/inventarios/infraestructura-fisica` | — Crear aquí las infraestructuras físicas por **etapa** que vayas a usar (*Alevinaje*, *Reproductores*, *Engorda*). |
| 2 | Reproductores | `/inventarios/reproductores` | Al menos una infraestructura física **etapa *Reproductores*** en la sede activa (`listInfraestructuraFisica` filtra por tipo). |
| 3 | Lotes | `/inventarios/lotes` | Reproductores registrados (el selector usa `GET /lotes/instalaciones/:granja`; nombre legacy, origen = circuito reproductivo). |
| 4 | Alevinaje | `/inventarios/alevinaje` | Paso 1: al menos una infraestructura física **etapa *Alevinaje***. Opcional: vincular a **siembra de ingreso** si existen siembras con destino en esa infraestructura física (`GET /siembras`). |
| 5 | Engorda | `/inventarios/engorda` | Al menos una infraestructura física **etapa *Engorda***; **origen** opcional (`infraestructura_fisica_origen_id`) vía `listInfraestructuraFisica`. |
| 6 | Equipos | `/inventarios/equipos` | Independiente (cualquier momento) |

**Antes de empezar:** elige siempre la **granja activa** (`Medellín` o `La Ceiba`) con los botones del encabezado. Cada granja tiene su propio inventario aislado.

---

## 3. Paso 1 — Infraestructura física (base)

**Ruta:** `/inventarios/infraestructura-fisica` (menú **Infraestructura Física**).

**Página:** `src/pages/inventarios/InfraestructuraFisicaPage.jsx`

**Componente:** `src/features/inventarios/components/InfraestructuraFisica.jsx`

**Servicio:** `src/features/inventarios/services/infraestructuraFisicaService.js`

![Módulo Infraestructura física](./images/inventarios/01-infraestructura-fisica.png)

### Qué representa
Sustituye al antiguo módulo **Instalaciones** (ya no hay ruta `/inventarios/instalaciones`). Aquí registras cada **estanque real** como fila del modelo **`InfraestructuraFisica`**: nombre, dimensiones (largo / ancho / alto → volumen), material, estado (`vacia` | `ocupada`) y **etapa** (`alevinaje` | `reproductores` | `engorda`). Sin infraestructuras físicas creadas, los selectores de **Reproductores**, **Alevinaje**, **Engorda** y otros quedan vacíos.

### Pasos
1. Elegir **sede/granja** en el encabezado (`useUbicacionesGranja`).
2. Ir a **Infraestructura Física** y **`Nueva instalación`**.
3. Completar el formulario y elegir la **etapa** acorde a lo que necesitas después:
   - **Reproductores** — para el módulo Reproductores y la cadena de Lotes.
   - **Alevinaje** — para registrar en el módulo **Alevinaje**.
   - **Engorda** — para movimientos de engorda.
4. **REGISTRAR**. Repite por cada unidad física.

### Qué habilita
- **Etapa reproductores** → aparece en *Infraestructura física destino* y en el circuito que alimenta el selector de **Lotes** (vía reproductores registrados).
- **Etapa alevinaje** → alimenta el módulo **Alevinaje**.
- **Etapa engorda** → selectores de **Engorda**.

### Errores frecuentes
- Crear la infraestructura física con **etapa incorrecta** para el módulo siguiente → no aparecerá en el filtro correspondiente.
- Confundir **crear la infraestructura física** (este paso) con **registrar alevinaje** (paso 4): el alevinaje es otro modelo (`alevinaje`), enlazado a una infraestructura física ya existente.

---

## 4. Paso 2 — Reproductores

**Ruta:** `/inventarios/reproductores`
**Archivo:** `src/features/inventarios/components/Reproductores.jsx`
**Servicio:** `src/features/inventarios/services/reproductoresService.js`

![Módulo Reproductores](./images/inventarios/02-reproductores.png)

### Qué representa
Los peces reproductores (machos y hembras) asociados a **infraestructuras físicas etapa *Reproductores***. Generan los huevos que derivan en los lotes.

### Prerrequisito
Al menos una **infraestructura física etapa `reproductores`** en la sede activa (paso 1).

### Pasos
1. Elegir la granja.
2. Click en **`+ NUEVO REGISTRO`**.
3. Llenar el formulario:
   - `Origen`: `Interno` (elegir **Infraestructura física origen** del listado `listInfraestructuraFisica`) o `Externo` (texto de procedencia).
   - `Infraestructura física destino` — solo infraestructuras físicas **tipo reproductores**; define línea/familia operativa de esa unidad.
   - `Machos`, `Hembras` → el sistema calcula automáticamente `Cantidad` y `Ratio`.
   - `Talla (gr)`, `Línea`, `Familia`, `Observación`.
   - `Fecha siembra`, `Última biometría`.
4. Click en **REGISTRAR**.

### Qué habilita
- El vínculo reproductor–infraestructura física deja constancia de **familia** para el flujo de **Lotes** (`GET /lotes/instalaciones/:granja` lista orígenes con reproductores; el formulario de lotes aún puede mostrar el campo como *Instalación* por compatibilidad con el payload `instalacion_id`).

### Errores frecuentes
- Dejar `Origen = Interno` sin elegir **Infraestructura física origen**: validación en cliente.
- `Origen = Externo` con texto vacío: misma validación.
- No haber creado infraestructuras físicas **reproductores** en el paso 1: los desplegables de infraestructura física quedan vacíos.

---

## 5. Paso 3 — Lotes

**Ruta:** `/inventarios/lotes`
**Archivo:** `src/features/inventarios/components/LotesRegistro.jsx`
**Servicio:** `src/features/inventarios/services/lotesService.js`

![Módulo Lotes](./images/inventarios/03-lotes.png)

### Qué representa
Cada lote es una **camada** producida por los reproductores: número de lote, ovadas, cantidad de huevos por ml, alevines disponibles y mortalidad.

### Prerrequisito
Al menos un **reproductor** registrado; el listado del selector proviene de `listInstalaciones(granja)` (nombre heredado del API; son **orígenes del circuito reproductivo** vinculados a reproductores).

### Pasos
1. Elegir la granja.
2. Llenar el formulario:
   - `Fecha` del lote.
   - `Instalación` — selector legacy; elige el origen asociado a reproductores. Al elegirlo, el campo `Familia` se **autocompleta** (vía `getFamiliaPorInstalacion`).
   - `Huevos (ml)`, `Ovadas`.
   - `No. Lote` — solo letras, números y guion (se convierte a mayúsculas). Ej: `L-001`.
   - `Observación`.
3. Click en **Registrar Lote**.

### Qué habilita
- Los lotes quedan asociados al **origen reproductivo** elegido (payload/API siguen usando término *instalación*) y a la **familia**; son la base del ciclo de huevos/alevines en ese circuito. El **Alevinaje** (paso 4) **no** usa este listado: allí el lote es **texto libre**. En **Engorda**, el origen es una **infraestructura física** (`infraestructura_fisica_origen_id`), no el listado de lotes de este módulo.

### Campos ocultos al crear (se llenan más adelante)
- `mortalidad` se inicia en `0`.
- `alevines_inicial` se puede capturar al registrar o ajustarse después editando el lote.

### Errores frecuentes
- Si la instalación seleccionada no tiene familia asociada, `Familia` se queda vacía y no pasa la validación.
- Usar caracteres inválidos en `No. Lote` (espacios, símbolos) — el input los bloquea pero la validación se dispara.

---

## 6. Paso 4 — Alevinaje (registros operativos)

**Ruta:** `/inventarios/alevinaje` — menú **Alevinaje**.

**Página:** `src/pages/inventarios/AlevinajePage.jsx`

**Componente:** `src/features/inventarios/components/Alevinaje.jsx`

**Servicios:** `infraestructuraFisicaService.js`, `alevinajeService.js`

![Módulo Alevinaje](./images/inventarios/04-alevinaje.png)

### Qué representa

Registros del modelo **`alevinaje`**: qué **infraestructura física** (solo etapa `alevinaje`), **lote** (texto libre), fechas, huevos/ml, ovadas, **alevines iniciales**, mortalidad y observación (hasta 500 caracteres). Las **infraestructuras físicas** donde ocurre esto debieron crearse en el **paso 1**, con **etapa Alevinaje**.

### Orden dentro de este módulo

1. Sede/granja en el encabezado.
2. Si aún no existe: en **Infraestructura física** (paso 1) crear infraestructuras físicas **etapa Alevinaje**.
3. **`Nuevo registro`**: elegir infraestructura física, lote y cantidades.

### Pestaña «Siembra de ingreso» (opcional)

Tras elegir **infraestructura física**, el combo enlaza con `GET /siembras` filtrando `infraestructura_fisica_destino`. Si no hay siembras, puede quedar **Sin vincular**; no es obligatorio para guardar.

### Qué habilita aguas abajo

- Registros de alevinaje alimentan trazabilidad.

### Reglas y errores frecuentes

- Obligatorios en formulario: **infraestructura física**, **lote**, **alevines iniciales**, **fecha**.
- **Eliminar** una infraestructura física puede fallar por integridad referencial en el backend.
- El **código de lote** aquí es texto; no es el mismo concepto que el **Lote** del paso 3 (`/inventarios/lotes`).

---

## 7. Paso 5 — Engorda

**Ruta:** `/inventarios/engorda`
**Archivo:** `src/features/inventarios/components/Engorda.jsx`
**Servicio:** `src/features/inventarios/services/engordaService.js`

![Módulo Engorda](./images/inventarios/05-engorda.png)

### Qué representa
El registro de organismos en **infraestructuras físicas tipo engorda**, con **infraestructura física origen** opcional para trazabilidad (típicamente desde alevinaje u otra etapa). La pantalla no usa el catálogo de instalaciones ni el selector de lotes del módulo Lotes.

### Prerrequisito
- Al menos una infraestructura física **tipo `engorda`** y otra infraestructura física (cualquier tipo) como **origen** opcional en la sede activa; los selectores usan `listInfraestructuraFisica` con filtro de ubicación/granja.

### Pasos
1. Elegir la granja/sede.
2. Click en **`+ NUEVO REGISTRO`**.
3. Llenar:
   - `Infraestructura física origen (opcional)` — cualquier infraestructura física de la granja si aplica trazabilidad.
   - `Infraestructura física destino (engorda)` — solo infraestructuras físicas tipo engorda.
   - `Cantidad`, `Talla (Gr)`, `Observación`.
4. Click en **Registrar** (`createEngorda`).

### Qué habilita
- Genera un movimiento en la **trazabilidad** (historial de movimientos abajo en la misma pantalla).

### Errores frecuentes
- Cantidad u operación inválida según reglas del backend (stock, integridad, etc.): revisar el mensaje de error del API.
- Olvidar seleccionar **infraestructura física destino** tipo engorda u omitir campos obligatorios (`cantidad`, `talla_gr`, `observacion`).

---

## 8. Paso 6 — Equipos (independiente)

**Ruta:** `/inventarios/equipos`
**Archivo:** `src/features/inventarios/components/Equipos.jsx`
**Servicio:** `src/features/inventarios/services/equiposService.js`

![Módulo Equipos](./images/inventarios/07-equipos.png)

### Qué representa
Inventario de **equipos y herramientas** del usuario logueado (bombas, redes, sensores, etc.) con su historial de mantenimientos.

### Particularidades
- No depende de granja: se carga por `usuario_id` (`listEquipos(usuario_id)`).
- Se puede registrar en cualquier momento, sin orden previo.

### Pasos
1. Llenar el formulario con los campos marcados como obligatorios:
   - Identificación: `Nombre`, `Marca`, `Modelo`, `Tipo`.
   - Compra: `Fecha Compra`, `Costo`.
   - Estado: `Estado` (`Operativo` | `En mantenimiento` | `Dañado`).
   - Ubicación: `Ubicación`, `Responsable`.
   - Mantenimiento: `Próximo Mantenimiento`, `Notas`.
2. Click en **Guardar**.
3. Desde la tabla, el botón con ícono de herramienta abre el diálogo de **Mantenimientos**, donde se registra cada visita (`Fecha`, `Tipo`, `Responsable`, `Descripción`, `Costo`, `Estado posterior`, `Próximo mantenimiento`).

### Extras
- **Exportar PDF**: genera un PDF con logo dinámico según el nombre del usuario (`medellin`, `ceiba`, default `quality`).

---

## 10. Resumen rápido (checklist)

Para llenar los inventarios **desde cero en una granja nueva**, sigue este checklist sin saltarte pasos:

- [ ] **1. Infraestructura física** — crear las infraestructuras físicas necesarias por **etapa** (*Alevinaje*, *Reproductores*, *Engorda*) en `/inventarios/infraestructura-fisica`.
- [ ] **2. Reproductores** — asignar reproductores a infraestructuras físicas **etapa reproductores**.
- [ ] **3. Lotes** — control reproductivo; la familia se autocompleta desde el selector (API legacy `instalaciones`).
- [ ] **4. Alevinaje** — registros en `/inventarios/alevinaje` sobre infraestructuras físicas **etapa alevinaje**; siembra de ingreso opcional.
- [ ] **5. Engorda** — registros en infraestructuras físicas **etapa engorda**, con infraestructura física origen opcional.
- [ ] **6. Equipos** — cuando haga falta, sin orden forzado.

## 11. Punto clave sobre granjas

Todos los módulos filtran por `granja` usando los textos exactos:

- `Granja Acuícola Medellin`
- `Granja Acuícola La Ceiba`

Si no ves datos que sabes que existen, lo primero a revisar es que el botón de granja activa del componente coincida con el `granja` de la tabla en la BD. Algunos componentes normalizan el texto (quitando acentos/minúsculas) antes de mandarlo al backend; otros lo mandan tal cual. Verificar ambos lados ante cualquier inconsistencia.

## 12. Archivos de referencia rápida

| Capa | Archivos relevantes |
|---|---|
| Rutas | `src/app/router.jsx` (sección *Inventarios*) |
| Páginas | `src/pages/inventarios/*.jsx` |
| Componentes | `src/features/inventarios/components/*.jsx` |
| Servicios HTTP | `src/features/inventarios/services/*.js` |
| Axios base | `src/shared/lib/axiosInstance.js` |
| Hooks compartidos | `src/shared/hooks/useFormValidation.js`, `useConfirm.js`, `useSnackbar.jsx` |

## 13. Regenerar capturas

Las capturas viven en `docs/images/inventarios/`. Convención sugerida: `01-infraestructura-fisica.png` … `06-equipos.png` (el antiguo `01-instalaciones.png` ya no aplica: no existe la ruta de Instalaciones). Fueron tomadas con una sesión logueada sobre `http://localhost:3000`, viewport `1440×900`, `deviceScaleFactor: 1.25`, en `fullPage`.

Si cambia la UI y hay que actualizarlas, se puede hacer con Playwright siguiendo estos pasos:

```bash
mkdir -p /tmp/inv-screenshots && cd /tmp/inv-screenshots
bun init -y && bun add -d playwright && bunx playwright install chromium
```

Crear `capture.mjs` con el siguiente contenido (mismo script que se usó originalmente):

```javascript
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.APP_URL || "http://localhost:3000";
const USER = process.env.APP_USER;
const PASS = process.env.APP_PASS;
const OUT = process.env.OUT_DIR;

mkdirSync(OUT, { recursive: true });

const routes = [
  { slug: "01-infraestructura-fisica", path: "/inventarios/infraestructura-fisica" },
  { slug: "02-reproductores", path: "/inventarios/reproductores" },
  { slug: "03-lotes", path: "/inventarios/lotes" },
  { slug: "04-alevinaje", path: "/inventarios/alevinaje" },
  { slug: "05-engorda", path: "/inventarios/engorda" },
  { slug: "06-equipos", path: "/inventarios/equipos" },
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1.25,
});
const page = await context.newPage();

await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.getByRole("textbox", { name: /usuario/i }).fill(USER);
await page.locator('input[type="password"]').fill(PASS);
await page.getByRole("button", { name: /acceder/i }).click();
await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 15000 });

for (const r of routes) {
  await page.goto(`${BASE}${r.path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${r.slug}.png`, fullPage: true });
}

await browser.close();
```

Ejecutar:

```bash
APP_USER='tu_usuario' \
APP_PASS='tu_password' \
OUT_DIR='/ruta/absoluta/a/QualityTechnology-Frontend/docs/images/inventarios' \
bun capture.mjs
```

> El dev server del frontend debe estar corriendo (`bun run dev`) y el usuario debe tener acceso al módulo `Inventarios`. Usa credenciales de **pruebas**, nunca de producción.
