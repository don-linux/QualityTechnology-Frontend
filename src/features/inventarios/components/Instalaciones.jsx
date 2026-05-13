import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  listByGranja,
  createInstalacion,
  updateInstalacion,
  removeInstalacion,
} from "../services/instalacionesService";
import { listPiletas } from "../services/piletasService";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Select from "@mui/material/Select";
import { listUbicacionesActivas } from "@features/catalogos/services/ubicacionesService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useAuth from "@app/providers/AuthProvider";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";

export default function Instalaciones() {
  return <InstalacionesContent />;
}

function InstalacionesContent() {
  const auth = useAuth();
  const usuario_id = auth.usuarioId;
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { ubicacionesGranja, defaultUbicacion, resolveFiltroUbicacion } =
    useUbicacionesGranja();

  const [ubicacionesCatalogo, setUbicacionesCatalogo] = useState([]);

  const requiredFields = [
    "nombre_instalacion",
    "largo",
    "ancho",
    "altura",
    "material",
    "estado",
    "tipo_instalacion",
    "ubicacion_id",
  ];

  const [form, setForm] = useState({
    nombre_instalacion: "",
    largo: "",
    ancho: "",
    altura: "",
    material: "",
    tipo_instalacion: "Alevinaje",
    estado: "vacia",
    ubicacion_id: "",
  });

  const { confirm, ConfirmModal } = useConfirm();

  const [instalaciones, setInstalaciones] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState({ texto: "", error: false });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [granja, setGranja] = useState("");
  const [tipo, setTipo] = useState("Alevinaje");

  // filtros
  const [filtroMaterial, setFiltroMaterial] = useState("");
  const [filtroUso, setFiltroUso] = useState("");

  const filtroUbicacion = useMemo(
    () => (granja ? resolveFiltroUbicacion(granja) : null),
    [granja, resolveFiltroUbicacion],
  );

  /** Mismo uso que enums `PiletaTipo` del backend (`alevinaje` | …). */
  const tipoPiletaQuery = useMemo(() => {
    const t = String(tipo ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
    return ["alevinaje", "reproductores", "engorda"].includes(t) ? t : "";
  }, [tipo]);

  const [piletasFisicasTabla, setPiletasFisicasTabla] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await listUbicacionesActivas();
        if (!cancelled && Array.isArray(data)) setUbicacionesCatalogo(data);
      } catch (_) {
        if (!cancelled) setUbicacionesCatalogo([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
      Obtener instalaciones por tipo y granja
  ========================================================= */
  const obtenerInstalaciones = useCallback(async () => {
    if (!granja || !filtroUbicacion?.granja) return;
    try {
      const { data } = await listByGranja(filtroUbicacion);

      if (!Array.isArray(data)) {
        setInstalaciones([]);
        return;
      }

      const normalizar = (t) =>
        t
          ? t
              .toLowerCase()
              .trim()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
          : "";

      const tipoNorm = normalizar(tipo);

      const filtradas = data.filter(
        (i) => normalizar(i.tipo_instalacion) === tipoNorm
      );

      setInstalaciones(filtradas);
      setMensaje({
        texto: ` ${filtradas.length} instalaciones cargadas (${tipo} - ${granja})`,
        error: false,
      });
    } catch (error) {
      console.error(error);
      setInstalaciones([]);
      setMensaje({ texto: "Error al obtener instalaciones", error: true });
    }
  }, [tipo, granja, filtroUbicacion]);

  useEffect(() => {
    if (!granja && defaultUbicacion) {
      setGranja(defaultUbicacion);
      return;
    }

    if (!granja) return;
    obtenerInstalaciones();
  }, [defaultUbicacion, granja, obtenerInstalaciones]);

  /* Piletas físicas de la sede por tipo — modelo distinto del catálogo `instalaciones`. */
  const cargarPiletasMismoTipo = useCallback(async () => {
    if (!granja || !filtroUbicacion?.granja || !tipoPiletaQuery) {
      setPiletasFisicasTabla([]);
      return;
    }
    try {
      const { data } = await listPiletas(filtroUbicacion, tipoPiletaQuery);
      setPiletasFisicasTabla(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setPiletasFisicasTabla([]);
    }
  }, [granja, filtroUbicacion, tipoPiletaQuery]);

  useEffect(() => {
    cargarPiletasMismoTipo();
  }, [cargarPiletasMismoTipo]);

  const mostrarMensaje = (texto, error = false) => {
    setMensaje({ texto, error });
    setTimeout(() => setMensaje({ texto: "", error: false }), 4000);
  };

  /* =========================================================
      CRUD
  ========================================================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearFieldError(e.target.name);
  };

  const defaultUbicacionFormId = useMemo(() => {
    const id = filtroUbicacion?.ubicacion_id;
    return id != null ? String(id) : "";
  }, [filtroUbicacion]);

  const limpiarFormulario = () => {
    setForm({
      nombre_instalacion: "",
      largo: "",
      ancho: "",
      altura: "",
      material: "",
      tipo_instalacion: tipo,
      estado: "vacia",
      ubicacion_id: defaultUbicacionFormId,
    });
    setSeleccionado(null);
    setMostrarFormulario(false);
    clearErrors();
  };

  const ubicacionParaPayload = Number(form.ubicacion_id);

  const registrarInstalacion = async () => {
    if (!validate(form, requiredFields)) return;
    if (!Number.isInteger(ubicacionParaPayload) || ubicacionParaPayload <= 0) return;
    try {
      await createInstalacion({
        ...form,
        ubicacion_id: ubicacionParaPayload,
        fi_usuario_id: usuario_id,
        fc_granja: granja,
      });

      mostrarMensaje("Instalación registrada correctamente.");
      limpiarFormulario();
      obtenerInstalaciones();
      cargarPiletasMismoTipo();
    } catch (error) {
      console.error(error);
      mostrarMensaje("Error al registrar instalación.", true);
    }
  };

  const actualizarInstalacion = async () => {
    if (!validate(form, requiredFields)) return;
    if (!Number.isInteger(ubicacionParaPayload) || ubicacionParaPayload <= 0) return;
    try {
      await updateInstalacion(seleccionado, {
        ...form,
        ubicacion_id: ubicacionParaPayload,
        fi_usuario_id: usuario_id,
        fc_granja: granja,
      });

      mostrarMensaje("Instalación actualizada correctamente.");
      limpiarFormulario();
      obtenerInstalaciones();
      cargarPiletasMismoTipo();
    } catch (error) {
      console.error(error);
      mostrarMensaje("Error al actualizar instalación.", true);
    }
  };

  const eliminarInstalacion = async () => {
    if (!await confirm("¿Estás seguro de que deseas eliminar esta instalación?", "Confirmar eliminación")) return;
    try {
      await removeInstalacion(seleccionado);

      mostrarMensaje("Instalación eliminada correctamente.");
      limpiarFormulario();
      obtenerInstalaciones();
      cargarPiletasMismoTipo();
    } catch (error) {
      console.error(error);
      mostrarMensaje(error.response?.data?.error || error.message || "Error al eliminar la instalación.", true);
    }
  };

  /* =========================================================
      Seleccionar instalación
  ========================================================= */
  const seleccionarInstalacion = (i) => {
    clearErrors();
    setSeleccionado(i.fi_instalacion_id);
    setForm({
      nombre_instalacion: i.nombre_instalacion,
      largo: i.largo,
      ancho: i.ancho,
      altura: i.altura,
      material: i.material,
      tipo_instalacion: i.tipo_instalacion,
      estado: i.estado,
      ubicacion_id:
        i.ubicacion_id != null
          ? String(i.ubicacion_id)
          : defaultUbicacionFormId || "",
    });
    setMostrarFormulario(true);
  };

  /* =========================================================
      Filtros funcionales
  ========================================================= */
  const instalacionesFiltradas = instalaciones
    .filter((i) =>
      String(i.material ?? "")
        .toLowerCase()
        .includes(filtroMaterial.toLowerCase()),
    )
    .filter((i) => !filtroUso || i.estado === filtroUso);

  const totalM3 = instalacionesFiltradas.reduce(
    (acc, i) => acc + Number(i.metros_cubicos || 0),
    0
  );

  /* =========================================================
      Render
  ========================================================= */
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3} color="#004C7D">
         Registro de Instalaciones
      </Typography>

      {/* Selección de granja */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}>
        {ubicacionesGranja.map((op) => (
          <Button
            key={op.value}
            variant={granja === op.value ? "contained" : "outlined"}
            onClick={() => setGranja(op.value)}
          >
            {op.label}
          </Button>
        ))}
      </Box>

      {/* TIPOS */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        <Button
          variant={tipo === "Alevinaje" ? "contained" : "outlined"}
          onClick={() => setTipo("Alevinaje")}
        >
           Alevinaje
        </Button>

        <Button
          variant={tipo === "Reproductores" ? "contained" : "outlined"}
          onClick={() => setTipo("Reproductores")}
        >
           Reproductores
        </Button>

        <Button
          variant={tipo === "Engorda" ? "contained" : "outlined"}
          onClick={() => setTipo("Engorda")}
        >
           Engorda
        </Button>
      </Box>

      {/* Botón principal */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2, mt: 2 }}>
        <Button 
          variant="contained" 
          color="success"
          onClick={() => {
            clearErrors();
            setSeleccionado(null);
            setForm({
              nombre_instalacion: "",
              largo: "",
              ancho: "",
              altura: "",
              material: "",
              tipo_instalacion: tipo,
              estado: "vacia",
              ubicacion_id: defaultUbicacionFormId || "",
            });
            setMostrarFormulario(true);
          }}
        >
          + Nueva Instalación ({tipo})
        </Button>
      </Box>

      {/* FORMULARIO */}
      {mostrarFormulario && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={!!errors.ubicacion_id}>
                  <InputLabel id="instal-ubic-label">Ubicación (granja / sede)</InputLabel>
                  <Select
                    labelId="instal-ubic-label"
                    label="Ubicación (granja / sede)"
                    name="ubicacion_id"
                    value={form.ubicacion_id || ""}
                    onChange={handleChange}
                  >
                    <MenuItem value="">
                      <em>Seleccione…</em>
                    </MenuItem>
                    {ubicacionesCatalogo.map((u) => (
                      <MenuItem key={u.ubicacion_id} value={String(u.ubicacion_id)}>
                        {u.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {errors.ubicacion_id ||
                      "Catálogo de ubicaciones físicas vincula la instalación a piletas/inventarios vía ubicacion_id."}
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Nombre"
                  name="nombre_instalacion"
                  value={form.nombre_instalacion}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.nombre_instalacion}
                  helperText={errors.nombre_instalacion}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  label="Largo"
                  name="largo"
                  type="number"
                  value={form.largo}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.largo}
                  helperText={errors.largo}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  label="Ancho"
                  name="ancho"
                  type="number"
                  value={form.ancho}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.ancho}
                  helperText={errors.ancho}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  label="Altura"
                  name="altura"
                  type="number"
                  value={form.altura}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.altura}
                  helperText={errors.altura}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Material"
                  name="material"
                  value={form.material}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.material}
                  helperText={errors.material}
                />
              </Grid>

              {/* ESTADO */}
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select
                  label="Estado"
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.estado}
                  helperText={errors.estado}
                >
                  <MenuItem value="vacia">Vacía</MenuItem>
                  <MenuItem value="ocupada">Ocupada</MenuItem>
                </TextField>
              </Grid>

              {/* TIPO */}
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select
                  label="Tipo"
                  name="tipo_instalacion"
                  value={form.tipo_instalacion}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.tipo_instalacion}
                  helperText={errors.tipo_instalacion}
                >
                  <MenuItem value="Alevinaje">Alevinaje</MenuItem>
                  <MenuItem value="Reproductores">Reproductores</MenuItem>
                  <MenuItem value="Engorda">Engorda</MenuItem>
                </TextField>
              </Grid>

            </Grid>

            {/* BOTONES */}
            <Box sx={{ mt: 3 }}>
              <Button variant="contained" color="success" onClick={registrarInstalacion}>
                REGISTRAR
              </Button>

              <Button
                variant="contained"
                color="primary"
                sx={{ ml: 2 }}
                disabled={!seleccionado}
                onClick={actualizarInstalacion}
              >
                ACTUALIZAR
              </Button>

              <Button
                variant="contained"
                color="error"
                sx={{ ml: 2 }}
                disabled={!seleccionado}
                onClick={eliminarInstalacion}
              >
                ELIMINAR
              </Button>

              <Button variant="outlined" sx={{ ml: 2 }} onClick={limpiarFormulario}>
                CERRAR
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* FILTROS */}
      <Box sx={{ display: "flex", gap: 3, mb: 2, mt: 3 }}>
        <TextField
          label="Material (buscar)"
          value={filtroMaterial}
          onChange={(e) => setFiltroMaterial(e.target.value)}
          sx={{ width: 200 }}
        />

        <TextField
          select
          label="Uso"
          value={filtroUso}
          onChange={(e) => setFiltroUso(e.target.value)}
          sx={{ width: 200 }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="ocupada">Ocupada</MenuItem>
          <MenuItem value="vacia">Vacía</MenuItem>
        </TextField>
      </Box>

      {/* MENSAJE DE FEEDBACK */}
      {mensaje.texto && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: mensaje.error ? "#FFEBEE" : "#E8F5E9",
            border: `1px solid ${mensaje.error ? "#EF9A9A" : "#A5D6A7"}`,
          }}
        >
          <Typography
            sx={{ color: mensaje.error ? "#C62828" : "#2E7D32", fontWeight: 500 }}
          >
            {mensaje.texto}
          </Typography>
        </Box>
      )}

      {/* TABLA */}
      <Paper sx={{ mt: 3, borderRadius: 3, overflow: "hidden" }}>
        <Box
          sx={{
            background: "linear-gradient(90deg, #00BFA5, #00ACC1)",
            color: "white",
            py: 1.2,
            px: 2,
          }}
        >
          <Typography variant="h6">
            {tipo} — {granja}
          </Typography>
        </Box>

        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Ubicación</TableCell>
              <TableCell>Largo</TableCell>
              <TableCell>Ancho</TableCell>
              <TableCell>Altura</TableCell>
              <TableCell>Material</TableCell>
              <TableCell>Uso</TableCell>
              <TableCell>Volumen (m³)</TableCell>
              <TableCell>Acción</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {instalacionesFiltradas.map((inst) => (
              <TableRow key={inst.fi_instalacion_id} hover>
                <TableCell>{inst.nombre_instalacion}</TableCell>
                <TableCell>{inst.ubicacion_nombre || inst.fc_granja || "—"}</TableCell>
                <TableCell>{inst.largo}</TableCell>
                <TableCell>{inst.ancho}</TableCell>
                <TableCell>{inst.altura}</TableCell>
                <TableCell>{inst.material}</TableCell>
                <TableCell>{inst.estado}</TableCell>
                <TableCell>
                  {inst.metros_cubicos
                    ? Number(inst.metros_cubicos).toFixed(2)
                    : "—"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => seleccionarInstalacion(inst)}
                  >
                    Seleccionar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* TOTALES */}
        <Typography sx={{ m: 2, fontWeight: "bold", fontSize: "16px" }}>
          Total instalaciones: {instalacionesFiltradas.length} — Total m³:{" "}
          {totalM3.toFixed(2)}
        </Typography>
      </Paper>

      <Paper sx={{ mt: 3, borderRadius: 3, overflow: "hidden" }}>
        <Box
          sx={{
            background: "linear-gradient(90deg, #3949AB, #5C6BC0)",
            color: "white",
            py: 1.2,
            px: 2,
          }}
        >
          <Typography variant="h6">
            Piletas físicas tipo {tipo} — {granja}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ px: 2, pt: 1.5, color: "text.secondary" }}>
          Las piletas operativas (siembras, inventario vivo, etc.) viven en el modelo{" "}
          <strong>Pileta</strong>; el catálogo de arriba es <strong>instalaciones</strong>. Las
          filas pueden coincidir en tipo y ubicación, pero siguen siendo registros aparte.
          Adminístralas en Inventarios → Piletas / Piletas físicas si hace falta crearlas.
        </Typography>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Nombre pileta</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Volumen (m³)</TableCell>
              <TableCell>Material</TableCell>
              <TableCell>Ubicación (catálogo)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {piletasFisicasTabla.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay piletas de tipo «{tipo}» en esta sede (o falta ubicación bien alineada
                  con catálogo). Revisa la sede seleccionada o crea piletas en la pestaña
                  correspondiente.
                </TableCell>
              </TableRow>
            )}
            {piletasFisicasTabla.map((p) => (
              <TableRow key={p.fi_pileta_id} hover>
                <TableCell>{p.nombre}</TableCell>
                <TableCell>{p.estado ?? "—"}</TableCell>
                <TableCell align="right">
                  {p.metros_cubicos != null ? Number(p.metros_cubicos).toFixed(3) : "—"}
                </TableCell>
                <TableCell>{p.material ?? "—"}</TableCell>
                <TableCell>{p.fc_granja ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Typography sx={{ m: 2, fontWeight: 600, fontSize: "15px" }}>
          Total piletas listadas: {piletasFisicasTabla.length}
        </Typography>
      </Paper>

      {ConfirmModal}
    </Box>
  );
}
