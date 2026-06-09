import React, { useState, useEffect, useCallback, useMemo } from "react";
import { formatFecha } from "@shared/utils/formatters";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import TablasPorUbicacionGranja from "@shared/components/TablasPorUbicacionGranja";
import {
  fetchMergedPorUbicaciones,
  filtrarPorUbicacion,
} from "@shared/utils/fetchMergedPorUbicaciones";
import { rowPerteneceAUbicacionGranja } from "@shared/utils/unidadesNegocio";
import ProximaVentaModal from "@features/ventas/components/ProximaVentaModal";
import CampoNumerico from "@shared/components/CampoNumerico";
import { listMovimientos, createMovimiento } from "../services/trazabilidadService";
import { listPiletas } from "../services/piletasService";
import { listLista } from "@features/ventas/services/listaEsperaService";

const TIPOS_MOVIMIENTO = [
  {
    value: "INCUBACION_A_ALEVINAJE",
    label: "De incubación a alevinaje",
    etapaOrigen: "incubacion",
    etapaDestino: "alevinaje",
    modo: "TRASLADO",
  },
  {
    value: "ALEVINAJE_A_ALEVINAJE",
    label: "De alevinaje a alevinaje",
    etapaOrigen: "alevinaje",
    etapaDestino: "alevinaje",
    modo: "TRASLADO",
  },
  {
    value: "ALEVINAJE_A_ENGORDA",
    label: "De alevinaje a engorda",
    etapaOrigen: "alevinaje",
    etapaDestino: "engorda",
    modo: "TRASLADO",
  },
  {
    value: "ALEVINAJE_A_VENTA",
    label: "De alevinaje a venta",
    etapaOrigen: "alevinaje",
    etapaDestino: null,
    modo: "VENTA",
  },
  {
    value: "ENGORDA_A_ENGORDA",
    label: "De engorda a engorda",
    etapaOrigen: "engorda",
    etapaDestino: "engorda",
    modo: "TRASLADO",
  },
  {
    value: "ENGORDA_A_VENTA",
    label: "De engorda a venta",
    etapaOrigen: "engorda",
    etapaDestino: null,
    modo: "VENTA",
  },
  {
    value: "MORTALIDAD_ALEVINAJE",
    label: "Mortalidad en alevinaje",
    etapaOrigen: "alevinaje",
    etapaDestino: null,
    modo: "MORTALIDAD",
  },
  {
    value: "MORTALIDAD_ENGORDA",
    label: "Mortalidad en engorda",
    etapaOrigen: "engorda",
    etapaDestino: null,
    modo: "MORTALIDAD",
  },
];

function configTipoMovimiento(value) {
  return TIPOS_MOVIMIENTO.find((t) => t.value === value) ?? TIPOS_MOVIMIENTO[0];
}

function piletasPorEtapa(piletas, etapa, soloConStock = false) {
  return piletas.filter((p) => {
    const tipo = String(p.tipo ?? p.fc_tipo ?? "").toLowerCase();
    if (tipo !== etapa) return false;
    return soloConStock ? stockPileta(p) > 0 : true;
  });
}

const TIPOS_VENTA_TRAZABLES = new Set(["ALEVIN", "ALEVINES", "KG", "MOJARRA_KG"]);

function etapaPiletaParaTipo(tipo) {
  const t = String(tipo ?? "").trim().toUpperCase();
  if (t === "ALEVIN" || t === "ALEVINES") return "alevinaje";
  if (t === "KG" || t === "MOJARRA_KG" || t === "MOJARRA") return "engorda";
  return null;
}

function stockPileta(p) {
  return Number(p?.cantidad ?? p?.fn_cantidad ?? 0);
}

function formatStock(num) {
  return Number(num ?? 0).toLocaleString("en-US");
}

