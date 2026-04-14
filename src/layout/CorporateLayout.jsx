// src/layout/CorporateLayout.jsx
import React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import ListItemIcon from "@mui/material/ListItemIcon";
import Dashboard from "@mui/icons-material/Dashboard";
import Assignment from "@mui/icons-material/Assignment";
import Inventory from "@mui/icons-material/Inventory";
import Store from "@mui/icons-material/Store";
import AccountBalance from "@mui/icons-material/AccountBalance";
import People from "@mui/icons-material/People";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Handyman from "@mui/icons-material/Handyman";
import Science from "@mui/icons-material/Science";
import LocalMall from "@mui/icons-material/LocalMall";
import LocalAtm from "@mui/icons-material/LocalAtm";
import Person from "@mui/icons-material/Person";
import Folder from "@mui/icons-material/Folder";
import Savings from "@mui/icons-material/Savings";
import BugReport from "@mui/icons-material/BugReport";
import ScienceOutlined from "@mui/icons-material/ScienceOutlined";
import LocalHospital from "@mui/icons-material/LocalHospital";
import CleaningServices from "@mui/icons-material/CleaningServices";
import Grass from "@mui/icons-material/Grass";
import Biotech from "@mui/icons-material/Biotech";
import ReceiptLong from "@mui/icons-material/ReceiptLong";
import Work from "@mui/icons-material/Work";
import Badge from "@mui/icons-material/Badge";
import Business from "@mui/icons-material/Business";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";

import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import { Link, useLocation, Outlet } from "react-router-dom";
import { logout } from "../utils/auth";
import EggAltIcon from "@mui/icons-material/EggAlt";

const drawerWidth = 270;

