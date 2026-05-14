import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

import Login from "@features/auth/components/Login";
import CorporateLayout from "@shared/layout/CorporateLayout";
import PrivateRoute from "@shared/guards/PrivateRoute";

const Inicio = lazy(() => import("@pages/inicio/InicioPage"));

// Catalogos
const Usuarios = lazy(() => import("@pages/catalogos/UsuariosPage"));
const Roles = lazy(() => import("@pages/catalogos/RolesPage"));
const Cliente = lazy(() => import("@pages/catalogos/ClientePage"));
const Puestos = lazy(() => import("@pages/catalogos/PuestosPage"));
const Departamentos = lazy(() => import("@pages/catalogos/DepartamentosPage"));
const UnidadesNegocio = lazy(() => import("@pages/catalogos/UnidadesNegocioPage"));
const Ubicaciones = lazy(() => import("@pages/catalogos/UbicacionesPage"));

// Inventarios
const PiletasFisicas = lazy(() => import("@pages/inventarios/PiletasFisicasPage"));
const Reproductores = lazy(() => import("@pages/inventarios/ReproductoresPage"));
const Alimentos = lazy(() => import("@pages/inventarios/AlimentosPage"));
const Engorda = lazy(() => import("@pages/inventarios/EngordaPage"));
const Equipos = lazy(() => import("@pages/inventarios/EquiposPage"));
const ControlReproductivo = lazy(() => import("@pages/inventarios/ControlReproductivoPage"));

// Ventas + Finanzas
const Venta = lazy(() => import("@pages/ventas/VentaPage"));
const FlujoCaja = lazy(() => import("@pages/ventas/FlujoCajaPage"));
const ListaEspera = lazy(() => import("@pages/ventas/ListaEsperaPage"));
const TesoreriaGeneral = lazy(() => import("@pages/ventas/TesoreriaGeneralPage"));
const Cuentas = lazy(() => import("@pages/catalogos/CuentasPage"));

// Registro Operativo
const BitacoraPlagas = lazy(() => import("@pages/registro-operativo/BitacoraPlagasPage"));
const BitacoraRecepcionInsumos = lazy(() => import("@pages/registro-operativo/BitacoraRecepcionInsumosPage"));
const BitacoraVisitas = lazy(() => import("@pages/registro-operativo/BitacoraVisitasPage"));
const BitacoraBanos = lazy(() => import("@pages/registro-operativo/BitacoraBanosPage"));
const BitacoraParametros = lazy(() => import("@pages/registro-operativo/BitacoraParametrosPage"));
const BitacoraMedicamentos = lazy(() => import("@pages/registro-operativo/BitacoraMedicamentosPage"));
const BitacoraRecambios = lazy(() => import("@pages/registro-operativo/BitacoraRecambiosPage"));
const BitacoraInventario = lazy(() => import("@pages/registro-operativo/BitacoraInventarioPage"));
const BioBiometrias = lazy(() => import("@pages/registro-operativo/BioBiometriasPage"));
const BioAlimentacion = lazy(() => import("@pages/registro-operativo/BioAlimentacionPage"));
const BioInsumos = lazy(() => import("@pages/registro-operativo/BioInsumosPage"));

// RRHH
const Empleados = lazy(() => import("@pages/rrhh/EmpleadosPage"));
const MiPerfil = lazy(() => import("@pages/perfil/MiPerfilPage"));
const Nomina = lazy(() => import("@pages/rrhh/NominaPage"));
const Vacaciones = lazy(() => import("@pages/rrhh/VacacionesPage"));
const CajaAhorro = lazy(() => import("@pages/rrhh/CajaAhorroPage"));
const Proveedores = lazy(() => import("@pages/rrhh/ProveedoresPage"));

// Seguridad
const RolesModulos = lazy(() => import("@pages/seguridad/ModulosPorRolPage"));
const SinAcceso = lazy(() => import("@pages/SinAccesoPage"));

const LazyFallback = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
    <CircularProgress />
  </Box>
);

export default function AppRouter() {
  return (
    <Suspense fallback={<LazyFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route element={<CorporateLayout />}>
            <Route index element={<Inicio />} />
            <Route path="mi-perfil" element={<MiPerfil />} />
            <Route path="sin-acceso" element={<SinAcceso />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute modulo="Operaciones" />}>
          <Route element={<CorporateLayout />}>
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
            <Route path="ventas/tesoreria" element={<TesoreriaGeneral />} />
            <Route path="ventas/flujo-caja" element={<FlujoCaja />} />
            <Route path="proveedores" element={<Proveedores />} />
            <Route path="cuentas" element={<Cuentas />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute modulo="RRHH" />}>
          <Route element={<CorporateLayout />}>
            <Route path="empleados" element={<Empleados />} />
            <Route path="nomina" element={<Nomina />} />
            <Route path="vacaciones" element={<Vacaciones />} />
            <Route path="caja-ahorro" element={<CajaAhorro />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute modulo="Catálogos" />}>
          <Route element={<CorporateLayout />}>
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="roles" element={<Roles />} />
            <Route path="puestos" element={<Puestos />} />
            <Route path="departamentos" element={<Departamentos />} />
            <Route path="unidades-negocio" element={<UnidadesNegocio />} />
            <Route path="ubicaciones" element={<Ubicaciones />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute modulo="Inventarios" />}>
          <Route element={<CorporateLayout />}>
            <Route path="inventarios/piletas" element={<Navigate to="/inventarios/piletas-fisicas" replace />} />
            <Route path="inventarios/piletas-fisicas" element={<PiletasFisicas />} />
            <Route path="inventarios/reproductores" element={<Reproductores />} />
            <Route path="inventarios/alimentos" element={<Alimentos />} />
            <Route path="inventarios/engorda" element={<Engorda />} />
            <Route path="inventarios/lotes" element={<Navigate to="/inventarios/alevinaje" replace />} />
            <Route path="inventarios/alevinaje" element={<ControlReproductivo />} />
            <Route path="inventarios/equipos" element={<Equipos />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute modulo="Ventas" />}>
          <Route element={<CorporateLayout />}>
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

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Suspense>
  );
}
