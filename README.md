# Quality Technology Frontend

## Configuración esencial (rápida)

### 1) Comandos para correr
- Instalar dependencias: `npm install`
- Desarrollo: `npm run dev`
- Build producción: `npm run build`
- Previsualizar build: `npm start`
- Tests: `npm test`
- Lint: `npm run lint`
- Lint con corrección automática: `npm run lint:fix`

### 2) Puertos esperados
- **Frontend (Vite):** `http://localhost:3000`
- **Backend API esperado:** `http://localhost:5000` (base URL por defecto del frontend: `http://localhost:5000/api`)

> El puerto `3000` está definido en `vite.config.js`.
> La URL de API se configura con **`VITE_API_URL`** en `src/shared/lib/config.js` (valor por defecto: `http://localhost:5000/api`).

### 3) Variables de entorno
- **`VITE_API_URL`**: URL base del backend para axios (prefijo `/api` incluido en el valor por defecto).
- Archivo raíz `.env.example`: existe pero puede estar vacío; Vite carga `.env`, `.env.local`, etc. según sus reglas habituales.
- Docker dev usa:
	- `DOCKER_DEV_NAME`
	- `DOCKER_DEV_REACT_PORT`
- Docker prod usa:
	- `DOCKER_PROD_NAME`

### 4) Configuración Docker (si aplica)
- Dev: `docker compose -f docker/dev/compose.yaml up`
	- Mapea `${DOCKER_DEV_REACT_PORT}:3000`
	- Comando interno: `npm install && npm run dev`
- Prod: `docker compose -f docker/prod/compose.yaml up --build`
	- Construye con `npm ci` y `npm run build`, copia `/dist` al volumen montado (no levanta servidor web por sí solo)

### 5) Requisitos mínimos para levantar local
- Node.js 24.x + npm instalados
- Backend corriendo en `localhost:5000` (o ajustar `VITE_API_URL`)
- Puerto `3000` libre para el frontend
