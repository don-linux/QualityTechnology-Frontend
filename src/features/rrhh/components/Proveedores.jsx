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
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import { ESTADOS_MX } from "@shared/constants/estadosMx";

const EMPTY_FORM = {
  razon_social: "",
  rfc: "",
  udn: "",
  nombre_contacto: "",
  telefono: "",
  correo: "",
  localidad: "",
  estado: "",
  ejecutivo: "",
  precio_venta: 0,
};

const REQUIRED_FIELDS = [
  "razon_social", "rfc", "udn", "nombre_contacto",
  "telefono", "correo", "localidad", "estado",
  "ejecutivo", "precio_venta",
];

const CAMPOS_FORM = [
  { label: "Razón Social", name: "razon_social" },
  { label: "RFC", name: "rfc" },
  { label: "UdN", name: "udn" },
  { label: "Nombre del contacto", name: "nombre_contacto" },
  { label: "Teléfono", name: "telefono" },
  { label: "Correo Electrónico", name: "correo" },
  { label: "Localidad", name: "localidad" },
  { label: "Estado", name: "estado", select: true },
  { label: "Ejecutivo", name: "ejecutivo" },
  { label: "Precio de venta", name: "precio_venta", type: "number" },
];

export default function Proveedores() {
  const showSnackbar = useSnackbar();
  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  const obtenerDatos = async () => {
    try {
      const res = await listProveedores();
      setProveedores(res.data);
    } catch (err) {
      console.error(err);
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
        p.id,
        p.razon_social,
        p.rfc,
        p.udn,
        p.nombre_contacto,
        p.telefono,
        p.correo,
        p.localidad,
        p.estado,
        p.ejecutivo,
        p.precio_venta,
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
      id: p.id,
      razon_social: p.razon_social || "",
      rfc: p.rfc || "",
      udn: p.udn || "",
      nombre_contacto: p.nombre_contacto || "",
      telefono: p.telefono || "",
      correo: p.correo || "",
      localidad: p.localidad || "",
      estado: p.estado || "",
      ejecutivo: p.ejecutivo || "",
      precio_venta: p.precio_venta ?? 0,
    });
    setOpen(true);
  };

  const guardar = async () => {
    if (!validate(formData, REQUIRED_FIELDS)) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.correo && !emailRegex.test(formData.correo)) {
      showSnackbar("El correo no tiene un formato válido.", "error");
      return;
    }
    if (formData.telefono && isNaN(formData.telefono)) {
      showSnackbar("El teléfono debe contener solo números.", "error");
      return;
    }

    try {
      if (formData.id) {
        await updateProveedor(formData.id, formData);
      } else {
        await createProveedor(formData);
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
      "UdN",
      "Nombre del contacto",
      "Teléfono",
      "Correo",
      "Localidad",
      "Estado",
      "Ejecutivo",
      "Precio de venta",
    ];

    const filas = proveedoresFiltrados.map((p) => [
      p.id,
      p.razon_social || "-",
      p.rfc || "-",
      p.udn || "-",
      p.nombre_contacto || "-",
      p.telefono || "-",
      p.correo || "-",
      p.localidad || "-",
      p.estado || "-",
      p.ejecutivo || "-",
      `$${parseFloat(p.precio_venta || 0).toFixed(2)}`,
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

    const fecha = new Date().toLocaleDateString();
    doc.text(`Fecha de generación: ${fecha}`, 10, doc.lastAutoTable.finalY + 10);
    doc.save(`Proveedores_${fecha}.pdf`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name);
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
                "UdN",
                "Nombre del contacto",
                "Teléfono",
                "Correo",
                "Localidad",
                "Estado",
                "Ejecutivo",
                "Precio de venta",
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
            {proveedoresFiltrados.map((p, i) => (
              <TableRow
                key={p.id}
                sx={{
                  backgroundColor: i % 2 === 0 ? "#f9f9f9" : "#ffffff",
                  "&:hover": { backgroundColor: "#e3f2fd" },
                }}
              >
                <TableCell align="center">{p.id}</TableCell>
                <TableCell>{p.razon_social || "-"}</TableCell>
                <TableCell>{p.rfc || "-"}</TableCell>
                <TableCell>{p.udn || "-"}</TableCell>
                <TableCell>{p.nombre_contacto || "-"}</TableCell>
                <TableCell>{p.telefono || "-"}</TableCell>
                <TableCell>{p.correo || "-"}</TableCell>
                <TableCell>{p.localidad || "-"}</TableCell>
                <TableCell>{p.estado || "-"}</TableCell>
                <TableCell>{p.ejecutivo || "-"}</TableCell>
                <TableCell align="right">
                  ${parseFloat(p.precio_venta || 0).toFixed(2)}
                </TableCell>
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
                    onClick={() => eliminar(p.id)}
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
          {formData.id ? "Editar Proveedor" : "Nuevo Proveedor"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {CAMPOS_FORM.map((f) => (
              <Grid size={6} key={f.name}>
                <TextField
                  select={f.select || false}
                  label={f.label}
                  name={f.name}
                  type={f.type || "text"}
                  value={formData[f.name] ?? ""}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={!!errors[f.name]}
                  helperText={errors[f.name]}
                >
                  {f.select &&
                    ESTADOS_MX.map((estado) => (
                      <MenuItem key={estado} value={estado}>
                        {estado}
                      </MenuItem>
                    ))}
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
