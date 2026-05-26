import React, { useState, useEffect, useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
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
import Typography from "@mui/material/Typography";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import { listMovimientos, createMovimiento } from "../services/trazabilidadService";
import { listPiletas } from "../services/piletasService";
import { listLista } from "@features/ventas/services/listaEsperaService";

const TIPOS_MOVIMIENTO = [
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

function formatFecha(value) {
  if (!value) return "—";
  const s = String(value);
  return s.includes("T") ? s.split("T")[0] : s.slice(0, 10);
}

const EMPTY_FORM = {
  tipo_movimiento: "ALEVINAJE_A_ALEVINAJE",
  lista_espera_id: "",
  pileta_origen_id: "",
  pileta_destino_id: "",
  cantidad: "",
  mortalidad: "",
  fecha_movimiento: "",
  observacion: "",
};

export default function Trazabilidad() {
  const showSnackbar = useSnackbar();
  const { ubicacionesGranja, defaultUbicacion } = useUbicacionesGranja();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } =
    useFormularioVisible();

  const [granja, setGranja] = useState(defaultUbicacion || "");
  const [form, setForm] = useState(EMPTY_FORM);
  const [movimientos, setMovimientos] = useState([]);
  const [piletas, setPiletas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(false);

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
    const id = form.pileta_origen_id || pedidoSeleccionado?.pileta_origen_id;
    if (!id) return null;
    return piletasOrigen.find(
      (p) => String(p.fi_pileta_id ?? p.pileta_id) === String(id),
    ) ?? null;
  }, [form.pileta_origen_id, pedidoSeleccionado, piletasOrigen]);

  const cantidadVenta = Number(pedidoSeleccionado?.fn_cantidad ?? pedidoSeleccionado?.cantidad_peces ?? 0);
  const stockOrigen = piletaOrigenSeleccionada != null ? stockPileta(piletaOrigenSeleccionada) : null;
  const esVenta = tipoConfig.modo === "VENTA";
  const esMortalidad = tipoConfig.modo === "MORTALIDAD";
  const esTraslado = tipoConfig.modo === "TRASLADO";

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

  const cargarMovimientos = useCallback(async () => {
    if (!granja) return;
    try {
      const res = await listMovimientos(granja);
      setMovimientos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al cargar movimientos:", err);
      setMovimientos([]);
    }
  }, [granja]);

  const cargarPiletas = useCallback(async () => {
    if (!granja) return;
    try {
      const [alevRes, engRes] = await Promise.all([
        listPiletas(granja, "alevinaje"),
        listPiletas(granja, "engorda"),
      ]);
      const rows = [
        ...(Array.isArray(alevRes.data) ? alevRes.data : []),
        ...(Array.isArray(engRes.data) ? engRes.data : []),
      ];
      setPiletas(rows);
    } catch (err) {
      console.error("Error al cargar piletas:", err);
      setPiletas([]);
    }
  }, [granja]);

  const cargarPedidos = useCallback(async () => {
    try {
      const res = await listLista();
      const rows = Array.isArray(res.data) ? res.data : [];
      setPedidos(
        rows.filter((p) => {
          const tipo = String(p.fc_uap_asignada ?? p.tipo_venta ?? "").trim().toUpperCase();
          const granjaPedido = p.fc_granja_asignada ?? p.granja ?? "";
          return TIPOS_VENTA_TRAZABLES.has(tipo) && !p.venta_id && !p.fi_venta_id && granjaPedido === granja;
        }),
      );
    } catch (err) {
      console.error("Error al cargar pedidos:", err);
      setPedidos([]);
    }
  }, [granja]);

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
        next.pileta_origen_id = "";
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
      const piletaId = form.pileta_origen_id || pedidoSeleccionado?.pileta_origen_id;
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
        form.pileta_origen_id || pedidoSeleccionado?.pileta_origen_id,
      );
    } else if (esMortalidad) {
      payload.pileta_origen_id = Number(form.pileta_origen_id);
      payload.cantidad = Number(form.cantidad);
    } else {
      payload.pileta_origen_id = Number(form.pileta_origen_id);
      payload.pileta_destino_id = Number(form.pileta_destino_id);
      payload.cantidad = Number(form.cantidad);
      if (form.mortalidad) payload.mortalidad = Number(form.mortalidad);
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

  const etiquetaPedido = (p) => {
    const cliente = p.fc_cliente ?? p.cliente_nombre ?? "Cliente";
    const cant = formatStock(p.fn_cantidad ?? p.cantidad_peces);
    const fecha = formatFecha(p.fd_fecha_entrega ?? p.fecha_entrega);
    return `#${p.fi_lista_id} · ${cliente} · ${cant} org. · ${fecha}`;
  };

  const etiquetaPileta = (p) => `${p.nombre} — ${formatStock(stockPileta(p))} org.`;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Trazabilidad
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
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
        <Grid size={{ xs: 12, md: 8 }} sx={{ display: "flex", alignItems: "center" }}>
          <Button
            variant="contained"
            startIcon={<AddCircleIcon />}
            onClick={mostrarFormulario ? cerrarFormulario : abrirFormulario}
          >
            {mostrarFormulario ? "Ocultar formulario" : "Nuevo movimiento"}
          </Button>
        </Grid>
      </Grid>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Registrar movimiento
            </Typography>

            <Grid container spacing={2}>
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
                          : "Al registrar se creará la venta y se descontará inventario"
                      }
                    >
                      <MenuItem value="">— Seleccionar pedido —</MenuItem>
                      {pedidosVenta.map((p) => (
                        <MenuItem key={p.fi_lista_id} value={String(p.fi_lista_id)}>
                          {etiquetaPedido(p)}
                        </MenuItem>
                      ))}
                    </TextField>
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
                      value={form.pileta_origen_id || (pedidoSeleccionado?.pileta_origen_id ? String(pedidoSeleccionado.pileta_origen_id) : "")}
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
                    <TextField
                      fullWidth
                      type="number"
                      label="Cantidad de bajas"
                      name="cantidad"
                      value={form.cantidad}
                      onChange={handleChange}
                      inputProps={{ min: 1 }}
                      helperText="Organismos que murieron en la pileta"
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
                    <TextField
                      fullWidth
                      type="number"
                      label="Cantidad"
                      name="cantidad"
                      value={form.cantidad}
                      onChange={handleChange}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Mortalidad en traslado (opcional)"
                      name="mortalidad"
                      value={form.mortalidad}
                      onChange={handleChange}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
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

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Historial de movimientos
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Origen</TableCell>
                <TableCell>Destino</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell>Observación</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movimientos.map((row) => (
                <TableRow key={row.fi_movimiento_id}>
                  <TableCell>{formatFecha(row.fecha_movimiento)}</TableCell>
                  <TableCell>{row.fc_etapa ?? "—"}</TableCell>
                  <TableCell>{row.origen ?? "—"}</TableCell>
                  <TableCell>{row.destino ?? "—"}</TableCell>
                  <TableCell align="right">{formatStock(row.cantidad_trasladada)}</TableCell>
                  <TableCell>{row.observacion ?? "—"}</TableCell>
                </TableRow>
              ))}
              {movimientos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No hay movimientos registrados para esta granja.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
