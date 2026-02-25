import React, { useEffect, useState } from "react";
import { API_URL } from "../utils/api.js";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add,
  Delete,
  Edit,
  CleaningServices,
  Business,
  PictureAsPdf,
  Save,
  Close,
} from "@mui/icons-material";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const api = `${API_URL}/proveedores`;

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({});

  // ============================
  // 🟢 Cargar datos
  // ============================
  const obtenerDatos = async () => {
    try {
      const res = await axios.get(api);
      setProveedores(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  // ============================
  // 🔍 Buscar proveedor
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
  // ➕ Crear nuevo proveedor
  // ============================
  const crear = () => {
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
  // ✏️ Editar proveedor
  // ============================
  const editar = (p) => {
    setFormData(p);
    setOpen(true);
  };

  // ============================
  // 💾 Guardar (crear o actualizar)
  // ============================
  const guardar = async () => {
    // Validaciones básicas
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.correo && !emailRegex.test(formData.correo)) {
      alert("⚠️ El correo no tiene un formato válido.");
      return;
    }
    if (formData.telefono && isNaN(formData.telefono)) {
      alert("⚠️ El teléfono debe contener solo números.");
      return;
    }

    try {
      if (formData.id) {
        await axios.put(`${api}/${formData.id}`, formData);
      } else {
        await axios.post(api, formData);
      }
      setOpen(false);
      obtenerDatos();
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("❌ Error al guardar el proveedor.");
    }
  };

  // ============================
  // 🗑️ Eliminar proveedor
  // ============================
  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar proveedor?")) return;
    await axios.delete(`${api}/${id}`);
    obtenerDatos();
  };

  // ============================
  // 🧾 Exportar PDF
  // ============================
  const exportarPDF = () => {
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
  // 🔧 Manejo de cambios
  // ============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    </Box>
  );
}
