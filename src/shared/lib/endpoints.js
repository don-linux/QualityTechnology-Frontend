/**
 * Mapa centralizado de endpoints REST consumidos por el frontend.
 *
 * Todas las rutas son relativas al `baseURL` configurado en `axiosInstance`
 * (`API_URL` ya incluye el prefijo `/api`). Por ello aquí NO se antepone `/api`.
 *
 * Reglas:
 *  - Si necesitas un segmento dinámico, exporta una función (no un string).
 *  - Si un recurso expone varios sub-recursos relacionados, usa un objeto.
 *  - Cualquier cambio de ruta debe ocurrir aquí y en ningún otro lado.
 */

const path = (value) => encodeURIComponent(decodeURIComponent(String(value ?? "")));

export const ENDPOINTS = {
  auth: {
    login: "/usuarios/login",
    refresh: "/usuarios/refresh",
    logout: "/usuarios/logout",
  },

  usuarios: {
    base: "/usuarios",
    byId: (id) => `/usuarios/${id}`,
    activate: (id) => `/usuarios/${id}/activate`,
    deactivate: (id) => `/usuarios/${id}/deactivate`,
  },

  roles: {
    base: "/roles",
    byId: (id) => `/roles/${id}`,
  },

  modulos: {
    base: "/modulos",
    byId: (id) => `/modulos/${id}`,
  },

  rolesModulos: {
    byRol: (rolId) => `/roles-modulos/${rolId}/modulos`,
    removeModulo: (rolId, moduloId) => `/roles-modulos/${rolId}/modulos/${moduloId}`,
  },

  piletas: {
    base: "/piletas",
    lotes: (granja) => `/piletas/lotes/${path(granja)}`,
    lotePorInstalacion: (inst, granja) => `/piletas/lote-por-inst/${inst}/${path(granja)}`,
    inventario: (granja) => `/piletas/inventario/${path(granja)}`,
    origen: (granja) => `/piletas/origen/${path(granja)}`,
    destino: (granja) => `/piletas/destino/${path(granja)}`,
    siembra: "/piletas/siembra",
    byId: (id) => `/piletas/${id}`,
    movimientos: (usuario, granja) => `/piletas/movimientos/${usuario}/${path(granja)}`,
    movimientosFiltro: (usuario, granja) => `/piletas/movimientos/filtro/${usuario}/${path(granja)}`,
    registrarMovimiento: "/piletas/movimientos/registrar",
    eliminarMovimientos: "/piletas/movimientos/eliminar",
  },

  instalaciones: {
    base: "/instalaciones",
    byGranja: (granja) => `/instalaciones/granja/${path(granja)}`,
    byTipo: (tipo, granja) => `/instalaciones/tipo/${tipo}/${path(granja)}`,
    byId: (id) => `/instalaciones/${id}`,
  },

  lotes: {
    base: "/lotes",
    byGranja: (granja) => `/lotes/granja/${path(granja)}`,
    byInstalacion: (id) => `/lotes/instalacion/${id}`,
    instalacionesReproductores: (granja) => `/lotes/instalaciones/${path(granja)}`,
    familiaPorInstalacion: (id) => `/lotes/familia-por-instalacion/${id}`,
    byId: (id) => `/lotes/${id}`,
  },

  reproductores: {
    base: "/reproductores",
    byGranja: (granja) => `/reproductores/granja/${path(granja)}`,
    instalaciones: (granja) => `/reproductores/instalaciones/${path(granja)}`,
    movimientos: (granja) => `/reproductores/movimientos/${path(granja)}`,
    byId: (id) => `/reproductores/${id}`,
  },

  engorda: {
    base: "/engorda",
    byGranja: (granja) => `/engorda/granja/${path(granja)}`,
    byId: (id) => `/engorda/${id}`,
    movimientos: (usuario) => `/engorda/movimientos/${usuario}`,
    deleteMovimiento: (id) => `/engorda/movimientos/${id}`,
  },

  alimentos: {
    base: "/alimentos",
    byId: (id) => `/alimentos/${id}`,
  },

  alevines: {
    base: "/alevines",
    byId: (id) => `/alevines/${id}`,
  },

  alevinaje: {
    base: "/alevinaje",
    byId: (id) => `/alevinaje/${id}`,
  },

  siembras: {
    base: "/siembras",
    byId: (id) => `/siembras/${id}`,
  },

  equipos: {
    base: "/equipos",
    empleados: "/equipos/empleados",
    byUsuario: (usuarioId) => `/equipos/${usuarioId}`,
    byId: (id) => `/equipos/${id}`,
    mantenimientos: (equipoId) => `/equipos/${equipoId}/mantenimientos`,
    mantenimientoById: (mantenimientoId) => `/equipos/mantenimientos/${mantenimientoId}`,
  },

  clientes: {
    base: "/clientes",
    byId: (id) => `/clientes/${id}`,
    empleadosActivos: "/clientes/empleados-activos",
  },

  ventas: {
    base: "/ventas",
    byId: (id) => `/ventas/${id}`,
    clientes: "/ventas/clientes",
    encargados: (empresa) => `/ventas/encargados/${path(empresa)}`,
  },

  listaEspera: {
    base: "/lista-espera",
    byId: (id) => `/lista-espera/${id}`,
    convertir: (id) => `/lista-espera/convertir/${id}`,
  },

  proveedores: {
    base: "/proveedores",
    byId: (id) => `/proveedores/${id}`,
  },

  flujoCaja: {
    byGranja: (granja) => `/flujo-caja/${path(granja)}`,
    base: "/flujo-caja",
    byId: (id) => `/flujo-caja/${id}`,
    clientes: "/flujo-caja/clientes",
    proveedores: "/flujo-caja/proveedores",
    tesoreriaByGranja: (granja) => `/flujo-caja/tesoreria/${path(granja)}`,
  },

  tesoreria: {
    base: "/tesoreria",
  },

  cuentas: {
    base: "/cuentas",
    activos: "/cuentas/activos",
    byId: (id) => `/cuentas/${id}`,
    activate: (id) => `/cuentas/${id}/activate`,
    deactivate: (id) => `/cuentas/${id}/deactivate`,
  },

  cajaAhorro: {
    base: "/caja-ahorro",
    byGranja: (granja) => `/caja-ahorro/${path(granja)}`,
    byId: (id) => `/caja-ahorro/${id}`,
  },

  empleados: {
    base: "/empleados",
    byId: (id) => `/empleados/${id}`,
    activate: (id) => `/empleados/${id}/activate`,
    deactivate: (id) => `/empleados/${id}/deactivate`,
    miPerfil: "/empleados/mi-perfil",
  },

  departamentos: {
    base: "/departamentos",
    activos: "/departamentos/activos",
    byId: (id) => `/departamentos/${id}`,
    activate: (id) => `/departamentos/${id}/activate`,
    deactivate: (id) => `/departamentos/${id}/deactivate`,
  },

  puestos: {
    base: "/puestos",
    activos: "/puestos/activos",
    byId: (id) => `/puestos/${id}`,
    activate: (id) => `/puestos/${id}/activate`,
    deactivate: (id) => `/puestos/${id}/deactivate`,
  },

  tiposDocumento: {
    base: "/tipos-documento",
    activos: "/tipos-documento/activos",
    byId: (id) => `/tipos-documento/${id}`,
  },

  documentosEmpleado: {
    byEmpleado: (empleadoId) => `/documentos-empleado/${empleadoId}`,
    uploadByEmpleado: (empleadoId) => `/documentos-empleado/${empleadoId}/upload`,
    view: (documentoId) => `/documentos-empleado/view/${documentoId}`,
    download: (documentoId) => `/documentos-empleado/download/${documentoId}`,
    byId: (documentoId) => `/documentos-empleado/${documentoId}`,
    misDocumentos: "/documentos-empleado/mis-documentos",
    uploadMio: "/documentos-empleado/mis-documentos/upload",
    viewMio: (documentoId) => `/documentos-empleado/mis-documentos/view/${documentoId}`,
    downloadMio: (documentoId) => `/documentos-empleado/mis-documentos/download/${documentoId}`,
    deleteMio: (documentoId) => `/documentos-empleado/mis-documentos/${documentoId}`,
  },

  actasAdministrativas: {
    byEmpleado: (empleadoId) => `/actas-administrativas/${empleadoId}`,
    upload: (empleadoId) => `/actas-administrativas/${empleadoId}/upload`,
    view: (actaId) => `/actas-administrativas/view/${actaId}`,
    download: (actaId) => `/actas-administrativas/download/${actaId}`,
    byId: (actaId) => `/actas-administrativas/${actaId}`,
  },

  nomina: {
    base: "/nomina",
    byId: (id) => `/nomina/${id}`,
  },

  vacaciones: {
    base: "/vacaciones",
    byId: (id) => `/vacaciones/${id}`,
  },

  unidadesNegocio: {
    base: "/unidades-negocio",
    activos: "/unidades-negocio/activos",
    byId: (id) => `/unidades-negocio/${id}`,
    activate: (id) => `/unidades-negocio/${id}/activate`,
    deactivate: (id) => `/unidades-negocio/${id}/deactivate`,
  },

  ubicaciones: {
    base: "/ubicaciones",
    activos: "/ubicaciones/activos",
    byId: (id) => `/ubicaciones/${id}`,
    activate: (id) => `/ubicaciones/${id}/activate`,
    deactivate: (id) => `/ubicaciones/${id}/deactivate`,
  },

  bitacoras: {
    biometrias: {
      base: "/biometrias",
      empleados: "/biometrias/empleados",
      info: (granja, instalacion) => `/biometrias/info/${path(granja)}/${instalacion}`,
      byGranja: (granja) => `/biometrias/${path(granja)}`,
      byId: (id) => `/biometrias/${id}`,
    },
    plagas: {
      base: "/plagas",
      empleados: "/plagas/empleados",
      byId: (id) => `/plagas/${id}`,
    },
    alimentacion: {
      base: "/alimentacion",
      byId: (id) => `/alimentacion/${id}`,
    },
    insumos: {
      base: "/insumos",
      empleados: "/insumos/empleados",
      byId: (id) => `/insumos/${id}`,
    },
    recepcionInsumos: {
      base: "/recepcion_insumos",
      empleados: "/recepcion_insumos/empleados",
      byId: (id) => `/recepcion_insumos/${id}`,
    },
    visitas: {
      base: "/visitas",
      byId: (id) => `/visitas/${id}`,
    },
    banos: {
      base: "/banos",
      empleados: "/banos/empleados",
      byId: (id) => `/banos/${id}`,
    },
    parametros: {
      base: "/parametros",
      empleados: "/parametros/empleados",
      byId: (id) => `/parametros/${id}`,
    },
    medicamentos: {
      base: "/medicamentos",
      empleados: "/medicamentos/empleados",
      byId: (id) => `/medicamentos/${id}`,
    },
    recambios: {
      base: "/recambios",
      empleados: "/recambios/empleados",
      byId: (id) => `/recambios/${id}`,
    },
    inventario: {
      base: "/inventario",
      byId: (id) => `/inventario/${id}`,
    },
  },
};

export default ENDPOINTS;
