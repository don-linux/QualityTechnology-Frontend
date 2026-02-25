// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import CustomGlobalStyles from "./utils/GlobalStyles";

// Login
import Login from "./components/Login";

// Pantalla bienvenida
import Inicio from "./components/Inicio";

// Catálogos
import Usuarios from "./components/Usuarios";
import Roles from "./components/Roles";
import Cliente from "./components/Cliente";
import Estado from "./components/Estado";

// Inventarios
import Pileta from "./components/Pileta";
import Instalaciones from "./components/Instalaciones";
import Reproductores from "./components/Reproductores";
import Alimentos from "./components/Alimentos";
import Engorda from "./components/Engorda";
import Equipos from "./components/Equipos";
import LotesRegistro from "./components/LotesRegistro";

// Ventas
import Venta from "./components/Venta";
import FlujoCaja from "./components/FlujoCaja";
import ListaEspera from "./components/ListaEspera";
import TesoreriaGeneral from "./components/TesoreriaGeneral";

// Registro Operativos
import BitacoraPlagas from "./components/registro-operativo/BitacoraPlagas";
import BitacoraRecepcionInsumos from "./components/registro-operativo/BitacoraRecepcionInsumos";
import BitacoraVisitas from "./components/registro-operativo/BitacoraVisitas";
import BitacoraBanos from "./components/registro-operativo/BitacoraBanos";
import BitacoraParametros from "./components/registro-operativo/BitacoraParametros";
import BitacoraMedicamentos from "./components/registro-operativo/BitacoraMedicamentos";
import BitacoraRecambios from "./components/registro-operativo/BitacoraRecambios";
import BitacoraInventario from "./components/registro-operativo/BitacoraInventario";
import BioBiometrias from "./components/registro-operativo/BioBiometrias";
import BioAlimentacion from "./components/registro-operativo/BioAlimentacion";
import BioInsumos from "./components/registro-operativo/BioInsumos";

//RRHH
import Expedientes from "./components/Expedientes";
import Nomina from "./components/Nomina";
import Vacaciones from "./components/Vacaciones";
import CajaAhorro from "./components/CajaAhorro";
import Proveedores from "./components/Proveedores";

// Layout principal
import CorporateLayout from "./layout/CorporateLayout";

// Ruta protegida
import PrivateRoute from "./components/PrivateRoute";


function App() {
  return (
    <Router>
      <CssBaseline />
      <CustomGlobalStyles />
      <Routes>
        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* 🔒 RUTAS PROTEGIDAS */}
        <Route
          element={
            <PrivateRoute
              rolesPermitidos={["Administrador", "Jefe de Empresa", "Biologa"]}
            />
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

        {/* CUALQUIER RUTA DESCONOCIDA */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
