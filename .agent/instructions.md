# Instrucciones para Agentes - QualityTechnology-Frontend (React)

## Información General
Este es el frontend principal del sistema QualityTechnology, construido con **React** (v19), **Material UI (MUI)** y **React Router**.

## Estructura de Directorios
- `src/index.jsx`: Punto de entrada de la aplicación.
- `src/App.jsx`: Archivo principal de rutas y configuración de layout.
- `src/components/`: Componentes de página y elementos reutilizables (ej. `Login.jsx`, `Usuarios.jsx`).
- `src/layout/`: Plantillas de diseño generales (ej. `CorporateLayout.jsx`).
- `src/utils/`: Funciones de utilidad y estilos globales (ej. `GlobalStyles.jsx`).
- `src/components/registro-operativo/`: Módulos específicos para bitácoras y registros.

## Tecnologías Clave
- **Framework**: React.
- **UI Framework**: Material UI (MUI) v7+.
- **Navegación**: React Router v7+.
- **Cliente HTTP**: Axios.
- **Gráficos**: Recharts y MUI X Charts.
- **Exportación**: jsPDF y XLSX.

## Flujo de Trabajo para el Agente
1. **Rutas**: Las rutas se definen en `src/App.jsx`. Use el `PrivateRoute` para proteger rutas que requieren autenticación.
2. **Componentes**: La mayoría de la lógica de negocio y UI se encuentra en `src/components/`. 
3. **Estilos**: Utilice los componentes de MUI (`Box`, `Button`, `Typography`, etc.) y el sistema de temas de Emotion/MUI.
4. **Formularios**: Se utiliza `FormDialog.jsx` como base para muchos formularios modales.
5. **Nuevas Funcionalidades**:
    - Crear el componente en `src/components/`.
    - Registrar la ruta en `src/App.jsx` dentro del `CorporateLayout` si requiere la barra lateral.

## Comandos Comunes
- `npm start`: Inicia el servidor de desarrollo.
- `npm run build`: Construye la aplicación para producción.
