import Dashboard from "@mui/icons-material/Dashboard";
import AccountCircle from "@mui/icons-material/AccountCircle";
import FolderShared from "@mui/icons-material/FolderShared";
import Assignment from "@mui/icons-material/Assignment";
import Inventory from "@mui/icons-material/Inventory";
import Store from "@mui/icons-material/Store";
import AccountBalance from "@mui/icons-material/AccountBalance";
import People from "@mui/icons-material/People";
import Handyman from "@mui/icons-material/Handyman";
import Science from "@mui/icons-material/Science";
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
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import PoolOutlinedIcon from "@mui/icons-material/PoolOutlined";
import MenuBook from "@mui/icons-material/MenuBook";
import Security from "@mui/icons-material/Security";
import Groups from "@mui/icons-material/Groups";
import Timeline from "@mui/icons-material/Timeline";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import Inventory2Icon from "@mui/icons-material/Inventory2";

export const DASHBOARD_SECTION = {
  modulo: "Dashboard",
  label: "DASHBOARD",
  moduleIcon: <Dashboard />,
  items: [
    { to: "/", icon: <Dashboard />, label: "Inicio" },
    { to: "/mi-perfil", icon: <AccountCircle />, label: "Mi Perfil" },
    { to: "/mi-expediente", icon: <FolderShared />, label: "Mi Expediente" },
  ],
};

export const MENU_SECTIONS = [
  {
    modulo: "Inventarios",
    label: "INVENTARIOS",
    moduleIcon: <Inventory />,
    subsections: [
      {
        sublabel: "Inventario de Organismos",
        sublabelColor: "#90cdffff",
        items: [
          { to: "/inventarios/alevinaje", icon: <WaterDropIcon />, label: "Alevinaje" },
          { to: "/inventarios/reproductores", icon: <Biotech />, label: "Lote Reproductores" },
          { to: "/inventarios/engorda", icon: <Grass />, label: "Engorda" },
        ],
      },
    ],
    items: [
      { to: "/inventarios/trazabilidad", icon: <Timeline />, label: "Trazabilidad" },
      { to: "/inventarios/eficiencia-reproductiva", icon: <EggAltIcon />, label: "Eficiencia reproductiva" },
      { to: "/inventarios/ciclos-engorda", icon: <AutorenewIcon />, label: "Ciclos de engorda" },
      { to: "/inventarios/piletas-fisicas", icon: <PoolOutlinedIcon />, label: "Infraestructura Física" },
      { to: "/inventarios/equipos", icon: <Handyman />, label: "Equipo y Herramientas" },
    ],
  },
  {
    modulo: "Bitacoras",
    label: "BITÁCORAS",
    moduleIcon: <Assignment />,
    items: [
      { to: "/bitacoras/control-fauna-nociva", icon: <BugReport />, label: "Control de Fauna Nociva" },
      { to: "/bitacoras/recepcion-insumos", icon: <ReceiptLong />, label: "Recepción de Insumos" },
      { to: "/bitacoras/control-visitas", icon: <People />, label: "Control de Visitas" },
      { to: "/bitacoras/control-limpieza", icon: <CleaningServices />, label: "Control de Limpieza" },
      { to: "/bitacoras/parametros-fisico-quimicos", icon: <Biotech />, label: "Parámetros Físico-Químicos" },
      { to: "/bitacoras/medicamentos", icon: <LocalHospital />, label: "Aplicación de Medicamentos" },
      { to: "/bitacoras/recambios", icon: <ScienceOutlined />, label: "Recambios" },
      { to: "/bitacoras/biometrias", icon: <Science />, label: "Biometrías" },
      { to: "/bitacoras/alimentacion", icon: <Grass />, label: "Alimentación" },
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
    subsections: [
      {
        sublabel: "Catálogos administrativos",
        sublabelColor: "#90cdffff",
        items: [
          { to: "/usuarios", icon: <People />, label: "Usuarios" },
          { to: "/roles", icon: <Assignment />, label: "Roles" },
          { to: "/departamentos", icon: <Business />, label: "Departamentos" },
          { to: "/puestos", icon: <Work />, label: "Puestos" },
          { to: "/unidades-negocio", icon: <Business />, label: "Unidades de Negocio" },
          { to: "/ubicaciones", icon: <HomeWorkIcon />, label: "Ubicaciones" },
          { to: "/tipos-pileta", icon: <CategoryIcon />, label: "Tipos de pileta" },
        ],
      },
      {
        sublabel: "Catálogos de control de fauna nociva",
        sublabelColor: "#90cdffff",
        items: [
          { to: "/areas-instalacion", icon: <HomeWorkIcon />, label: "Áreas de instalación" },
          { to: "/faunas-detectadas", icon: <BugReport />, label: "Faunas detectadas" },
          { to: "/evidencias-fauna", icon: <Assignment />, label: "Evidencias" },
          { to: "/estados-trampa", icon: <CategoryIcon />, label: "Estados de trampa" },
          { to: "/acciones-correctivas", icon: <CleaningServices />, label: "Acciones correctivas" },
        ],
      },
      {
        sublabel: "Insumos",
        sublabelColor: "#90cdffff",
        items: [
          { to: "/insumos", icon: <Inventory2Icon />, label: "Catálogo de Insumos" },
        ],
      },
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