export default function CorporateLayout() {
  const location = useLocation();
  const [openBitacora, setOpenBitacora] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(true);
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  React.useEffect(() => {
    if (location.pathname.startsWith("/registro-operativo")) {
      setOpenBitacora(true);
    }
  }, [location.pathname]);

  const nombre = (localStorage.getItem("nombre") || "Usuario").trim();
  const rolRaw = localStorage.getItem("rol") || "";
  const modulosGuardados = JSON.parse(localStorage.getItem("modulos") || "[]");
  const modulos = new Set(
    modulosGuardados.map((m) => m.fc_nombre?.trim())
  );

  const rol = rolRaw
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");

  const nombreLower = nombre.toLowerCase();

  let rolLegible = "Usuario";
  if (
    rol.includes("admin") ||
    rol.includes("administrador") ||
    rol.includes("jefedeempresa")
  ) {
    if (nombreLower.includes("jefegam")) {
      rolLegible = "Jefe de Medellín";
    } else if (nombreLower.includes("jefegac")) {
      rolLegible = "Jefe de La Ceiba";
    } else {
      rolLegible = "Administrador";
    }
  }

  const mostrarNombre = rolLegible;

  const navSx = (path, { exact = true, pl } = {}) => {
    const active = exact
      ? location.pathname === path
      : location.pathname.startsWith(path);
    return {
      borderRadius: 1,
      mb: 0.5,
      ...(pl !== undefined ? { pl } : {}),
      backgroundColor: active ? "rgba(255,255,255,0.18)" : "transparent",
      "&:hover": { backgroundColor: active ? "rgba(255,255,255,0.24)" : "#43A047" },
      justifyContent: drawerOpen ? "flex-start" : "center",
    };
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* ===================== TOPBAR ===================== */}
      <AppBar
        position="fixed"
        sx={{
          borderRadius: 0,
          background: "linear-gradient(90deg, #006d52, #3aa87d)",
          color: "white",
          zIndex: 1300,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              onClick={toggleDrawer}
              aria-label={drawerOpen ? "Cerrar menú" : "Abrir menú"}
              title={drawerOpen ? "Cerrar menú" : "Abrir menú"}
              sx={{
                color: "white",
                fontSize: 22,
                minWidth: 0,
                padding: "6px 10px",
                borderRadius: 2,
                backgroundColor: "rgba(255,255,255,0.1)",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
              }}
            >
              {drawerOpen ? <MenuOpenIcon /> : <MenuIcon />}
            </Button>

            <Typography variant="h6" noWrap fontWeight="bold">
              Sistema Integral Quality
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Typography sx={{ fontWeight: "bold", fontSize: "1rem" }}>
              {mostrarNombre}
            </Typography>

            <Avatar
              sx={{
                bgcolor: "#004d40",
                border: "2px solid white",
                boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
              }}
            >
              {mostrarNombre.charAt(0).toUpperCase()}
            </Avatar>

            <Button
              variant="outlined"
              sx={{
                color: "#fff",
                borderColor: "#fff",
                textTransform: "none",
                borderRadius: 3,
                fontWeight: "bold",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              }}
              onClick={logout}
            >
              Cerrar sesión
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ===================== SIDEBAR ===================== */}
      <Drawer
        variant="permanent"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? drawerWidth : 80,
          "& .MuiDrawer-paper": {
            borderRadius: 0,
            width: drawerOpen ? drawerWidth : 80,
            background: "linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%)",
            color: "white",
            borderRight: "none",
            paddingTop: "70px",
            overflowX: "hidden",
            transition: "width 0.3s ease",
          },
        }}
      >
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <img
            src={`${""}/images/quality.png`}
            alt="Logo"
            width={drawerOpen ? "110" : "40"}
            style={{ marginTop: "10px", transition: "width 0.3s ease" }}
          />
        </Box>

        <List sx={{ px: drawerOpen ? 1 : 0 }}>
          {/* DASHBOARD */}
          {drawerOpen && (
            <Typography
              sx={{ fontWeight: "bold", color: "#C8E6C9", ml: 1, mb: 1 }}
            >
              DASHBOARD
            </Typography>
          )}
          <ListItemButton
            component={Link}
            to="/"
            sx={navSx("/")}
          >
            <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
              <Dashboard />
            </ListItemIcon>
            {drawerOpen && <ListItemText primary="Inicio" />}
          </ListItemButton>

          <ListItemButton
            component={Link}
            to="/mi-perfil"
            sx={navSx("/mi-perfil")}
          >
            <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
              <AccountCircle />
            </ListItemIcon>
            {drawerOpen && <ListItemText primary="Mi Perfil" />}
          </ListItemButton>
          {modulos.has("Operaciones") && (
            <>
            {/* OPERACIONES */}
            {drawerOpen && (
              <Typography
                sx={{ fontWeight: "bold", color: "#C8E6C9", ml: 1, mt: 2, mb: 1 }}
              >
                OPERACIONES
              </Typography>
            )}

            <ListItemButton
              onClick={() => setOpenBitacora(!openBitacora)}
              sx={navSx("/registro-operativo", { exact: false })}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                <Assignment />
              </ListItemIcon>
              {drawerOpen && <ListItemText primary="Bitácoras" />}
              {drawerOpen && (openBitacora ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>

            <Collapse in={openBitacora && drawerOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {[
                  { to: "/registro-operativo/plagas",            icon: <BugReport />,        label: "Control de Plagas" },
                  { to: "/registro-operativo/recepcion-insumos", icon: <ReceiptLong />,       label: "Recepción de Insumos" },
                  { to: "/registro-operativo/visitas",           icon: <People />,            label: "Control de Visitas" },
                  { to: "/registro-operativo/limpieza-banos",    icon: <CleaningServices />,  label: "Limpieza de Baños" },
                  { to: "/registro-operativo/parametros",        icon: <Biotech />,           label: "Parámetros Físico-Químicos" },
                  { to: "/registro-operativo/medicamentos",      icon: <LocalHospital />,     label: "Aplicación de Medicamentos" },
                  { to: "/registro-operativo/recambios",         icon: <ScienceOutlined />,   label: "Recambios" },
                  { to: "/registro-operativo/biometrias",        icon: <Science />,           label: "Biometrías" },
                  { to: "/registro-operativo/alimentacion",      icon: <Grass />,             label: "Alimentación" },
                  { to: "/registro-operativo/insumos",           icon: <Inventory />,         label: "Ingresos / Egresos Insumos" },
                ].map(({ to, icon, label }) => (
                  <ListItemButton
                    key={to}
                    component={Link}
                    to={to}
                    sx={navSx(to, { pl: 5 })}
                  >
                    <ListItemIcon sx={{ color: "white" }}>{icon}</ListItemIcon>
                    <ListItemText primary={label} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
            </>
          )}
          {modulos.has("Inventarios") && (
            <>
              {/* ===================== INVENTARIOS ===================== */}
              {drawerOpen && (
                <Typography
                  sx={{ fontWeight: "bold", color: "#C8E6C9", ml: 1, mt: 2, mb: 1 }}
                >
                  INVENTARIOS
                </Typography>
              )}

              {/*  INVENTARIO DE ORGANISMOS */}
              {drawerOpen && (
                <Typography
                  sx={{
                    fontWeight: "bold",
                    color: "#90cdffff",
                    ml: 2,
                    mt: 1,
                    mb: 0.5,
                    fontSize: "13px",
                  }}
                >
                  Inventario de Organismos
                </Typography>
              )}

              {[
                { to: "/inventarios/lotes",         icon: <EggAltIcon />, label: "Control Reproductivo" },
                { to: "/inventarios/piletas",        icon: <Science />,    label: "Alevinaje" },
                { to: "/inventarios/reproductores",  icon: <Biotech />,    label: "Reproductores" },
                { to: "/inventarios/engorda",        icon: <Grass />,      label: "Engorda" },
              ].map(({ to, icon, label }) => (
                <ListItemButton key={to} component={Link} to={to} sx={navSx(to)}>
                  <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>{icon}</ListItemIcon>
                  {drawerOpen && <ListItemText primary={label} />}
                </ListItemButton>
              ))}

              {/*  OTROS INVENTARIOS */}
              {drawerOpen && (
                <Typography
                  sx={{
                    fontWeight: "bold",
                    color: "#e3eb72ff",
                    ml: 2,
                    mt: 1.5,
                    mb: 0.5,
                    fontSize: "13px",
                  }}
                >
                  Otros Inventarios
                </Typography>
              )}

              {[
                { to: "/inventarios/instalaciones",       icon: <HomeWorkIcon />, label: "Instalaciones" },
                { to: "/inventarios/alimentos",           icon: <LocalMall />,    label: "Alimento e Insumos" },
                { to: "/inventarios/registro-operativo",  icon: <Handyman />,     label: "Equipo y Herramientas" },
              ].map(({ to, icon, label }) => (
                <ListItemButton key={to} component={Link} to={to} sx={navSx(to)}>
                  <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>{icon}</ListItemIcon>
                  {drawerOpen && <ListItemText primary={label} />}
                </ListItemButton>
              ))}
            </>
          )}
          {modulos.has("Ventas") && (
            <>
            {/* ===================== VENTAS ===================== */}
            {drawerOpen && (
              <Typography
                sx={{ fontWeight: "bold", color: "#C8E6C9", ml: 1, mt: 2, mb: 1 }}
              >
                VENTAS
              </Typography>
            )}

            {[
              { to: "/ventas/lista-espera", icon: <Store />,    label: "Próximas Ventas" },
              { to: "/ventas/registro",     icon: <LocalAtm />, label: "Registro de Ventas" },
              { to: "/registro/cliente",    icon: <People />,   label: "Clientes" },
            ].map(({ to, icon, label }) => (
              <ListItemButton key={to} component={Link} to={to} sx={navSx(to)}>
                <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>{icon}</ListItemIcon>
                {drawerOpen && <ListItemText primary={label} />}
              </ListItemButton>
            ))}
            </>
          )}
          {modulos.has("Finanzas") && (
            <>
              {/* ===================== ADMIN Y FINANZAS ===================== */}
              {drawerOpen && (
                <Typography
                  sx={{ fontWeight: "bold", color: "#C8E6C9", ml: 1, mt: 2, mb: 1 }}
                >
                  ADMIN Y FINANZAS
                </Typography>
              )}

              {[
                { to: "/ventas/flujo-caja", icon: <AccountBalance />, label: "Flujo de Caja" },
                { to: "/ventas/tesoreria",  icon: <AccountBalance />, label: "Tesorería General" },
                { to: "/proveedores",       icon: <Store />,          label: "Proveedores" },
              ].map(({ to, icon, label }) => (
                <ListItemButton key={to} component={Link} to={to} sx={navSx(to)}>
                  <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>{icon}</ListItemIcon>
                  {drawerOpen && <ListItemText primary={label} />}
                </ListItemButton>
              ))}
            </>
          )}
          {modulos.has("RRHH") && (
            <>
            {/* ===================== RRHH ===================== */}
              {drawerOpen && (
                <Typography
                  sx={{ fontWeight: "bold", color: "#C8E6C9", ml: 1, mt: 2, mb: 1 }}
                >
                  RRHH
                </Typography>
              )}

              {[
                { to: "/nomina",     icon: <Person />,             label: "Nómina" },
                { to: "/empleados",  icon: <Badge />,              label: "Empleados" },
                { to: "/vacaciones", icon: <EventAvailableIcon />, label: "Vacaciones y Ausencias" },
                { to: "/caja-ahorro",icon: <Savings />,            label: "Caja de Ahorro" },
              ].map(({ to, icon, label }) => (
                <ListItemButton key={to} component={Link} to={to} sx={navSx(to)}>
                  <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>{icon}</ListItemIcon>
                  {drawerOpen && <ListItemText primary={label} />}
                </ListItemButton>
              ))}
            </>
          )}
        </List>
        {/* ===================== CATÁLOGOS ===================== */}
        {modulos.has("Catálogos") && (
          <>
            {drawerOpen && (
              <Typography
                sx={{ fontWeight: "bold", color: "#C8E6C9", ml: 1, mt: 2, mb: 1 }}
              >
                CATÁLOGOS
              </Typography>
            )}

            {[
              { to: "/usuarios",     icon: <People />,     label: "Usuarios" },
              { to: "/roles",        icon: <Assignment />, label: "Roles" },
              { to: "/departamentos",icon: <Business />,   label: "Departamentos" },
              { to: "/puestos",      icon: <Work />,       label: "Puestos" },
            ].map(({ to, icon, label }) => (
              <ListItemButton key={to} component={Link} to={to} sx={navSx(to)}>
                <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>{icon}</ListItemIcon>
                {drawerOpen && <ListItemText primary={label} />}
              </ListItemButton>
            ))}
          </>
        )}
        {/* ===================== SEGURIDAD ===================== */}
        {modulos.has("Seguridad") && (
          <>
            {drawerOpen && (
              <Typography
                sx={{ fontWeight: "bold", color: "#C8E6C9", ml: 1, mt: 2, mb: 1 }}
              >
                SEGURIDAD
              </Typography>
            )}

            <ListItemButton
              component={Link}
              to="/seguridad/roles-modulos"
              sx={navSx("/seguridad/roles-modulos")}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                <People />
              </ListItemIcon>
              {drawerOpen && <ListItemText primary="Módulos por rol" />}
            </ListItemButton>
          </>
        )}
      </Drawer>
      {/* ===================== CONTENIDO ===================== */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: 3,
          mt: "70px",
          minHeight: "100vh",
          backgroundColor: "#f4f6f8",
          overflow: "hidden",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}