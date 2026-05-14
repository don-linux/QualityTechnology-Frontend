import React, { useState, useEffect, useCallback } from "react";
import {
  listAlevinaje,
  createAlevinaje,
  updateAlevinaje,
  removeAlevinaje,
  listReproductoresOcupadas,
  getFamiliaPorPileta,
} from "../services/alevinajeService";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import AddCircleIcon from "@mui/icons-material/AddCircle";

// *** IMPORTANTE: USAR AXIOS INSTANCE CON TOKEN ***
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import { listPiletas } from "../services/piletasService";

const MAX_NUMERICO = 15;
const MAX_OBSERVACION = 500;
const TRUNCAR_MAX = 40;

const soloDecimal = (valor) => valor === "" || /^\d*\.?\d*$/.test(valor);
const soloEntero = (valor) => valor === "" || /^\d+$/.test(valor);
const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;

const ControlReproductivo = () => {
  const showSnackbar = useSnackbar();
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();
  const { ubicacionesGranja, defaultUbicacion, resolveFiltroUbicacion } = useUbicacionesGranja();

  const requiredFields = [
    "fecha",
    "familia",
    "fi_pileta_id",
    "huevos_ml",
    "ovadas",
    "no_lote",
    "observacion",
    "mortalidad",
    "machos",
    "hembras",
  ];

  const [granja, setGranja] = useState("");
  const [piletasReproductoras, setPiletasReproductoras] = useState([]);
  const [piletasDestinoAlevinaje, setPiletasDestinoAlevinaje] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [formData, setFormData] = useState({
    fecha: "",
    familia: "",
    fi_pileta_id: "",
    fi_pileta_destino_id: "",
    huevos_ml: "",
    ovadas: "",
    no_lote: "",
    observacion: "",
    mortalidad: 0,
    machos: "",
    hembras: "",
  });

  const cantidadTotalAlevines = () => {
    const m = Number(formData.machos || 0);
    const h = Number(formData.hembras || 0);
    return Number.isFinite(m) && Number.isFinite(h) ? m + h : null;
  };

  const payloadComunBackend = () => {
    const origen = formData.fi_pileta_id;
    const destino = formData.fi_pileta_destino_id || origen;
    const machosNum = Number(formData.machos || 0);
    const hembrasNum = Number(formData.hembras || 0);
    const cantTot = cantidadTotalAlevines() ?? 0;
    const mismoPool = Number(origen) === Number(destino);
    return {
      fecha: formData.fecha,
      familia: formData.familia,
      fi_pileta_id: origen,
      pileta_origen_reproductora_id: mismoPool ? null : Number(origen),
      pileta_destino_id: Number(destino),
      fi_pileta_destino_id: destino,
      pileta_id: Number(destino),
      no_lote: formData.no_lote,
      lote: formData.no_lote,
      huevos_ml: formData.huevos_ml === "" ? null : formData.huevos_ml,
      ovadas: Number(formData.ovadas || 0),
      observacion: formData.observacion,
      mortalidad: Number(formData.mortalidad || 0),
      machos: machosNum,
      hembras: hembrasNum,
      cantidad_total: cantTot,
      alevines_inicial: cantTot,
      alevines_iniciales: cantTot,
    };
  };

  const validarNoLote = (value) => {
    const regex = /^[A-Za-z0-9-]*$/;
    return regex.test(value) ? value.toUpperCase() : "";
  };

  const handleChange = async (e) => {

  const { name, value } = e.target;

  if (name === "no_lote") {
    setFormData({ ...formData, no_lote: validarNoLote(value) });
    clearFieldError(name);
    return;
  }

  if (name === "huevos_ml") {
    if (!soloDecimal(value)) return;
    setFormData({ ...formData, huevos_ml: value });
    clearFieldError(name);
    return;
  }

  if (name === "machos" || name === "hembras") {
    if (!soloEntero(value)) return;
    setFormData({ ...formData, [name]: value });
    clearFieldError(name);
    return;
  }

  if (name === "fi_pileta_id") {
    setFormData({ ...formData, fi_pileta_id: value });

    clearFieldError(name);

    try {

      const fam = await getFamiliaPorPileta(value);

      if (fam.data?.familia != null && fam.data.familia !== "") {
       setFormData((prev) => ({
        ...prev,
        familia: fam.data.familia || ""
      }));
      } else {
        setFormData((prev) => ({ ...prev, familia: "" }));
      }

    } catch (err) {

      console.log("Error cargando familia:", err);

    }

    return;
  }

  setFormData({ ...formData, [name]: value });
  clearFieldError(name);

};
  /** Piletas etapa reproductores ocupadas (`GET /alevinaje/reproductores/:granja` + `ubicacion_id`). */
  const cargarPiletasReproductoras = useCallback(async () => {
    if (!granja) return;
    try {
      const filtros = resolveFiltroUbicacion(granja);
      const res = await listReproductoresOcupadas(filtros);
      setPiletasReproductoras(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando piletas reproductoras:", err);
    }
  }, [granja, resolveFiltroUbicacion]);

  const cargarPiletasDestinoAlevinaje = useCallback(async () => {
    if (!granja) return;
    try {
      const filtros = resolveFiltroUbicacion(granja);
      const res = await listPiletas(filtros, "alevinaje");
      setPiletasDestinoAlevinaje(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando piletas alevinaje (destino):", err);
    }
  }, [granja, resolveFiltroUbicacion]);

  /** Registros de `alevinaje` filtrados por sede (misma granja que piletas). */
  const cargarRegistros = useCallback(async () => {
    if (!granja) return;
    try {
      const filtros = resolveFiltroUbicacion(granja);
      const res = await listAlevinaje(filtros);
      setRegistros(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando registros de alevinaje:", err);
    }
  }, [granja, resolveFiltroUbicacion]);

  useEffect(() => {
    if (!granja && defaultUbicacion) {
      setGranja(defaultUbicacion);
      return;
    }

    if (!granja) return;
    cargarPiletasReproductoras();
    cargarPiletasDestinoAlevinaje();
  }, [
    defaultUbicacion,
    granja,
    cargarPiletasReproductoras,
    cargarPiletasDestinoAlevinaje,
  ]);

  useEffect(() => {
    if (!granja) return;
    cargarRegistros();
  }, [granja, cargarRegistros]);

  /* --------------------------------------------------------
     Registrar alevinaje
  -------------------------------------------------------- */
  const registrarAlevinaje = async () => {
    if (!validate(formData, requiredFields)) return;
    const totCant = cantidadTotalAlevines();
    if (totCant === null || totCant < 1) {
      showSnackbar(
        "Indica cantidad de machos y hembras: la suma debe ser mayor a cero.",
        "error",
      );
      return;
    }
    try {
      await createAlevinaje(payloadComunBackend());

      showSnackbar("Registro guardado en alevinaje", "success");
      resetFormulario();
      actualizarTabla();
    } catch (err) {
      console.error(" Error al registrar alevinaje:", err);
      showSnackbar(
        err?.response?.data?.error ||
          err?.response?.data?.detalle ||
          "Error al registrar",
        "error",
      );
    }
  };

  /* --------------------------------------------------------
     Activar edición
  -------------------------------------------------------- */
  const activarEdicion = () => {
    if (!seleccionado) return;
    clearErrors();

    setFormData({
      fecha: seleccionado.fecha
        ? String(seleccionado.fecha).split("T")[0]
        : "",
      familia: seleccionado.familia || "",
      fi_pileta_id: String(
        seleccionado.pileta_origen_reproductora_id
          ?? seleccionado.fi_pileta_origen_reproductora_id
          ?? seleccionado.fi_pileta_origen_id
          ?? seleccionado.pileta_id
          ?? seleccionado.fi_pileta_destino_id
          ?? seleccionado.pileta_destino_id
          ?? "",
      ),
      fi_pileta_destino_id: String(
        seleccionado.fi_pileta_destino_id
          ?? seleccionado.pileta_destino_id
          ?? seleccionado.pileta_id
          ?? "",
      ),
      huevos_ml:
        seleccionado.huevos_ml != null ? String(seleccionado.huevos_ml) : "",
      ovadas: seleccionado.ovadas ?? "",
      no_lote: seleccionado.no_lote ?? seleccionado.lote ?? "",
      observacion:
        seleccionado.observacion
        ?? seleccionado.fc_observacion
        ?? "",
      mortalidad: seleccionado.mortalidad ?? 0,
      ...(function sexosDesdeSeleccionado() {
        const cq = Number(seleccionado.cantidad_total ?? seleccionado.alevines_iniciales ?? 0);
        let m =
          seleccionado.machos != null ? Number(seleccionado.machos) : null;
        let h =
          seleccionado.hembras != null ? Number(seleccionado.hembras) : null;
        if ((m === null || Number.isNaN(m)) && (h === null || Number.isNaN(h)) && cq > 0) {
          m = cq;
          h = 0;
        }
        if (m === null || Number.isNaN(m)) m = 0;
        if (h === null || Number.isNaN(h)) h = 0;
        return { machos: String(m), hembras: String(h) };
      }()),
    });

    setModoEdicion(true);
  };

  /* --------------------------------------------------------
     Guardar cambios de edición
  -------------------------------------------------------- */
  const actualizarAlevinajeRegistro = async () => {
    if (!validate(formData, requiredFields)) return;
    const totCant = cantidadTotalAlevines();
    if (totCant === null || totCant < 1) {
      showSnackbar(
        "Indica cantidad de machos y hembras: la suma debe ser mayor a cero.",
        "error",
      );
      return;
    }
    try {
      await updateAlevinaje(seleccionado.fi_id ?? seleccionado.fi_lote_id ?? seleccionado.id, payloadComunBackend());

      showSnackbar("Registro actualizado", "success");

      resetEdicion();
      actualizarTabla();
    } catch (err) {
      console.error(" Error al actualizar alevinaje:", err);
      showSnackbar(
        err?.response?.data?.error ||
          err?.response?.data?.detalle ||
          "No se pudo actualizar",
        "error",
      );
    }
  };

  /* --------------------------------------------------------
     Eliminar registro
  -------------------------------------------------------- */
  const eliminarAlevinajeRegistro = async (id) => {
    if (!await confirm("¿Seguro que deseas eliminar este registro de alevinaje?")) return;

    try {
      await removeAlevinaje(id);
      showSnackbar("Registro eliminado", "success");
      actualizarTabla();
      resetEdicion();
    } catch (err) {
      console.error(" Error al eliminar alevinaje:", err);
      showSnackbar("No se pudo eliminar", "error");
    }
  };

  /* --------------------------------------------------------
     Helpers
  -------------------------------------------------------- */
  const actualizarTabla = () => {
    cargarRegistros();
  };

  const resetFormulario = () => {
    setFormData({
      fecha: "",
      familia: "",
      fi_pileta_id: "",
      fi_pileta_destino_id: "",
      huevos_ml: "",
      ovadas: "",
      no_lote: "",
      observacion: "",
      mortalidad: 0,
      machos: "",
      hembras: "",
    });
    clearErrors();
  };

  const resetEdicion = () => {
    setModoEdicion(false);
    setSeleccionado(null);
    resetFormulario();
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "";
    const d = new Date(fechaISO);
    return d.toLocaleDateString("es-MX");
  };

 const formatNumber = (num) => {
  if (num === null || num === undefined) return "";

  const n = Number(num);

  if (Number.isInteger(n)) {
    return n.toString(); // sin decimales
  }

  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

  return (
    <div style={{ padding: "25px" }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#004d73" }}>
         Control reproductivo — Alevinaje
      </Typography>

      {/* ----------------- BOTONES DE GRANJA ----------------- */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {ubicacionesGranja.map((op) => (
          <Grid size="auto" key={op.value}>
            <Button
              variant={granja === op.value ? "contained" : "outlined"}
              onClick={() => setGranja(op.value)}
              sx={{
                background: granja === op.value ? "#0077b6" : "",
                color: granja === op.value ? "white" : "#0077b6",
                borderColor: "#0077b6",
              }}
            >
              {op.label}
            </Button>
          </Grid>
        ))}
      </Grid>

      {/* ----------------- FORMULARIO ----------------- */}
      <Card sx={{ mb: 5, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#005f73" }}>
            {modoEdicion ? " Editar registro" : "Registrar nuevo alevinaje"}
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            {/* FECHA */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Fecha"
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.fecha}
                helperText={errors.fecha}
              />
            </Grid>

            {/* FAMILIA */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Familia"
                name="familia"
                value={formData.familia}
                onChange={handleChange}
                fullWidth
                error={!!errors.familia}
                helperText={errors.familia}
              />
            </Grid>

            {/* PILETA ORIGEN */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                select
                label="Pileta origen (reproductores)"
                name="fi_pileta_id"
                value={formData.fi_pileta_id || ""}
                onChange={handleChange}
                fullWidth
                error={!!errors.fi_pileta_id}
                helperText={
                  errors.fi_pileta_id ||
                  "Piletas reproductores ocupadas. La familia se autocompleta desde aquí."
                }
              >
                {piletasReproductoras.map((p) => (
                  <MenuItem
                    key={p.fi_pileta_id ?? p.pileta_id}
                    value={String(p.fi_pileta_id ?? p.pileta_id)}
                  >
                    {p.nombre_pileta ?? p.nombre_instalacion}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* PILETA DESTINO */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                select
                label="Pileta destino (alevinaje)"
                name="fi_pileta_destino_id"
                value={formData.fi_pileta_destino_id || ""}
                onChange={handleChange}
                fullWidth
                error={!!errors.fi_pileta_destino_id}
                helperText={
                  errors.fi_pileta_destino_id ||
                  "Donde permanece este cargamento. Vacío = mismo acto físico solo en pileta origen."
                }
              >
                <MenuItem value="">
                  <em>(Igual que origen — conversión en la misma pileta)</em>
                </MenuItem>
                {piletasDestinoAlevinaje.map((p) => (
                  <MenuItem key={p.id} value={String(p.id)}>
                    {p.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Machos / hembras / total */}
            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                label="Machos"
                name="machos"
                type="number"
                value={formData.machos}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0, inputMode: "numeric" }}
                error={!!errors.machos}
                helperText={errors.machos}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                label="Hembras"
                name="hembras"
                type="number"
                value={formData.hembras}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0, inputMode: "numeric" }}
                error={!!errors.hembras}
                helperText={errors.hembras}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                label="Cantidad total"
                value={
                  cantidadTotalAlevines() != null
                    ? String(cantidadTotalAlevines())
                    : ""
                }
                disabled
                fullWidth
                placeholder="Machos + hembras"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                label="Mortalidad"
                name="mortalidad"
                type="number"
                value={formData.mortalidad}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0, inputMode: "numeric" }}
                error={!!errors.mortalidad}
                helperText={errors.mortalidad || "Ej. 0 al registrar"}
              />
            </Grid>

            {/* HUEVOS ML */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Huevos (ml)"
                name="huevos_ml"
                value={formData.huevos_ml}
                onChange={handleChange}
                fullWidth
                inputProps={{ maxLength: MAX_NUMERICO, inputMode: "decimal" }}
                error={!!errors.huevos_ml}
                helperText={
                  errors.huevos_ml ||
                  `${String(formData.huevos_ml ?? "").length}/${MAX_NUMERICO}`
                }
              />
            </Grid>

            {/* OVADAS */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Ovadas"
                name="ovadas"
                type="number"
                value={formData.ovadas}
                onChange={handleChange}
                fullWidth
                error={!!errors.ovadas}
                helperText={errors.ovadas}
              />
            </Grid>

            {/* LOTE */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Lote (referencia cría)"
                name="no_lote"
                value={formData.no_lote}
                onChange={handleChange}
                fullWidth
                error={!!errors.no_lote}
                helperText={errors.no_lote || "Código del cargamento guardado como `lote` en alevinaje."}
              />
            </Grid>

            {/* OBSERVACIÓN */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Observación"
                name="observacion"
                value={formData.observacion}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                inputProps={{ maxLength: MAX_OBSERVACION }}
                error={!!errors.observacion}
                helperText={
                  errors.observacion ||
                  `${String(formData.observacion ?? "").length}/${MAX_OBSERVACION}`
                }
              />
            </Grid>

            {/* BOTÓN REGISTRAR */}
            <Grid size={12}>
              <Button
                variant="contained"
                startIcon={<AddCircleIcon />}
                color="success"
                onClick={modoEdicion ? actualizarAlevinajeRegistro : registrarAlevinaje}
                sx={{ mt: 1, fontWeight: "bold" }}
              >
                {modoEdicion ? "Guardar Cambios" : "Registrar alevinaje"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ----------------- TABLA ----------------- */}
      <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", color: "#023047" }}>
        Registros (alevinaje) — {granja}
      </Typography>

      <Paper sx={{ width: "100%", borderRadius: 2, boxShadow: 3 }}>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 1550 }}>
            <TableHead sx={{ backgroundColor: "#006d77" }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Fecha</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Familia</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Origen repr.</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Destino alev.</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Huevos (ml)</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Ovadas</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Machos</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Hembras</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Total</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Lote cría</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Observación</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Mortalidad</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Mortalidad %</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {registros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} align="center">
                    No hay registros.
                  </TableCell>
                </TableRow>
              ) : (
                registros.map((l) => (
                  <TableRow
                    key={l.fi_id ?? l.id}
                    onClick={() => setSeleccionado(l)}
                    style={{
                      cursor: "pointer",
                      backgroundColor:
                        (seleccionado?.fi_id ?? seleccionado?.id) === (l.fi_id ?? l.id)
                          ? "#e0f7fa"
                          : "transparent",
                    }}
                  >
                    <TableCell>{formatearFecha(l.fecha)}</TableCell>
                    <TableCell sx={{ maxWidth: 160 }}>
                      <span title={l.familia || ""}>
                        {l.familia ? truncar(l.familia) : "—"}
                      </span>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 140 }}>
                      <span title={l.nombre_pileta_origen_reproductora || ""}>
                        {l.nombre_pileta_origen_reproductora
                          ? truncar(l.nombre_pileta_origen_reproductora)
                          : "—"}
                      </span>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 140 }}>
                      <span title={(l.nombre_pileta_destino || l.nombre_pileta) || ""}>
                        {(l.nombre_pileta_destino || l.nombre_pileta)
                          ? truncar(l.nombre_pileta_destino || l.nombre_pileta)
                          : "—"}
                      </span>
                    </TableCell>
                    <TableCell>{formatNumber(l.huevos_ml)}</TableCell>
                    <TableCell>{l.ovadas}</TableCell>
                    <TableCell>{formatNumber(l.machos ?? 0)}</TableCell>
                    <TableCell>{formatNumber(l.hembras ?? 0)}</TableCell>
                    <TableCell>
                      {formatNumber(l.cantidad_total ?? l.alevines_inicial ?? l.alevines_iniciales ?? 0)}
                    </TableCell>
                    <TableCell>{l.no_lote}</TableCell>
                    <TableCell sx={{ maxWidth: 160 }}>
                      <span title={l.observacion || ""}>
                        {l.observacion ? truncar(l.observacion) : "—"}
                      </span>
                    </TableCell>
                    <TableCell>{formatNumber(l.mortalidad || 0)}</TableCell>
                    <TableCell>{Number(l.mortalidad_porcentaje || 0).toFixed(2)}%</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ----------------- BOTONES EDITAR / ELIMINAR ----------------- */}
      {seleccionado && (
        <div style={{ marginTop: "20px", display: "flex", gap: "15px" }}>
          <Button variant="contained" color="warning" onClick={activarEdicion}>
             Editar registro
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={() => eliminarAlevinajeRegistro(seleccionado.fi_id ?? seleccionado.fi_lote_id)}
          >
             Eliminar registro
          </Button>

          <Button variant="outlined" color="inherit" onClick={resetEdicion}>
             Cerrar
          </Button>
        </div>
      )}
      {ConfirmModal}
    </div>
  );
};

export default ControlReproductivo;