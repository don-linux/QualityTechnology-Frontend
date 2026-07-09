import React, { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Add from "@mui/icons-material/Add";
import Edit from "@mui/icons-material/Edit";
import Business from "@mui/icons-material/Business";
import PictureAsPdf from "@mui/icons-material/PictureAsPdf";
import Save from "@mui/icons-material/Save";
import Close from "@mui/icons-material/Close";
import {
  listProveedores,
  createProveedor,
  updateProveedor,
  deactivateProveedor,
  activateProveedor,
} from "../services/proveedoresService";
import { listUnidadesNegocioActivas } from "@features/catalogos/services/unidadesNegocioService";
import { formatFecha } from "@shared/utils/formatters";
import { ordenarYNumerar } from "@shared/utils/ordenarFilas";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import { ESTADOS_MX } from "@shared/constants/estadosMx";

const EMPTY_FORM = {
  proveedor_id: null,
  nombre: "",
  rfc: "",
  producto_servicio: "",
  unidad_negocio_id: "",
  nombre_contacto: "",
  telefono: "",
  email: "",
  localidad: "",
  estado: "",
};

const REQUIRED_FIELDS = [
  "nombre",
  "rfc",
  "producto_servicio",
  "unidad_negocio_id",
  "nombre_contacto",
  "telefono",
  "email",
  "localidad",
  "estado",
];

const CAMPOS_FORM = [
  { label: "Razón Social", name: "nombre", size: 12 },
  { label: "RFC", name: "rfc", maxLength: 20 },
  { label: "Producto/Servicio", name: "producto_servicio", size: 12 },
  { label: "UdN", name: "unidad_negocio_id", select: "udn" },
  { label: "Nombre del contacto", name: "nombre_contacto" },
  { label: "Teléfono", name: "telefono", inputMode: "numeric", maxLength: 10 },
  { label: "Correo Electrónico", name: "email", type: "email" },
  { label: "Localidad", name: "localidad" },
  { label: "Estado", name: "estado", select: "estado" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function soloDigitos(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 10);
}

export default function Proveedores() {
  const showSnackbar = useSnackbar();
  const [proveedores, setProveedores] = useState([]);
  const [unidadesNegocio, setUnidadesNegocio] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  const obtenerDatos = async () => {
    const [proveedoresRes, unidadesRes] = await Promise.allSettled([
      listProveedores(),
      listUnidadesNegocioActivas(),
    ]);

    if (proveedoresRes.status === "fulfilled") {
      setProveedores(proveedoresRes.value.data);
    } else {
      console.error("Error al obtener proveedores", proveedoresRes.reason);
      setProveedores([]);
      showSnackbar(proveedoresRes.reason?.response?.data?.error || "Error al obtener proveedores", "error");
    }

    if (unidadesRes.status === "fulfilled") {
      setUnidadesNegocio(unidadesRes.value.data);
    } else {
      console.error("Error al obtener unidades de negocio", unidadesRes.reason);
      setUnidadesNegocio([]);
      showSnackbar("Error al obtener unidades de negocio", "error");
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  const proveedoresFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return proveedores;
    return proveedores.filter((p) =>
      [
        p.proveedor_id,
        p.nombre,
        p.rfc,
        p.producto_servicio,
        p.unidad_negocio_nombre,
        p.nombre_contacto,
        p.telefono,
        p.email,
        p.localidad,
        p.estado,
      ].some((v) => String(v ?? "").toLowerCase().includes(q))
    );
  }, [proveedores, busqueda]);

  const crear = () => {
    clearErrors();
    setFormData({ ...EMPTY_FORM });
    setOpen(true);
  };

  const editar = (p) => {
    clearErrors();
    setFormData({
      proveedor_id: p.proveedor_id,
      nombre: p.nombre || "",
      rfc: p.rfc || "",
      producto_servicio: p.producto_servicio || "",
      unidad_negocio_id: p.unidad_negocio_id ? String(p.unidad_negocio_id) : "",
      nombre_contacto: p.nombre_contacto || "",
      telefono: p.telefono || "",
      email: p.email || "",
      localidad: p.localidad || "",
      estado: p.estado || "",
    });
    setOpen(true);
  };

  const validarFormato = () => {
    if (formData.rfc.length > 20) {
      showSnackbar("El RFC debe tener máximo 20 caracteres.", "error");
      return false;
    }
    if (!/^[0-9]{1,10}$/.test(formData.telefono)) {
      showSnackbar("El teléfono debe contener solo números y máximo 10 dígitos.", "error");
      return false;
    }
    if (!EMAIL_RE.test(formData.email)) {
      showSnackbar("El correo no tiene un formato válido.", "error");
      return false;
    }
    return true;
  };

  const construirPayload = () => ({
    nombre: formData.nombre.trim(),
    rfc: formData.rfc.trim(),
    producto_servicio: formData.producto_servicio.trim(),
    unidad_negocio_id: Number(formData.unidad_negocio_id),
    nombre_contacto: formData.nombre_contacto.trim(),
    telefono: formData.telefono,
    email: formData.email.trim(),
    localidad: formData.localidad.trim(),
    estado: formData.estado,
  });

  const guardar = async () => {
    if (!validate(formData, REQUIRED_FIELDS) || !validarFormato()) return;

    try {
      const payload = construirPayload();
      if (formData.proveedor_id) {
        await updateProveedor(formData.proveedor_id, payload);
      } else {
        await createProveedor(payload);
      }
      setOpen(false);
      obtenerDatos();
    } catch (err) {
      console.error("Error al guardar:", err);
      showSnackbar("Error al guardar el proveedor.", "error");
    }
  };

  const toggleActivo = async (p) => {
    const activo = p.activo !== false;
    if (!await confirm(activo ? "¿Desactivar proveedor?" : "¿Activar proveedor?")) return;
    try {
      if (activo) await deactivateProveedor(p.proveedor_id);
      else await activateProveedor(p.proveedor_id);
      obtenerDatos();
    } catch (err) {
      showSnackbar(err?.response?.data?.error || "Error al cambiar el estado del proveedor", "error");
    }
  };

  const exportarPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF("l", "mm", "a4");
    const logo = `${""}/images/quality.png`;

    doc.addImage(logo, "PNG", 10, 8, 25, 25);
    doc.setFontSize(14);
    doc.text("Listado de Proveedores - Sistema de Salud Animal", 45, 20);
    doc.setFontSize(10);
    doc.text("Catálogo general de proveedores (Quality y granjas)", 45, 26);

    const columnas = [
      "ID",
      "Razón Social",
      "RFC",
      "Producto/Servicio",
      "UdN",
      "Nombre del contacto",
      "Teléfono",
      "Correo",
      "Localidad",
      "Estado",
    ];

    const filas = proveedoresFiltrados.map((p) => [
      p.proveedor_id,
      p.nombre || "-",
      p.rfc || "-",
      p.producto_servicio || "-",
      p.unidad_negocio_nombre || "-",
      p.nombre_contacto || "-",
      p.telefono || "-",
      p.email || "-",
      p.localidad || "-",
      p.estado || "-",
    ]);

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 40,
      styles: { fontSize: 8, halign: "center" },
      headStyles: {
        fillColor: [21, 101, 192],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    const fecha = formatFecha(new Date());
    doc.text(`Fecha de generación: ${fecha}`, 10, doc.lastAutoTable.finalY + 10);
    doc.save(`Proveedores_${fecha}.pdf`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === "telefono" ? soloDigitos(value) : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    clearFieldError(name);
  };

  const renderOpciones = (campo) => {
    if (campo.select === "estado") {
      return ESTADOS_MX.map((estado) => (
        <MenuItem key={estado} value={estado}>
          {estado}
        </MenuItem>
      ));
    }

    if (campo.select === "udn") {
      return unidadesNegocio.map((unidad) => (
        <MenuItem key={unidad.unidad_negocio_id} value={String(unidad.unidad_negocio_id)}>
          {unidad.nombre}
        </MenuItem>
      ));
    }

    return null;
  };

  return (
    <Box>
      <Typography
        variant="h5"
        sx={{
          mb: 0.5,
          display: "flex",
          alignItems: "center",
          fontWeight: "bold",
          color: "#0d47a1",
        }}
      >
        <Business sx={{ mr: 1 }} /> Control de Proveedores
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        El catálogo de proveedores es general para Quality y granjas.
      </Typography>

      <Paper sx={{ p: 2, mb: 3, background: "#f8f9fa" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid>
            <TextField
              label="Buscar"
              size="small"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              sx={{ width: 320 }}
              InputProps={{
                endAdornment: busqueda ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setBusqueda("")}
                      aria-label="Limpiar búsqueda"
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Grid>
          <Grid>
            <Button
              variant="contained"
              color="success"
              startIcon={<Add />}
              onClick={crear}
            >
              NUEVO PROVEEDOR
            </Button>
          </Grid>
          <Grid>
            <Button
              variant="contained"
              color="error"
              startIcon={<PictureAsPdf />}
              onClick={exportarPDF}
            >
              EXPORTAR PDF
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ border: "1px solid #ccc" }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#1565c0" }}>
            <TableRow>
              {[
                "ID",
                "Razón Social",
                "RFC",
                "Producto/Servicio",
                "UdN",
                "Nombre del contacto",
                "Teléfono",
                "Correo",
                "Localidad",
                "Estado",
                "Acciones",
              ].map((head) => (
                <TableCell
                  key={head}
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {ordenarYNumerar(proveedoresFiltrados, ["proveedor_id", "id"]).map((p, i) => (
              <TableRow
                key={p.proveedor_id}
                sx={{
                  backgroundColor: i % 2 === 0 ? "#f9f9f9" : "#ffffff",
                  opacity: p.activo !== false ? 1 : 0.5,
                  "&:hover": { backgroundColor: "#e3f2fd" },
                }}
              >
                <TableCell align="center">{p._num}</TableCell>
                <TableCell>{p.nombre || "-"}</TableCell>
                <TableCell>{p.rfc || "-"}</TableCell>
                <TableCell>{p.producto_servicio || "-"}</TableCell>
                <TableCell>{p.unidad_negocio_nombre || "-"}</TableCell>
                <TableCell>{p.nombre_contacto || "-"}</TableCell>
                <TableCell>{p.telefono || "-"}</TableCell>
                <TableCell>{p.email || "-"}</TableCell>
                <TableCell>{p.localidad || "-"}</TableCell>
                <TableCell>{p.estado || "-"}</TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<Edit />}
                    onClick={() => editar(p)}
                  >
                    Editar
                  </Button>
                  &nbsp;
                  <Button
                    size="small"
                    variant="outlined"
                    color={p.activo !== false ? "warning" : "success"}
                    onClick={() => toggleActivo(p)}
                  >
                    {p.activo !== false ? "Desactivar" : "Activar"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", color: "#0d47a1" }}>
          {formData.proveedor_id ? "Editar Proveedor" : "Nuevo Proveedor"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {CAMPOS_FORM.map((f) => (
              <Grid size={f.size || 6} key={f.name}>
                <TextField
                  select={!!f.select}
                  label={f.label}
                  name={f.name}
                  type={f.type || "text"}
                  value={formData[f.name] ?? ""}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={!!errors[f.name]}
                  helperText={errors[f.name]}
                  inputProps={{
                    maxLength: f.maxLength,
                    inputMode: f.inputMode,
                  }}
                >
                  {f.select && <MenuItem value="">Selecciona {f.label}</MenuItem>}
                  {renderOpciones(f)}
                </TextField>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            startIcon={<Close />}
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Save />}
            onClick={guardar}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      {ConfirmModal}
    </Box>
  );
}
