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
import CampoTexto from "@shared/components/CampoTexto";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Add from "@mui/icons-material/Add";
import Delete from "@mui/icons-material/Delete";
import Edit from "@mui/icons-material/Edit";
import Business from "@mui/icons-material/Business";
import PictureAsPdf from "@mui/icons-material/PictureAsPdf";
import Save from "@mui/icons-material/Save";
import Close from "@mui/icons-material/Close";
import {
  listProveedores,
  createProveedor,
  updateProveedor,
  removeProveedor,
} from "../services/proveedoresService";
import { listUnidadesNegocioActivas } from "@features/catalogos/services/unidadesNegocioService";
import { formatFecha } from "@shared/utils/formatters";
import { ordenarYNumerar } from "@shared/utils/ordenarFilas";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import { ESTADOS_MX } from "@shared/constants/estadosMx";

const EMPTY_FORM = {
  fi_proveedor_id: null,
  fc_razon_social: "",
  fc_rfc: "",
  fc_producto_servicio: "",
  fi_unidad_negocio_id: "",
  fc_nombre_contacto: "",
  fc_telefono: "",
  fc_correo: "",
  fc_localidad: "",
  fc_estado: "",
};

const REQUIRED_FIELDS = [
  "fc_razon_social",
  "fc_rfc",
  "fc_producto_servicio",
  "fi_unidad_negocio_id",
  "fc_nombre_contacto",
  "fc_telefono",
  "fc_correo",
  "fc_localidad",
  "fc_estado",
];

const CAMPOS_FORM = [
  { label: "Razón Social", name: "fc_razon_social", size: 12 },
  { label: "RFC", name: "fc_rfc", maxLength: 20 },
  { label: "Producto/Servicio", name: "fc_producto_servicio", size: 12 },
  { label: "UdN", name: "fi_unidad_negocio_id", select: "udn" },
  { label: "Nombre del contacto", name: "fc_nombre_contacto" },
  { label: "Teléfono", name: "fc_telefono", inputMode: "numeric", maxLength: 10 },
  { label: "Correo Electrónico", name: "fc_correo", type: "email" },
  { label: "Localidad", name: "fc_localidad" },
  { label: "Estado", name: "fc_estado", select: "estado" },
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
        p.fi_proveedor_id,
        p.fc_razon_social,
        p.fc_rfc,
        p.fc_producto_servicio,
        p.unidad_negocio_nombre,
        p.fc_nombre_contacto,
        p.fc_telefono,
        p.fc_correo,
        p.fc_localidad,
        p.fc_estado,
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
      fi_proveedor_id: p.fi_proveedor_id,
      fc_razon_social: p.fc_razon_social || "",
      fc_rfc: p.fc_rfc || "",
      fc_producto_servicio: p.fc_producto_servicio || "",
      fi_unidad_negocio_id: p.fi_unidad_negocio_id ? String(p.fi_unidad_negocio_id) : "",
      fc_nombre_contacto: p.fc_nombre_contacto || "",
      fc_telefono: p.fc_telefono || "",
      fc_correo: p.fc_correo || "",
      fc_localidad: p.fc_localidad || "",
      fc_estado: p.fc_estado || "",
    });
    setOpen(true);
  };

  const validarFormato = () => {
    if (formData.fc_rfc.length > 20) {
      showSnackbar("El RFC debe tener máximo 20 caracteres.", "error");
      return false;
    }
    if (!/^[0-9]{1,10}$/.test(formData.fc_telefono)) {
      showSnackbar("El teléfono debe contener solo números y máximo 10 dígitos.", "error");
      return false;
    }
    if (!EMAIL_RE.test(formData.fc_correo)) {
      showSnackbar("El correo no tiene un formato válido.", "error");
      return false;
    }
    return true;
  };

  const construirPayload = () => ({
    fc_razon_social: formData.fc_razon_social.trim(),
    fc_rfc: formData.fc_rfc.trim(),
    fc_producto_servicio: formData.fc_producto_servicio.trim(),
    fi_unidad_negocio_id: Number(formData.fi_unidad_negocio_id),
    fc_nombre_contacto: formData.fc_nombre_contacto.trim(),
    fc_telefono: formData.fc_telefono,
    fc_correo: formData.fc_correo.trim(),
    fc_localidad: formData.fc_localidad.trim(),
    fc_estado: formData.fc_estado,
  });

  const guardar = async () => {
    if (!validate(formData, REQUIRED_FIELDS) || !validarFormato()) return;

    try {
      const payload = construirPayload();
      if (formData.fi_proveedor_id) {
        await updateProveedor(formData.fi_proveedor_id, payload);
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

  const eliminar = async (id) => {
    if (!await confirm("¿Eliminar proveedor?")) return;
    await removeProveedor(id);
    obtenerDatos();
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
      p.fi_proveedor_id,
      p.fc_razon_social || "-",
      p.fc_rfc || "-",
      p.fc_producto_servicio || "-",
      p.unidad_negocio_nombre || "-",
      p.fc_nombre_contacto || "-",
      p.fc_telefono || "-",
      p.fc_correo || "-",
      p.fc_localidad || "-",
      p.fc_estado || "-",
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
    const nextValue = name === "fc_telefono" ? soloDigitos(value) : value;
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
        <MenuItem key={unidad.fi_unidad_negocio_id} value={String(unidad.fi_unidad_negocio_id)}>
          {unidad.fc_nombre}
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
            <CampoTexto
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
            {ordenarYNumerar(proveedoresFiltrados, ["fi_proveedor_id"]).map((p, i) => (
              <TableRow
                key={p.fi_proveedor_id}
                sx={{
                  backgroundColor: i % 2 === 0 ? "#f9f9f9" : "#ffffff",
                  "&:hover": { backgroundColor: "#e3f2fd" },
                }}
              >
                <TableCell align="center">{p._num}</TableCell>
                <TableCell>{p.fc_razon_social || "-"}</TableCell>
                <TableCell>{p.fc_rfc || "-"}</TableCell>
                <TableCell>{p.fc_producto_servicio || "-"}</TableCell>
                <TableCell>{p.unidad_negocio_nombre || "-"}</TableCell>
                <TableCell>{p.fc_nombre_contacto || "-"}</TableCell>
                <TableCell>{p.fc_telefono || "-"}</TableCell>
                <TableCell>{p.fc_correo || "-"}</TableCell>
                <TableCell>{p.fc_localidad || "-"}</TableCell>
                <TableCell>{p.fc_estado || "-"}</TableCell>
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
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => eliminar(p.fi_proveedor_id)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", color: "#0d47a1" }}>
          {formData.fi_proveedor_id ? "Editar Proveedor" : "Nuevo Proveedor"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {CAMPOS_FORM.map((f) => (
              <Grid size={f.size || 6} key={f.name}>
                <CampoTexto
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
                </CampoTexto>
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
