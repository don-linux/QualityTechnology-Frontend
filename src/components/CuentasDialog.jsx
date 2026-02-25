// src/components/CuentasDialog.jsx
import React, { useEffect, useState } from "react";
import { API_URL } from "../utils/api.js";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { Add, Delete, Save } from "@mui/icons-material";
import axios from "axios";

const CuentasDialog = ({ open, onClose }) => {
  const [cuentas, setCuentas] = useState([]);
  const [nuevaCuenta, setNuevaCuenta] = useState({ nombre: "", saldo: "" });

  // 🔹 Cargar cuentas cuando se abre el modal
  useEffect(() => {
    if (open) obtenerCuentas();
  }, [open]);

  const obtenerCuentas = async () => {
    try {
      const res = await axios.get(`${API_URL}/cuentas`);
      setCuentas(res.data);
    } catch (err) {
      console.error("❌ Error al obtener cuentas:", err);
    }
  };

  const handleAddCuenta = async () => {
    if (!nuevaCuenta.nombre.trim()) {
      alert("⚠️ Ingresa un nombre para la cuenta");
      return;
    }

    try {
      await axios.post(`${API_URL}/cuentas`, {
        nombre: nuevaCuenta.nombre,
        saldo: Number(nuevaCuenta.saldo) || 0,
      });
      setNuevaCuenta({ nombre: "", saldo: "" });
      obtenerCuentas();
    } catch (err) {
      console.error("❌ Error al agregar cuenta:", err);
    }
  };

  const handleUpdateSaldo = async (cuenta) => {
    try {
      await axios.put(`${API_URL}/cuentas/${cuenta.id}`, {
        nombre: cuenta.nombre,
        saldo: Number(cuenta.saldo),
      });
      obtenerCuentas();
    } catch (err) {
      console.error("❌ Error al actualizar saldo:", err);
    }
  };

  const handleDeleteCuenta = async (id) => {
    if (!window.confirm("¿Eliminar esta cuenta?")) return;
    try {
      await axios.delete(`${API_URL}/cuentas/${id}`);
      obtenerCuentas();
    } catch (err) {
      console.error("❌ Error al eliminar cuenta:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ background: "#0D4D3A", color: "white", fontWeight: "bold" }}>
        💼 Administración de Cuentas
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Aquí puedes agregar, editar o eliminar las cuentas disponibles para los movimientos.
        </Typography>

        {/* 🆕 Nueva cuenta */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={5}>
            <TextField
              label="Nombre de cuenta"
              fullWidth
              value={nuevaCuenta.nombre}
              onChange={(e) =>
                setNuevaCuenta((prev) => ({ ...prev, nombre: e.target.value }))
              }
            />
          </Grid>

          <Grid size={5}>
            <TextField
              label="Saldo inicial"
              type="number"
              fullWidth
              value={nuevaCuenta.saldo}
              onChange={(e) =>
                setNuevaCuenta((prev) => ({ ...prev, saldo: e.target.value }))
              }
            />
          </Grid>

          <Grid size={2}>
            <Button
              variant="contained"
              color="success"
              startIcon={<Add />}
              fullWidth
              onClick={handleAddCuenta}
            >
              Agregar
            </Button>
          </Grid>
        </Grid>

        {/* 📋 Tabla de cuentas */}
        <Table>
          <TableHead sx={{ background: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>Nombre</b></TableCell>
              <TableCell align="right"><b>Saldo</b></TableCell>
              <TableCell align="center"><b>Acciones</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cuentas.map((cuenta) => (
              <TableRow key={cuenta.id}>
                <TableCell>
                  <TextField
                    fullWidth
                    value={cuenta.nombre}
                    onChange={(e) => {
                      const nuevoNombre = e.target.value;
                      setCuentas((prev) =>
                        prev.map((c) =>
                          c.id === cuenta.id ? { ...c, nombre: nuevoNombre } : c
                        )
                      );
                    }}
                  />
                </TableCell>

                <TableCell align="right">
                  <TextField
                    type="number"
                    fullWidth
                    value={cuenta.saldo}
                    onChange={(e) => {
                      const nuevoSaldo = e.target.value;
                      setCuentas((prev) =>
                        prev.map((c) =>
                          c.id === cuenta.id ? { ...c, saldo: nuevoSaldo } : c
                        )
                      );
                    }}
                  />
                </TableCell>

                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleUpdateSaldo(cuenta)}>
                    <Save />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteCuenta(cuenta.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {cuentas.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No hay cuentas registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CuentasDialog;
