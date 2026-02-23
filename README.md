# Quality Technology Frontend

## Configuración esencial (rápida)

### 1) Comandos para correr
- Instalar dependencias: `npm install`
- Desarrollo: `npm start`
- Build producción: `npm run build`
- Previsualizar build: `npm run preview`
- Tests: `npm test`

### 2) Puertos esperados
- **Frontend (Vite):** `http://localhost:3000`
- **Backend API esperado:** `http://localhost:5000`

> El puerto `3000` está definido en `vite.config.js`.
> El backend `5000` está hardcodeado en el frontend (múltiples llamadas API y `src/utils/api.js`).

### 3) Variables de entorno
Actualmente, el frontend **no usa** variables `VITE_*` para la URL de API.

- Archivo raíz `.env.example`: existe pero está vacío.
- Docker dev usa:
	- `DOCKER_DEV_NAME`
	- `DOCKER_DEV_REACT_PORT`
- Docker prod usa:
	- `DOCKER_PROD_NAME`

### 4) Configuración Docker (si aplica)
- Dev: `docker-compose -f docker/dev/compose.yaml up`
	- Mapea `${DOCKER_DEV_REACT_PORT}:3000`
- Prod: `docker-compose -f docker/prod/compose.yaml up`
	- Construye y copia `/dist` (no levanta servidor web por sí solo)

### 5) Requisitos mínimos para levantar local
- Node.js + npm instalados
- Backend corriendo en `localhost:5000`
- Puerto `3000` libre para el frontend
