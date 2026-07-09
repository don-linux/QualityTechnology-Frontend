# Comandos básicos de Prisma (referencia)

El esquema y la CLI de Prisma están en el repositorio **QualityTechnology-Backend** (`prisma/schema.prisma`). Desde el frontend solo guardamos esta guía de referencia; los comandos se ejecutan en la carpeta del backend con `DATABASE_URL` configurada (por ejemplo en `.env`).

## Antes de empezar

```bash
cd /ruta/a/QualityTechnology-Backend
# Asegúrate de que DATABASE_URL apunte a tu PostgreSQL local o de Docker
```

Instalar dependencias si hace falta; Prisma suele invocarse con `npx prisma …` o con los scripts de `package.json` del backend.

---

## Generar el cliente

Regenera `@prisma/client` tras cambiar `schema.prisma`:

```bash
npx prisma generate
```

En el backend también existe el script: `npm run prisma:generate` (o el gestor de paquetes que uses).

---

## Migraciones en desarrollo

Crea una migración a partir de cambios en el esquema y la aplica a la BD de desarrollo:

```bash
npx prisma migrate dev
```

Con nombre explícito para la migración:

```bash
npx prisma migrate dev --name descripcion_corta
```

Ver el estado de las migraciones:

```bash
npx prisma migrate status
```

---

## Migraciones en producción / CI

Aplica migraciones pendientes **sin** crear archivos nuevos ni prompts interactivos:

```bash
npx prisma migrate deploy
```

En el backend: `npm run prisma:deploy`.

---

## Borrar / reiniciar la base de datos (desarrollo)

### Opción A: `migrate reset` (recomendada para dev con historial de migraciones)

**Elimina la base de datos**, la vuelve a crear, aplica todas las migraciones y, si está configurado, ejecuta el seed:

```bash
npx prisma migrate reset
```

Pide confirmación salvo que uses `--force` (útil en scripts automatizados; úsalo con cuidado).

### Opción B: Solo empujar el esquema sin migraciones (`db push`)

Útil para prototipar; puede dejar el historial de migraciones desalineado respecto al esquema real:

```bash
npx prisma db push
```

Para forzar cambios destructivos cuando Prisma lo pida:

```bash
npx prisma db push --force-reset
```

`--force-reset` **borra** datos; usar solo en entornos descartables.

---

## Docker (volumen de Postgres)

El backend incluye un script que baja Compose y **borra volúmenes** (incluido el dato de Postgres), luego levanta de nuevo:

```bash
npm run db:reset
```

Revisa en `docker/dev/compose.yaml` y `package.json` del backend el entorno exacto (`--env-file`, etc.).

---

## Seed

Si en `package.json` del backend tienes `prisma.seed` configurado:

```bash
npx prisma db seed
```

Tras `migrate reset`, el seed suele ejecutarse automáticamente si está definido.

---

## Inspección y utilidades

| Acción | Comando |
| ------ | ------- |
| Abrir Prisma Studio (UI de datos) | `npx prisma studio` |
| Formatear `schema.prisma` | `npx prisma format` |
| Validar esquema | `npx prisma validate` |
| Introspeccionar BD existente → esquema | `npx prisma db pull` |

---

## Scripts ya definidos en el backend (resumen)

Consulta siempre `QualityTechnology-Backend/package.json` por la lista actual. Ejemplos habituales:

- `prisma:generate` → `prisma generate`
- `prisma:migrate` → `prisma migrate dev`
- `prisma:deploy` → `prisma migrate deploy`
- `prisma:studio` → `prisma studio`
- `prisma:format` → `prisma format`
- `prisma:seed` → `prisma db seed`
- `db:reset` → reinicio de Docker Compose con volúmenes

---

## Advertencias

- **`migrate reset`**, **`db push --force-reset`** y **`db:reset`** destruyen datos: no usarlos contra producción ni Bases de Datos compartidas.
- En **producción** usa `migrate deploy`, no `migrate dev` ni `db push` como flujo principal.
