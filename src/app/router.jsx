import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

import Login from "@features/auth/components/Login";
import AppLayout from "@shared/layout/AppLayout";
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
const TiposPileta = lazy(() => import("@pages/catalogos/TiposPiletaPage"));
const AreasInstalacion = lazy(() => import("@pages/catalogos/AreasInstalacionPage"));
const FaunasDetectadas = lazy(() => import("@pages/catalogos/FaunasDetectadasPage"));
const EvidenciasFauna = lazy(() => import("@pages/catalogos/EvidenciasFaunaPage"));
const EstadosTrampa = lazy(() => import("@pages/catalogos/EstadosTrampaPage"));
const AccionesCorrectivas = lazy(() => import("@pages/catalogos/AccionesCorrectivasPage"));
const Insumos = lazy(() => import("@pages/catalogos/InsumosPage"));

// Inventarios
const PiletasFisicas = lazy(() => import("@pages/inventarios/PiletasFisicasPage"));
const Reproductores = lazy(() => import("@pages/inventarios/ReproductoresPage"));
const Engorda = lazy(() => import("@pages/inventarios/EngordaPage"));
const Equipos = lazy(() => import("@pages/inventarios/EquiposPage"));
const Alevinaje = lazy(() => import("@pages/inventarios/AlevinajePage"));
const EficienciaReproductiva = lazy(() => import("@pages/inventarios/EficienciaReproductivaPage"));
const CiclosEngorda = lazy(() => import("@pages/inventarios/CiclosEngordaPage"));
const Trazabilidad = lazy(() => import("@pages/inventarios/TrazabilidadPage"));

// Ventas + Finanzas
const Venta = lazy(() => import("@pages/ventas/VentaPage"));
const FlujoCaja = lazy(() => import("@pages/ventas/FlujoCajaPage"));
const ListaEspera = lazy(() => import("@pages/ventas/ListaEsperaPage"));
const TesoreriaGeneral = lazy(() => import("@pages/ventas/TesoreriaGeneralPage"));
const Cuentas = lazy(() => import("@pages/catalogos/CuentasPage"));

// Bitácoras
const ControlFaunaNociva = lazy(() => import("@pages/bitacoras/ControlFaunaNocivaPage"));
const BitacoraRecepcionInsumos = lazy(() => import("@pages/bitacoras/BitacoraRecepcionInsumosPage"));
const ControlVisitas = lazy(() => import("@pages/bitacoras/ControlVisitasPage"));
const ControlLimpieza = lazy(() => import("@pages/bitacoras/ControlLimpiezaPage"));
const ParametrosFisicoQuimicos = lazy(() => import("@pages/bitacoras/ParametrosFisicoQuimicosPage"));
const BitacoraMedicamentos = lazy(() => import("@pages/bitacoras/BitacoraMedicamentosPage"));
const BitacoraRecambios = lazy(() => import("@pages/bitacoras/BitacoraRecambiosPage"));
const BitacoraInventario = lazy(() => import("@pages/bitacoras/BitacoraInventarioPage"));
const BioBiometrias = lazy(() => import("@pages/bitacoras/BioBiometriasPage"));
const BioAlimentacion = lazy(() => import("@pages/bitacoras/BioAlimentacionPage"));

// RRHH
const Empleados = lazy(() => import("@pages/rrhh/EmpleadosPage"));
const MiPerfil = lazy(() => import("@pages/perfil/MiPerfilPage"));
const MiExpediente = lazy(() => import("@pages/perfil/MiExpedientePage"));
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

function RedirectRegistroOperativo() {
  const { pathname, search } = useLocation();
  const destino = pathname.replace(/^\/registro-operativo/, "/bitacoras") + search;
  return <Navigate to={destino} replace />;
}

