// src/App.js
import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import CustomGlobalStyles from "./utils/GlobalStyles";

// Login, layout y ruta protegida (carga inmediata)
import Login from "./components/Login";
import CorporateLayout from "./layout/CorporateLayout";
import PrivateRoute from "./components/PrivateRoute";

// Pantalla bienvenida
const Inicio = lazy(() => import("./components/Inicio"));

// Catalogos
const Usuarios = lazy(() => import("./components/Usuarios"));
const Roles = lazy(() => import("./components/Roles"));
const Cliente = lazy(() => import("./components/Cliente"));
const Estado = lazy(() => import("./components/Estado"));

// Inventarios
const Pileta = lazy(() => import("./components/Pileta"));
const Instalaciones = lazy(() => import("./components/Instalaciones"));
const Reproductores = lazy(() => import("./components/Reproductores"));
const Alimentos = lazy(() => import("./components/Alimentos"));
const Engorda = lazy(() => import("./components/Engorda"));
const Equipos = lazy(() => import("./components/Equipos"));
const LotesRegistro = lazy(() => import("./components/LotesRegistro"));

// Ventas
const Venta = lazy(() => import("./components/Venta"));
const FlujoCaja = lazy(() => import("./components/FlujoCaja"));
const ListaEspera = lazy(() => import("./components/ListaEspera"));
const TesoreriaGeneral = lazy(() => import("./components/TesoreriaGeneral"));

// Registro Operativos
const BitacoraPlagas = lazy(() => import("./components/registro-operativo/BitacoraPlagas"));
const BitacoraRecepcionInsumos = lazy(() => import("./components/registro-operativo/BitacoraRecepcionInsumos"));
const BitacoraVisitas = lazy(() => import("./components/registro-operativo/BitacoraVisitas"));
const BitacoraBanos = lazy(() => import("./components/registro-operativo/BitacoraBanos"));
const BitacoraParametros = lazy(() => import("./components/registro-operativo/BitacoraParametros"));
const BitacoraMedicamentos = lazy(() => import("./components/registro-operativo/BitacoraMedicamentos"));
const BitacoraRecambios = lazy(() => import("./components/registro-operativo/BitacoraRecambios"));
const BitacoraInventario = lazy(() => import("./components/registro-operativo/BitacoraInventario"));
const BioBiometrias = lazy(() => import("./components/registro-operativo/BioBiometrias"));
const BioAlimentacion = lazy(() => import("./components/registro-operativo/BioAlimentacion"));
const BioInsumos = lazy(() => import("./components/registro-operativo/BioInsumos"));

// RRHH
const Expedientes = lazy(() => import("./components/Expedientes"));
const Nomina = lazy(() => import("./components/Nomina"));
const Vacaciones = lazy(() => import("./components/Vacaciones"));
const CajaAhorro = lazy(() => import("./components/CajaAhorro"));
const Proveedores = lazy(() => import("./components/Proveedores"));

// Seguridad
const RolesModulos = lazy(() => import("./components/ModulosPorRol"));

const LazyFallback = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
    <CircularProgress />
  </Box>
);


function App() {
  return (
    <Router>
      <CssBaseline />
      <CustomGlobalStyles />
      <Suspense fallback={<LazyFallback />}>
      <Routes>
        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/*  RUTAS PROTEGIDAS */}
        <Route
          element={
            <PrivateRoute />
          }
        >
          {/* LAYOUT GENERAL */}
          <Route element={<CorporateLayout />}>
            {/* PANTALLA DE INICIO */}
            <Route index element={<Inicio />} />

            {/* REGISTRO OPERATIVO */}
            
          </Route>
        </Route>

        <Route element={<PrivateRoute modulo="Operaciones" />}>
          <Route element={<CorporateLayout />}>
              {/* BITACORAS */}
              <Route path="registro-operativo">
                <Route path="plagas" element={<BitacoraPlagas />} />
                <Route path="recepcion-insumos" element={<BitacoraRecepcionInsumos />} />
                <Route path="visitas" element={<BitacoraVisitas />} />
                <Route path="limpieza-banos" element={<BitacoraBanos />} />
                <Route path="parametros" element={<BitacoraParametros />} />
                <Route path="medicamentos" element={<BitacoraMedicamentos />} />
                <Route path="recambios" element={<BitacoraRecambios />} />
                <Route path="inventario" element={<BitacoraInventario />} />
                <Route path="biometrias" element={<BioBiometrias />} />
                <Route path="alimentacion" element={<BioAlimentacion />} />
                <Route path="insumos" element={<BioInsumos />} />
              </Route>
          </Route>
        </Route>
        
        <Route element={<PrivateRoute modulo="Finanzas" />}>
          <Route element={<CorporateLayout />}>
              {/* Finanzas} */}
              <Route path="ventas/tesoreria" element={<TesoreriaGeneral />} />
              <Route path="ventas/flujo-caja" element={<FlujoCaja />} />
              <Route path="/proveedores" element={<Proveedores />} />   
          </Route>
        </Route>

        <Route element={<PrivateRoute modulo="RRHH" />}>
          <Route element={<CorporateLayout />}>
              {/* RRHH */}
              <Route path="expedientes" element={<Expedientes />} />
              <Route path="nomina" element={<Nomina />} />
              <Route path="vacaciones" element={<Vacaciones />} />
              <Route path="/caja-ahorro" element={<CajaAhorro />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute modulo="Catálogos" />}>
          <Route element={<CorporateLayout />}>
            {/* CATÁLOGOS */}
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="roles" element={<Roles />} />
            <Route path="estados" element={<Estado />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute modulo="Inventarios" />}>
          <Route element={<CorporateLayout />}>
            <Route path="inventarios/piletas" element={<Pileta />} />
            <Route path="inventarios/instalaciones" element={<Instalaciones />} />
            <Route path="inventarios/reproductores" element={<Reproductores />} />
            <Route path="inventarios/alimentos" element={<Alimentos />} />
            <Route path="inventarios/engorda" element={<Engorda />} />
            <Route path="inventarios/lotes" element={<LotesRegistro />} />
            <Route path="inventarios/registro-operativo" element={<Equipos />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute modulo="Ventas" />}>
          <Route element={<CorporateLayout />}>
            {/* VENTAS */}
            <Route path="ventas/registro" element={<Venta />} />
            <Route path="registro/cliente" element={<Cliente />} />
            <Route path="ventas/lista-espera" element={<ListaEspera />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute modulo="Seguridad" />}>
          <Route element={<CorporateLayout />}>
            <Route path="seguridad/roles-modulos" element={<RolesModulos />} />
          </Route>
        </Route>

        {/* CUALQUIER RUTA DESCONOCIDA */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
