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

// Inventarios
import Pileta from "./components/Pileta";
import Reproductores from "./components/Reproductores";
import Alimentos from "./components/Alimentos";
import Engorda from "./components/Engorda";
import Equipos from "./components/Equipos";

// Ventas
import Venta from "./components/Venta";
import ConcentradoVentas from "./components/ConcentradoVentas";
import ListaEspera from "./components/ListaEspera";

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

            {/* INVENTARIOS */}
            <Route path="piletas" element={<Pileta />} />
            <Route path="reproductores" element={<Reproductores />} />
            <Route path="alimentos" element={<Alimentos />} />
            <Route path="engorda" element={<Engorda />} />
            <Route path="/registro-operativo/inventario" element={<Equipos />} />

            {/* VENTAS */}
            <Route path="venta" element={<Venta />} />
            <Route path="concentrado-ventas" element={<ConcentradoVentas />} />
            <Route path="lista-espera" element={<ListaEspera />} />

            {/* REGISTRO OPERATIVO */}
            <Route path="registro-operativo">

              {/* Medellín */}
              <Route path="plagas" element={<BitacoraPlagas />} />
              <Route path="recepcion-insumos" element={<BitacoraRecepcionInsumos />} />
              <Route path="visitas" element={<BitacoraVisitas />} />
              <Route path="limpieza-banos" element={<BitacoraBanos />} />
              <Route path="parametros" element={<BitacoraParametros />} />
              <Route path="medicamentos" element={<BitacoraMedicamentos />} />
              <Route path="recambios" element={<BitacoraRecambios />} />
              <Route path="inventario" element={<BitacoraInventario />} />

              {/* La Ceiba */}
              <Route path="biometrias" element={<BioBiometrias />} />
              <Route path="alimentacion" element={<BioAlimentacion />} />
              <Route path="insumos" element={<BioInsumos />} />
              </Route>

              {/* RRHH */}
              <Route path="expedientes" element={<Expedientes />} />
              <Route path="nomina" element={<Nomina />} />
              <Route path="vacaciones" element={<Vacaciones />} />
              <Route path="/caja-ahorro" element={<CajaAhorro />} />
              <Route path="/proveedores" element={<Proveedores />} />   

            {/* CATÁLOGOS */}
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="roles" element={<Roles />} />
            <Route path="cliente" element={<Cliente />} />
          </Route>
        </Route>

        {/* CUALQUIER RUTA DESCONOCIDA */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