export default function AppRouter() {
  return (
    <Suspense fallback={<LazyFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Inicio />} />
            <Route path="mi-perfil" element={<MiPerfil />} />
            <Route path="mi-expediente" element={<MiExpediente />} />
            <Route path="sin-acceso" element={<SinAcceso />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute modulo="Bitacoras" />}>
          <Route element={<AppLayout />}>
            <Route path="bitacoras">
              <Route path="control-fauna-nociva" element={<ControlFaunaNociva />} />
              <Route path="recepcion-insumos" element={<BitacoraRecepcionInsumos />} />
              <Route path="control-visitas" element={<ControlVisitas />} />
              <Route path="control-limpieza" element={<ControlLimpieza />} />
              <Route path="parametros-fisico-quimicos" element={<ParametrosFisicoQuimicos />} />
              <Route path="medicamentos" element={<BitacoraMedicamentos />} />
              <Route path="recambios" element={<BitacoraRecambios />} />
              <Route path="inventario" element={<BitacoraInventario />} />
              <Route path="biometrias" element={<BioBiometrias />} />
              <Route path="alimentacion" element={<BioAlimentacion />} />
            </Route>
            <Route path="registro-operativo/*" element={<RedirectRegistroOperativo />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute modulo="Finanzas" />}>
          <Route element={<AppLayout />}>
            <Route path="ventas/tesoreria" element={<TesoreriaGeneral />} />
            <Route path="ventas/flujo-caja" element={<FlujoCaja />} />
            <Route path="proveedores" element={<Proveedores />} />
            <Route path="cuentas" element={<Cuentas />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute modulo="RRHH" />}>
          <Route element={<AppLayout />}>
            <Route path="empleados" element={<Empleados />} />
            <Route path="nomina" element={<Nomina />} />
            <Route path="vacaciones" element={<Vacaciones />} />
            <Route path="caja-ahorro" element={<CajaAhorro />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute modulo="Catálogos" />}>
          <Route element={<AppLayout />}>
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="roles" element={<Roles />} />
            <Route path="puestos" element={<Puestos />} />
            <Route path="departamentos" element={<Departamentos />} />
            <Route path="unidades-negocio" element={<UnidadesNegocio />} />
            <Route path="ubicaciones" element={<Ubicaciones />} />
            <Route path="tipos-pileta" element={<TiposPileta />} />
            <Route path="areas-instalacion" element={<AreasInstalacion />} />
            <Route path="faunas-detectadas" element={<FaunasDetectadas />} />
            <Route path="evidencias-fauna" element={<EvidenciasFauna />} />
            <Route path="estados-trampa" element={<EstadosTrampa />} />
            <Route path="acciones-correctivas" element={<AccionesCorrectivas />} />
            <Route path="insumos" element={<Insumos />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute modulo="Inventarios" />}>
          <Route element={<AppLayout />}>
            <Route path="inventarios/piletas" element={<Navigate to="/inventarios/piletas-fisicas" replace />} />
            <Route path="inventarios/piletas-fisicas" element={<PiletasFisicas />} />
            <Route path="inventarios/reproductores" element={<Reproductores />} />
            <Route path="inventarios/engorda" element={<Engorda />} />
            <Route path="inventarios/eficiencia-reproductiva" element={<EficienciaReproductiva />} />
            <Route path="inventarios/ciclos-engorda" element={<CiclosEngorda />} />
            <Route path="inventarios/lotes" element={<Navigate to="/inventarios/eficiencia-reproductiva" replace />} />
            <Route path="inventarios/control-reproductivo" element={<Navigate to="/inventarios/eficiencia-reproductiva" replace />} />
            <Route path="inventarios/eventos-cosecha" element={<Navigate to="/inventarios/eficiencia-reproductiva" replace />} />
            <Route path="inventarios/alevinaje" element={<Alevinaje />} />
            <Route path="inventarios/incubacion" element={<Navigate to="/inventarios/eficiencia-reproductiva" replace />} />
            <Route path="inventarios/trazabilidad" element={<Trazabilidad />} />
            <Route path="inventarios/equipos" element={<Equipos />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute modulo="Ventas" />}>
          <Route element={<AppLayout />}>
            <Route path="ventas/registro" element={<Venta />} />
            <Route path="registro/cliente" element={<Cliente />} />
            <Route path="ventas/lista-espera" element={<ListaEspera />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute modulo="Seguridad" />}>
          <Route element={<AppLayout />}>
            <Route path="seguridad/roles-modulos" element={<RolesModulos />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Suspense>
  );
}
