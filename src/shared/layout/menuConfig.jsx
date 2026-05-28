import Dashboard from "@mui/icons-material/Dashboard";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Assignment from "@mui/icons-material/Assignment";
import Inventory from "@mui/icons-material/Inventory";
import Store from "@mui/icons-material/Store";
import AccountBalance from "@mui/icons-material/AccountBalance";
import People from "@mui/icons-material/People";
import Handyman from "@mui/icons-material/Handyman";
import Science from "@mui/icons-material/Science";
import LocalMall from "@mui/icons-material/LocalMall";
import LocalAtm from "@mui/icons-material/LocalAtm";
import Person from "@mui/icons-material/Person";
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
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import CategoryIcon from "@mui/icons-material/Category";
import EggAltIcon from "@mui/icons-material/EggAlt";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import PoolOutlinedIcon from "@mui/icons-material/PoolOutlined";
import MenuBook from "@mui/icons-material/MenuBook";
import Security from "@mui/icons-material/Security";
import Groups from "@mui/icons-material/Groups";
import Timeline from "@mui/icons-material/Timeline";

export const DASHBOARD_SECTION = {
  modulo: "Dashboard",
  label: "DASHBOARD",
  moduleIcon: <Dashboard />,
  items: [
    { to: "/", icon: <Dashboard />, label: "Inicio" },
    { to: "/mi-perfil", icon: <AccountCircle />, label: "Mi Perfil" },
  ],
};

export const MENU_SECTIONS = [
  {
    modulo: "Operaciones",
    label: "OPERACIONES / BITÁCORAS",
    moduleIcon: <Assignment />,
    items: [
      { to: "/registro-operativo/plagas", icon: <BugReport />, label: "Control de Plagas" },
      { to: "/registro-operativo/recepcion-insumos", icon: <ReceiptLong />, label: "Recepción de Insumos" },
      { to: "/registro-operativo/visitas", icon: <People />, label: "Control de Visitas" },
      { to: "/registro-operativo/limpieza-banos", icon: <CleaningServices />, label: "Limpieza de Baños" },
      { to: "/registro-operativo/parametros", icon: <Biotech />, label: "Parámetros Físico-Químicos" },
      { to: "/registro-operativo/medicamentos", icon: <LocalHospital />, label: "Aplicación de Medicamentos" },
      { to: "/registro-operativo/recambios", icon: <ScienceOutlined />, label: "Recambios" },
      { to: "/registro-operativo/biometrias", icon: <Science />, label: "Biometrías" },
      { to: "/registro-operativo/alimentacion", icon: <Grass />, label: "Alimentación" },
      { to: "/registro-operativo/insumos", icon: <Inventory />, label: "Ingresos / Egresos Insumos" },
    ],
  },
  {
    modulo: "Inventarios",
    label: "INVENTARIOS",
    moduleIcon: <Inventory />,
    subsections: [
      {
        sublabel: "Inventario de Organismos",
        sublabelColor: "#90cdffff",
        items: [
          { to: "/inventarios/piletas-fisicas", icon: <PoolOutlinedIcon />, label: "Infraestructura Física" },
          { to: "/inventarios/reproductores", icon: <Biotech />, label: "Reproductores" },
          { to: "/inventarios/control-reproductivo", icon: <EggAltIcon />, label: "Control Reproductivo" },
          { to: "/inventarios/alevinaje", icon: <WaterDropIcon />, label: "Alevinaje" },
          { to: "/inventarios/engorda", icon: <Grass />, label: "Engorda" },
          { to: "/inventarios/trazabilidad", icon: <Timeline />, label: "Trazabilidad" },
        ],
      },
      {
        sublabel: "Otros Inventarios",
        sublabelColor: "#e3eb72ff",
        items: [
          { to: "/inventarios/alimentos", icon: <LocalMall />, label: "Alimento e Insumos" },
          { to: "/inventarios/equipos", icon: <Handyman />, label: "Equipo y Herramientas" },
        ],
      },
    ],
  },
  {
    modulo: "Ventas",
    label: "VENTAS",
    moduleIcon: <Store />,
    items: [
      { to: "/ventas/lista-espera", icon: <Store />, label: "Próximas Ventas" },
      { to: "/ventas/registro", icon: <LocalAtm />, label: "Control de Ventas" },
      { to: "/registro/cliente", icon: <People />, label: "Clientes" },
    ],
  },
  {
    modulo: "Finanzas",
    label: "ADMIN Y FINANZAS",
    moduleIcon: <AccountBalance />,
    items: [
      { to: "/ventas/flujo-caja", icon: <AccountBalance />, label: "Flujo de Caja" },
      { to: "/ventas/tesoreria", icon: <AccountBalance />, label: "Tesorería General" },
      { to: "/proveedores", icon: <Store />, label: "Proveedores" },
      { to: "/cuentas", icon: <AccountBalance />, label: "Cuentas" },
    ],
  },
  {
    modulo: "RRHH",
    label: "RRHH",
    moduleIcon: <Groups />,
    items: [
      { to: "/nomina", icon: <Person />, label: "Nómina" },
      { to: "/empleados", icon: <Badge />, label: "Empleados" },
      { to: "/vacaciones", icon: <EventAvailableIcon />, label: "Vacaciones y Ausencias" },
      { to: "/caja-ahorro", icon: <Savings />, label: "Caja de Ahorro" },
    ],
  },
  {
    modulo: "Catálogos",
    label: "CATÁLOGOS",
    moduleIcon: <MenuBook />,
    items: [
      { to: "/usuarios", icon: <People />, label: "Usuarios" },
      { to: "/roles", icon: <Assignment />, label: "Roles" },
      { to: "/departamentos", icon: <Business />, label: "Departamentos" },
      { to: "/puestos", icon: <Work />, label: "Puestos" },
      { to: "/unidades-negocio", icon: <Business />, label: "Unidades de Negocio" },
      { to: "/ubicaciones",     icon: <HomeWorkIcon />, label: "Ubicaciones" },
      { to: "/tipos-pileta", icon: <CategoryIcon />, label: "Tipos de pileta" },
    ],
  },
  {
    modulo: "Seguridad",
    label: "SEGURIDAD",
    moduleIcon: <Security />,
    items: [
      { to: "/seguridad/roles-modulos", icon: <People />, label: "Módulos por rol" },
    ],
  },
];
