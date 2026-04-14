import React, { useEffect, useState } from "react";
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
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Add from "@mui/icons-material/Add";
import Delete from "@mui/icons-material/Delete";
import Edit from "@mui/icons-material/Edit";
import CleaningServices from "@mui/icons-material/CleaningServices";
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

export default function Proveedores() {
  const showSnackbar = useSnackbar();
  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  const requiredFields = [
    "nombre", "empresa", "rfc", "categoria", "contacto",
    "telefono", "correo", "direccion", "forma_pago",
    "plazo_credito", "ultima_compra", "monto_promedio",
  ];

  const normalizarFechaInput = (valor) => {
    if (!valor) return "";
    if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      return valor;
    }
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return "";
    return fecha.toISOString().split("T")[0];
  };

  // ============================
  //  Cargar datos
  // ============================
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

  // ============================
  //  Buscar proveedor
  // ============================
  const buscar = () => {
    if (busqueda.trim() === "") obtenerDatos();
    else {
      setProveedores(
        proveedores.filter((p) =>
          p.nombre.toLowerCase().includes(busqueda.toLowerCase())
        )
      );
    }
  };

  // ============================
  //  Crear nuevo proveedor
  // ============================
  const crear = () => {
    clearErrors();
    setFormData({
      nombre: "",
      empresa: "",
      rfc: "",
      categoria: "",
      contacto: "",
      telefono: "",
      correo: "",
      direccion: "",
      forma_pago: "",
      plazo_credito: "",
      ultima_compra: "",
      monto_promedio: 0,
    });
    setOpen(true);
  };

  // ============================
  //  Editar proveedor
  // ============================
  const editar = (p) => {
    clearErrors();
    setFormData({
      ...p,
      ultima_compra: normalizarFechaInput(p.ultima_compra),
    });
    setOpen(true);
  };

  // ============================
  //  Guardar (crear o actualizar)
  // ============================
  const guardar = async () => {
    if (!validate(formData, requiredFields)) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.correo && !emailRegex.test(formData.correo)) {
      showSnackbar(" El correo no tiene un formato válido.", "success");
      return;
    }
    if (formData.telefono && isNaN(formData.telefono)) {
      showSnackbar(" El teléfono debe contener solo números.", "success");
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
      showSnackbar(" Error al guardar el proveedor.", "error");
    }
  };

  // ============================
  //  Eliminar proveedor
  // ============================
  const eliminar = async (id) => {
    if (!await confirm("¿Eliminar proveedor?")) return;
    await removeProveedor(id);
    obtenerDatos();
  };

  // ============================
  //  Exportar PDF
  // ============================
  const exportarPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF("l", "mm", "a4");
    const logo = `${""}/images/quality.png`;

    doc.addImage(logo, "PNG", 10, 8, 25, 25);
    doc.setFontSize(14);
    doc.text("Listado de Proveedores - Sistema de Salud Animal", 45, 20);
    doc.setFontSize(10);
    doc.text("Módulo de Administración y Finanzas / Control de Proveedores", 45, 26);

    const columnas = [
      "ID",
      "Nombre",
      "Empresa",
      "Categoría",
      "Persona de contacto",
      "Teléfono",
      "Correo",
      "RFC",
      "Forma de pago",
      "Última compra",
      "Monto promedio",
    ];

    const filas = proveedores.map((p) => [
      p.id,
      p.nombre,
      p.empresa || "-",
      p.categoria || "-",
      p.contacto || "-",
      p.telefono || "-",
      p.correo || "-",
      p.rfc || "-",
      p.forma_pago || "-",
      p.ultima_compra
        ? new Date(p.ultima_compra).toLocaleDateString()
        : "-",
      `$${parseFloat(p.monto_promedio || 0).toFixed(2)}`,
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

  // ============================
  //  Manejo de cambios
  // ============================
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
          mb: 2,
          display: "flex",
          alignItems: "center",
          fontWeight: "bold",
          color: "#0d47a1",
        }}
      >
        <Business sx={{ mr: 1 }} /> Control de Proveedores
      </Typography>

      {/* Barra de acciones */}
      <Paper sx={{ p: 2, mb: 3, background: "#f8f9fa" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid>
            <TextField
              label="Buscar proveedor"
              size="small"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              sx={{ width: 250 }}
            />
          </Grid>
          <Grid>
            <Button variant="contained" onClick={buscar}>
              BUSCAR
            </Button>
          </Grid>
          <Grid>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<CleaningServices />}
              onClick={() => {
                setBusqueda("");
                obtenerDatos();
              }}
            >
              LIMPIAR
            </Button>
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

      {/* Tabla de proveedores */}
      <TableContainer component={Paper} sx={{ border: "1px solid #ccc" }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#1565c0" }}>
            <TableRow>
              {[
                "ID",
                "Nombre",
                "Empresa",
                "Categoría",
                "Persona de contacto",
                "Teléfono",
                "Correo",
                "RFC",
                "Forma de pago",
                "Última compra",
                "Monto promedio",
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
            {proveedores.map((p, i) => (
              <TableRow
                key={p.id}
                sx={{
                  backgroundColor: i % 2 === 0 ? "#f9f9f9" : "#ffffff",
                  "&:hover": { backgroundColor: "#e3f2fd" },
                }}
              >
                <TableCell align="center">{p.id}</TableCell>
                <TableCell>{p.nombre}</TableCell>
                <TableCell>{p.empresa || "-"}</TableCell>
                <TableCell>{p.categoria || "-"}</TableCell>
                <TableCell>{p.contacto || "-"}</TableCell>
                <TableCell>{p.telefono || "-"}</TableCell>
                <TableCell>{p.correo || "-"}</TableCell>
                <TableCell>{p.rfc || "-"}</TableCell>
                <TableCell>{p.forma_pago || "-"}</TableCell>
                <TableCell>
                  {p.ultima_compra
                    ? new Date(p.ultima_compra).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell align="right">
                  ${parseFloat(p.monto_promedio || 0).toFixed(2)}
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

      {/* Modal de edición / creación */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", color: "#0d47a1" }}>
          {formData.id ? "Editar Proveedor" : "Nuevo Proveedor"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {[
              { label: "Nombre", name: "nombre" },
              { label: "Empresa", name: "empresa" },
              { label: "RFC", name: "rfc" },
              { label: "Categoría", name: "categoria" },
              { label: "Persona de contacto", name: "contacto" },
              { label: "Teléfono", name: "telefono" },
              { label: "Correo", name: "correo" },
              { label: "Dirección", name: "direccion" },
              { label: "Forma de pago", name: "forma_pago" },
              { label: "Plazo crédito (días)", name: "plazo_credito" },
              { label: "Última compra", name: "ultima_compra", type: "date" },
              { label: "Monto promedio", name: "monto_promedio", type: "number" },
            ].map((f) => (
              <Grid size={6} key={f.name}>
                <TextField
                  label={f.label}
                  name={f.name}
                  type={f.type || "text"}
                  value={formData[f.name] || ""}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={!!errors[f.name]}
                  helperText={errors[f.name]}
                />
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
