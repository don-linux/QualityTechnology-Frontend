// src/components/FlujoCaja.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  Container, Box, Typography, Tabs, Tab, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Snackbar, Alert
} from "@mui/material";
import axios from "axios";
import * as XLSX from "xlsx";
import FormDialog from "./FormDialog"; // ✅ componente separado

export default function FlujoCaja() {
  const [subTab, setSubTab] = useState(0);
  const [movimientos, setMovimientos] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editId, setEditId] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const granjas = ["Medellin", "La Ceiba", "Quality"];
  const API = "http://localhost:5000";

  // =====================================================
  // 🔁 Cargar datos
  // =====================================================
  useEffect(() => {
    obtenerMovimientos();
  }, [subTab]);

  const obtenerMovimientos = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/flujo-caja/${granjas[subTab]}`);
      setMovimientos(res.data || []);
    } catch (err) {
      console.error("❌ Error al obtener movimientos:", err);
      mostrarAlerta("Error al obtener los movimientos", "error");
    }
  }, [subTab]);

  // =====================================================
  // 📤 Exportar Excel
  // =====================================================
  const exportarExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(movimientos);
    XLSX.utils.book_append_sheet(wb, ws, "FlujoCaja");
    XLSX.writeFile(wb, `FlujoCaja_${granjas[subTab]}.xlsx`);
  };

  // =====================================================
  // 🧾 CRUD
  // =====================================================
  const handleOpen = (data = null) => {
    if (data) {
      setFormData({ ...data });
      setEditId(data.fi_movimiento_id);
    } else {
      setFormData({
        fd_fecha: "",
        fn_ingreso: "",
        fn_egreso: "",
        fc_descripcion: "",
        fc_cuenta: "",
        fc_categoria: "",
        fc_factura: "",
        fc_estatus: "",
      });
      setEditId(null);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async (data) => {
    try {
      const payload = { ...data, fc_granja: granjas[subTab] };
      if (editId) {
        await axios.put(`${API}/flujo-caja/${editId}`, payload);
        mostrarAlerta("Movimiento actualizado correctamente ✅", "success");
      } else {
        await axios.post(`${API}/flujo-caja`, payload);
        mostrarAlerta("Movimiento agregado correctamente ✅", "success");
      }
      setOpen(false);
      obtenerMovimientos();
    } catch (err) {
      console.error("❌ Error al guardar:", err);
      mostrarAlerta("Error al guardar el movimiento ❌", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este registro?")) {
      try {
        await axios.delete(`${API}/flujo-caja/${id}`);
        obtenerMovimientos();
        mostrarAlerta("Movimiento eliminado correctamente 🗑️", "success");
      } catch (err) {
        console.error("❌ Error al eliminar:", err);
        mostrarAlerta("Error al eliminar el movimiento ❌", "error");
      }
    }
  };

  // =====================================================
  // 📢 Snackbar
  // =====================================================
  const mostrarAlerta = (message, severity) => {
    setSnack({ open: true, message, severity });
  };

  const cerrarAlerta = () => {
    setSnack((prev) => ({ ...prev, open: false }));
  };

  // =====================================================
  // 🧮 Tabla
  // =====================================================
  const TablaMovimientos = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ background: "#f0f0f0" }}>
          <TableRow>
            <TableCell><b>Fecha</b></TableCell>
            <TableCell align="right"><b>Ingreso</b></TableCell>
            <TableCell align="right"><b>Egreso</b></TableCell>
            <TableCell><b>Descripción</b></TableCell>
            <TableCell><b>Cuenta</b></TableCell>
            <TableCell><b>Categoría</b></TableCell>
            <TableCell><b>Factura</b></TableCell>
            <TableCell><b>Estatus</b></TableCell>
            <TableCell align="center"><b>Acciones</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {movimientos.map((row) => (
            <TableRow key={row.fi_movimiento_id}>
              <TableCell>{row.fd_fecha}</TableCell>
              <TableCell align="right">{row.fn_ingreso || 0}</TableCell>
              <TableCell align="right">{row.fn_egreso || 0}</TableCell>
              <TableCell>{row.fc_descripcion}</TableCell>
              <TableCell>{row.fc_cuenta}</TableCell>
              <TableCell>{row.fc_categoria}</TableCell>
              <TableCell>{row.fc_factura}</TableCell>
              <TableCell>{row.fc_estatus}</TableCell>
              <TableCell align="center">
                <Button size="small" onClick={() => handleOpen(row)}>✏️</Button>
                <Button size="small" color="error" onClick={() => handleDelete(row.fi_movimiento_id)}>🗑️</Button>
              </TableCell>
            </TableRow>
          ))}
          {movimientos.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} align="center">
                No hay movimientos registrados para esta granja.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // =====================================================
  // 🧱 Render Principal
  // =====================================================
  return (
    <Container maxWidth="xl" sx={{ mt: 0, p: 0 }}>
      <Box sx={{ width: "100%", background: "#0D4D3A", padding: "20px 30px", mb: 2 }}>
        <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
          💵 Módulo de Flujo de Caja — Sistema Quality
        </Typography>
      </Box>

      <Tabs value={subTab} onChange={(e, v) => setSubTab(v)} variant="scrollable" scrollButtons="auto">
        <Tab label="🟦 Medellín" />
        <Tab label="🟩 La Ceiba" />
        <Tab label="📘 Quality" />
      </Tabs>

      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Button variant="contained" color="success" onClick={() => handleOpen()}>
            + Nuevo Movimiento
          </Button>
          <Button variant="contained" sx={{ background: "#1D5C42" }} onClick={exportarExcel}>
            Exportar Excel
          </Button>
        </Box>
        <TablaMovimientos />
      </Box>

      <FormDialog
        open={open}
        formData={formData}
        setFormData={setFormData}
        onClose={handleClose}
        onSubmit={handleSubmit}
        editId={editId}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={cerrarAlerta}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={cerrarAlerta} severity={snack.severity} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