function tipoVentaParaEtapa(etapa) {
  if (etapa === "alevinaje") return "ALEVIN";
  if (etapa === "engorda") return "KG";
  return "";
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function idPileta(p) {
  return p?.fi_pileta_id ?? p?.pileta_id ?? null;
}

function piletaOrigenIdDePedido(pedido) {
  if (!pedido) return "";
  const id = pedido.pileta_origen_id ?? pedido.fi_pileta_origen_id;
  return id ? String(id) : "";
}

function piletaOrigenIdUnica(piletas) {
  if (piletas.length !== 1) return "";
  const id = idPileta(piletas[0]);
  return id ? String(id) : "";
}

const EMPTY_FORM = {
  tipo_movimiento: "ALEVINAJE_A_ALEVINAJE",
  lista_espera_id: "",
  pileta_origen_id: "",
  pileta_destino_id: "",
  cantidad: "",
  mortalidad: "",
  peso_gramos: "",
  fecha_peso: "",
  fecha_movimiento: "",
  observacion: "",
};

export default function Trazabilidad() {
  const showSnackbar = useSnackbar();
  const { ubicacionesGranja, defaultUbicacion, resolveFiltroUbicacion, getGroups } =
    useUbicacionesGranja();
  const { visible: mostrarFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } =
    useFormularioVisible();

  const [granja, setGranja] = useState(defaultUbicacion || "");
  const [form, setForm] = useState(EMPTY_FORM);
  const [movimientos, setMovimientos] = useState([]);
  const [piletas, setPiletas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [openProximaVenta, setOpenProximaVenta] = useState(false);

  useEffect(() => {
    if (!granja && defaultUbicacion) setGranja(defaultUbicacion);
  }, [granja, defaultUbicacion]);

  const tipoConfig = useMemo(
    () => configTipoMovimiento(form.tipo_movimiento),
    [form.tipo_movimiento],
  );

  const pedidoSeleccionado = useMemo(() => {
    if (!form.lista_espera_id) return null;
    return pedidos.find((p) => String(p.fi_lista_id) === String(form.lista_espera_id)) ?? null;
  }, [form.lista_espera_id, pedidos]);

  const piletasOrigen = useMemo(
    () => piletasPorEtapa(piletas, tipoConfig.etapaOrigen, true),
    [piletas, tipoConfig.etapaOrigen],
  );

  const piletasDestino = useMemo(() => {
    if (!tipoConfig.etapaDestino) return [];
    return piletasPorEtapa(piletas, tipoConfig.etapaDestino, false);
  }, [piletas, tipoConfig.etapaDestino]);

  const piletaOrigenSeleccionada = useMemo(() => {
    const id = form.pileta_origen_id || piletaOrigenIdDePedido(pedidoSeleccionado);
    if (!id) return null;
    return piletasOrigen.find((p) => String(idPileta(p)) === String(id)) ?? null;
  }, [form.pileta_origen_id, pedidoSeleccionado, piletasOrigen]);

  const cantidadVenta = Number(pedidoSeleccionado?.fn_cantidad ?? pedidoSeleccionado?.cantidad_peces ?? 0);
  const stockOrigen = piletaOrigenSeleccionada != null ? stockPileta(piletaOrigenSeleccionada) : null;
  const esVenta = tipoConfig.modo === "VENTA";
  const esMortalidad = tipoConfig.modo === "MORTALIDAD";
  const esTraslado = tipoConfig.modo === "TRASLADO";
  const esIncubacionOrigen = tipoConfig.etapaOrigen === "incubacion";

  const cantidadMortalidad = Number(form.cantidad);
  const cantidadExcedeStockMortalidad =
    esMortalidad
    && stockOrigen != null
    && cantidadMortalidad > 0
    && cantidadMortalidad > stockOrigen;

  const cantidadExcedeStock =
    esVenta
    && stockOrigen != null
    && cantidadVenta > 0
    && cantidadVenta > stockOrigen;

  const pedidosVenta = useMemo(() => {
    if (!esVenta) return [];
    return pedidos.filter((p) => {
      const etapa = etapaPiletaParaTipo(p.fc_uap_asignada ?? p.tipo_venta);
      return etapa === tipoConfig.etapaOrigen;
    });
  }, [pedidos, esVenta, tipoConfig.etapaOrigen]);

  const proximaVentaDefaults = useMemo(() => {
    const granjaLabel = ubicacionesGranja.find((op) => op.value === granja)?.label ?? granja;
    const piletaId =
      form.pileta_origen_id
      || piletaOrigenIdDePedido(pedidoSeleccionado)
      || piletaOrigenIdUnica(piletasOrigen);
    const pileta = piletaId
      ? piletasOrigen.find((p) => String(idPileta(p)) === String(piletaId))
      : null;
    const stock = pileta ? stockPileta(pileta) : 0;

    return {
      fd_fecha_entrega: form.fecha_movimiento || hoyISO(),
      fc_uap_asignada: tipoVentaParaEtapa(tipoConfig.etapaOrigen),
      fc_granja_asignada: granja,
      pileta_origen_id: piletaId,
      fn_cantidad: stock > 0 ? String(stock) : "",
      fc_unidad_produccion: granjaLabel,
    };
  }, [
    granja,
    form.fecha_movimiento,
    form.pileta_origen_id,
    pedidoSeleccionado,
    tipoConfig.etapaOrigen,
    ubicacionesGranja,
    piletasOrigen,
  ]);

  const cargarMovimientos = useCallback(async () => {
    if (!ubicacionesGranja.length) {
      setMovimientos([]);
      return;
    }
    try {
      const filtros = ubicacionesGranja.map((op) => resolveFiltroUbicacion(op.value));
      const rows = await fetchMergedPorUbicaciones(filtros, listMovimientos);
      setMovimientos(rows);
    } catch (err) {
      console.error("Error al cargar movimientos:", err);
      setMovimientos([]);
    }
  }, [ubicacionesGranja, resolveFiltroUbicacion]);

  const cargarPiletas = useCallback(async () => {
    if (!granja) return;
    try {
      const [alevRes, engRes, incRes] = await Promise.all([
        listPiletas(null, "alevinaje"),
        listPiletas(null, "engorda"),
        listPiletas(null, "incubacion"),
      ]);
      const rows = [
        ...(Array.isArray(alevRes.data) ? alevRes.data : []),
        ...(Array.isArray(engRes.data) ? engRes.data : []),
        ...(Array.isArray(incRes.data) ? incRes.data : []),
      ];
      setPiletas(filtrarPorUbicacion(rows, granja, ubicacionesGranja));
    } catch (err) {
      console.error("Error al cargar piletas:", err);
      setPiletas([]);
    }
  }, [granja, ubicacionesGranja]);

  const cargarPedidos = useCallback(async () => {
    try {
      const res = await listLista();
      const rows = Array.isArray(res.data) ? res.data : [];
      const granjaOp = ubicacionesGranja.find((op) => op.value === granja) ?? null;
      setPedidos(
        rows.filter((p) => {
          const tipo = String(p.fc_uap_asignada ?? p.tipo_venta ?? "").trim().toUpperCase();
          if (!TIPOS_VENTA_TRAZABLES.has(tipo) || p.venta_id || p.fi_venta_id) return false;
          if (!granja) return true;
          if (!granjaOp) {
            const granjaPedido = p.fc_granja_asignada ?? p.granja ?? "";
            return granjaPedido === granja;
          }
          return rowPerteneceAUbicacionGranja(p, granjaOp, "fc_granja_asignada");
        }),
      );
    } catch (err) {
      console.error("Error al cargar pedidos:", err);
      setPedidos([]);
    }
  }, [granja, ubicacionesGranja]);

  useEffect(() => {
    cargarMovimientos();
    cargarPiletas();
    cargarPedidos();
  }, [cargarMovimientos, cargarPiletas, cargarPedidos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "tipo_movimiento") {
        return {
          ...EMPTY_FORM,
          tipo_movimiento: value,
          fecha_movimiento: prev.fecha_movimiento,
        };
      }
      if (name === "lista_espera_id") {
        const pedido = pedidos.find((p) => String(p.fi_lista_id) === String(value));
        next.pileta_origen_id = piletaOrigenIdDePedido(pedido);
      }
      return next;
    });
  };

  const validarFormulario = () => {
    if (!granja) {
      showSnackbar("Seleccione una granja", "warning");
      return false;
    }

    if (esVenta) {
      if (!form.lista_espera_id) {
        showSnackbar("Seleccione un pedido de próximas ventas", "warning");
        return false;
      }
      const piletaId = form.pileta_origen_id || piletaOrigenIdDePedido(pedidoSeleccionado);
      if (!piletaId) {
        showSnackbar("Seleccione la pileta de origen", "warning");
        return false;
      }
      if (cantidadExcedeStock) {
        showSnackbar(
          `Stock insuficiente: disponible ${formatStock(stockOrigen)}, pedido ${formatStock(cantidadVenta)}`,
          "error",
        );
        return false;
      }
      return true;
    }

    const cantidad = Number(form.cantidad);
    if (!cantidad || cantidad <= 0) {
      showSnackbar("La cantidad debe ser mayor a cero", "warning");
      return false;
    }

    if (esMortalidad) {
      if (!form.pileta_origen_id) {
        showSnackbar("Seleccione la pileta", "warning");
        return false;
      }
      if (cantidadExcedeStockMortalidad) {
        showSnackbar(
          `Stock insuficiente: disponible ${formatStock(stockOrigen)}, mortalidad ${formatStock(cantidadMortalidad)}`,
          "error",
        );
        return false;
      }
      return true;
    }

    if (!form.pileta_origen_id || !form.pileta_destino_id) {
      showSnackbar("Seleccione pileta origen y destino", "warning");
      return false;
    }

    if (esIncubacionOrigen && (form.peso_gramos === "" || Number(form.peso_gramos) <= 0)) {
      showSnackbar("Ingrese el peso (g) de los alevines", "warning");
      return false;
    }

    return true;
  };

  const registrar = async () => {
    if (!validarFormulario()) return;

    const payload = {
      tipo_movimiento: form.tipo_movimiento,
      fecha_movimiento: form.fecha_movimiento || undefined,
      observacion: form.observacion || undefined,
    };

    if (esVenta) {
      payload.lista_espera_id = Number(form.lista_espera_id);
      payload.pileta_origen_id = Number(
        form.pileta_origen_id || piletaOrigenIdDePedido(pedidoSeleccionado),
      );
    } else if (esMortalidad) {
      payload.pileta_origen_id = Number(form.pileta_origen_id);
      payload.cantidad = Number(form.cantidad);
    } else {
      payload.pileta_origen_id = Number(form.pileta_origen_id);
      payload.pileta_destino_id = Number(form.pileta_destino_id);
      payload.cantidad = Number(form.cantidad);
      if (esIncubacionOrigen) {
        if (form.peso_gramos !== "") payload.peso_gramos = Number(form.peso_gramos);
        if (form.fecha_peso) payload.fecha_peso = form.fecha_peso;
      } else if (form.mortalidad) {
        payload.mortalidad = Number(form.mortalidad);
      }
    }

    setCargando(true);
    try {
      await createMovimiento(payload);
      showSnackbar(
        esVenta
          ? "Venta registrada en trazabilidad"
          : esMortalidad
            ? "Mortalidad registrada"
            : "Movimiento registrado",
        "success",
      );
      setForm({ ...EMPTY_FORM, fecha_movimiento: form.fecha_movimiento });
      cerrarFormulario();
      cargarMovimientos();
      cargarPiletas();
      cargarPedidos();
    } catch (err) {
      showSnackbar(err?.response?.data?.error || "Error al registrar movimiento", "error");
    } finally {
      setCargando(false);
    }
  };

  const abrirModalProximaVenta = () => {
    if (!granja) {
      showSnackbar("Seleccione una granja primero", "warning");
      return;
    }
    setOpenProximaVenta(true);
  };

  const handleProximaVentaCreada = (pedido) => {
    setPedidos((prev) => {
      const id = String(pedido.fi_lista_id);
      if (prev.some((p) => String(p.fi_lista_id) === id)) return prev;
      return [...prev, pedido];
    });
    setForm((prev) => ({
      ...prev,
      lista_espera_id: String(pedido.fi_lista_id ?? pedido.lista_id),
      pileta_origen_id: piletaOrigenIdDePedido(pedido) || prev.pileta_origen_id,
    }));
    cargarPedidos();
  };

  const etiquetaPedido = (p) => {
    const cliente = p.fc_cliente ?? p.cliente_nombre ?? "Cliente";
    const cant = formatStock(p.fn_cantidad ?? p.cantidad_peces);
    const fecha = formatFecha(p.fd_fecha_entrega ?? p.fecha_entrega);
    return `#${p.fi_lista_id} · ${cliente} · ${cant} org. · ${fecha}`;
  };

  const etiquetaPileta = (p) => {
    const tipo = String(p.tipo ?? p.fc_tipo ?? "").toLowerCase();
    if (tipo === "incubacion") return `${p.nombre} (lote en incubación)`;
    return `${p.nombre} — ${formatStock(stockPileta(p))} org.`;
  };

  const gruposMovimientos = useMemo(
    () => getGroups(movimientos, "fc_granja"),
    [getGroups, movimientos],
  );

  const renderTablaMovimientos = (rows) => (
    <Paper sx={{ width: "100%", borderRadius: 2, boxShadow: 3 }}>
      <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead sx={{ backgroundColor: "#006d77" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Fecha</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Tipo</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Origen</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Destino</TableCell>
              <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>
                Cantidad
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Usuario</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Observación</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay movimientos registrados.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.fi_movimiento_id}>
                  <TableCell>{formatFecha(row.fecha_movimiento)}</TableCell>
                  <TableCell>{row.fc_etapa ?? "—"}</TableCell>
                  <TableCell>{row.origen ?? "—"}</TableCell>
                  <TableCell>{row.destino ?? "—"}</TableCell>
                  <TableCell align="right">{formatStock(row.cantidad_trasladada)}</TableCell>
                  <TableCell>{row.fc_usuario ?? row.usuario_nombre ?? "—"}</TableCell>
                  <TableCell>{row.observacion ?? "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Trazabilidad
      </Typography>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Registrar movimiento
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Granja"
                  value={granja}
                  onChange={(e) => setGranja(e.target.value)}
                >
                  {ubicacionesGranja.map((op) => (
                    <MenuItem key={op.value} value={op.value}>
                      {op.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de movimiento</InputLabel>
                  <Select
                    name="tipo_movimiento"
                    value={form.tipo_movimiento}
                    label="Tipo de movimiento"
                    onChange={handleChange}
                  >
                    {TIPOS_MOVIMIENTO.map((t) => (
                      <MenuItem key={t.value} value={t.value}>
                        {t.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha del movimiento"
                  name="fecha_movimiento"
                  value={form.fecha_movimiento}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {esVenta && (
                <>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                      <TextField
                        select
                        fullWidth
                        label="Pedido (próxima venta)"
                        name="lista_espera_id"
                        value={form.lista_espera_id}
                        onChange={handleChange}
                        helperText={
                          pedidosVenta.length === 0
                            ? `No hay pedidos pendientes de ${tipoConfig.etapaOrigen} en esta granja`
                            : undefined
                        }
                        sx={{ flex: 1 }}
                      >
                        <MenuItem value="">— Seleccionar pedido —</MenuItem>
                        {pedidosVenta.map((p) => (
                          <MenuItem key={p.fi_lista_id} value={String(p.fi_lista_id)}>
                            {etiquetaPedido(p)}
                          </MenuItem>
                        ))}
                      </TextField>
                      <Tooltip title="Registrar nueva próxima venta">
                        <IconButton
                          color="primary"
                          aria-label="Registrar nueva próxima venta"
                          onClick={abrirModalProximaVenta}
                          sx={{ mt: 1 }}
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>

                  {pedidoSeleccionado && (
                    <Grid size={12}>
                      <Alert severity="info">
                        Cliente: <strong>{pedidoSeleccionado.fc_cliente}</strong>
                        {" · "}
                        Cantidad: {formatStock(cantidadVenta)} org.
                        {" · "}
                        Tipo: {pedidoSeleccionado.fc_uap_asignada ?? pedidoSeleccionado.tipo_venta}
                      </Alert>
                    </Grid>
                  )}

                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      fullWidth
                      label={`Pileta origen (${tipoConfig.etapaOrigen})`}
                      name="pileta_origen_id"
                      value={form.pileta_origen_id || piletaOrigenIdDePedido(pedidoSeleccionado)}
                      onChange={handleChange}
                      error={cantidadExcedeStock}
                      helperText={
                        cantidadExcedeStock
                          ? `Stock insuficiente: ${formatStock(stockOrigen)} disponibles`
                          : stockOrigen != null
                            ? `Disponible: ${formatStock(stockOrigen)} organismos`
                            : `Solo piletas de ${tipoConfig.etapaOrigen} con stock`
                      }
                    >
                      <MenuItem value="">— Seleccionar —</MenuItem>
                      {piletasOrigen.map((p) => (
                        <MenuItem key={p.fi_pileta_id ?? p.pileta_id} value={String(p.fi_pileta_id ?? p.pileta_id)}>
                          {etiquetaPileta(p)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </>
              )}

              {esMortalidad && (
                <>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      fullWidth
                      label={`Pileta (${tipoConfig.etapaOrigen})`}
                      name="pileta_origen_id"
                      value={form.pileta_origen_id}
                      onChange={handleChange}
                      error={cantidadExcedeStockMortalidad}
                      helperText={
                        cantidadExcedeStockMortalidad
                          ? `Stock insuficiente: ${formatStock(stockOrigen)} disponibles`
                          : stockOrigen != null
                            ? `Disponible: ${formatStock(stockOrigen)} organismos`
                            : `Piletas de ${tipoConfig.etapaOrigen} con stock`
                      }
                    >
                      <MenuItem value="">— Seleccionar —</MenuItem>
                      {piletasOrigen.map((p) => (
                        <MenuItem key={p.fi_pileta_id ?? p.pileta_id} value={String(p.fi_pileta_id ?? p.pileta_id)}>
                          {etiquetaPileta(p)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <CampoNumerico
                      fullWidth
                      decimalScale={0}
                      label="Cantidad de bajas"
                      name="cantidad"
                      value={form.cantidad}
                      onChange={handleChange}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                </>
              )}

              {esTraslado && (
                <>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      fullWidth
                      label={`Pileta origen (${tipoConfig.etapaOrigen})`}
                      name="pileta_origen_id"
                      value={form.pileta_origen_id}
                      onChange={handleChange}
                    >
                      <MenuItem value="">— Seleccionar —</MenuItem>
                      {piletasOrigen.map((p) => (
                        <MenuItem key={p.fi_pileta_id ?? p.pileta_id} value={String(p.fi_pileta_id ?? p.pileta_id)}>
                          {etiquetaPileta(p)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      fullWidth
                      label={`Pileta destino (${tipoConfig.etapaDestino})`}
                      name="pileta_destino_id"
                      value={form.pileta_destino_id}
                      onChange={handleChange}
                    >
                      <MenuItem value="">— Seleccionar —</MenuItem>
                      {piletasDestino.map((p) => (
                        <MenuItem key={p.fi_pileta_id ?? p.pileta_id} value={String(p.fi_pileta_id ?? p.pileta_id)}>
                          {etiquetaPileta(p)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <CampoNumerico
                      fullWidth
                      decimalScale={0}
                      label={esIncubacionOrigen ? "Cantidad de alevines" : "Cantidad"}
                      name="cantidad"
                      value={form.cantidad}
                      onChange={handleChange}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  {esIncubacionOrigen ? (
                    <>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <CampoNumerico
                          fullWidth
                          label="Peso (g)"
                          name="peso_gramos"
                          value={form.peso_gramos}
                          onChange={handleChange}
                          inputProps={{ min: 0, step: "any" }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Fecha peso"
                          name="fecha_peso"
                          value={form.fecha_peso}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </>
                  ) : (
                    <Grid size={{ xs: 12, md: 4 }}>
                      <CampoNumerico
                        fullWidth
                        decimalScale={0}
                        label="Mortalidad en traslado (opcional)"
                        name="mortalidad"
                        value={form.mortalidad}
                        onChange={handleChange}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                  )}
                </>
              )}

              {!esVenta && (
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Observación"
                    name="observacion"
                    value={form.observacion}
                    onChange={handleChange}
                  />
                </Grid>
              )}
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button variant="contained" onClick={registrar} disabled={cargando}>
                Registrar
              </Button>
            </Box>
          </CardContent>
        </Card>
      </FormularioRegistroPanel>

      <Typography variant="h6" sx={{ mb: 0.5, fontWeight: "bold", color: "#023047" }}>
        Historial de movimientos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Trazabilidad agrupada por sede, igual que en alevinaje y engorda.
      </Typography>

      <TablasPorUbicacionGranja
        grupos={gruposMovimientos}
        renderTabla={renderTablaMovimientos}
      />

      <ProximaVentaModal
        open={openProximaVenta}
        onClose={() => setOpenProximaVenta(false)}
        onCreated={handleProximaVentaCreada}
        defaults={proximaVentaDefaults}
        piletas={piletasOrigen}
        lockTipoVenta
        lockGranja
      />
    </Box>
  );
}
