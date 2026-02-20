import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Grid,
  Button,
  Typography,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Autocomplete,
} from "@mui/material";
import axios from "axios";

const API = "http://localhost:5000/ventas";

export default function Venta() {
  return <VentaContent />;
}

function VentaContent() {
  /* ============================================================
      ESTADOS PRINCIPALES
  ============================================================ */
  const [empresa, setEmpresa] = useState("MEDELLIN");
  const [ventas, setVentas] = useState([]);
  const [editando, setEditando] = useState(false);
  const [idEditando, setIdEditando] = useState(null);

  const [clientes, setClientes] = useState([]);
  const [expedientes, setExpedientes] = useState([]);

  /* ============================================================
      FORM
  ============================================================ */
  const [form, setForm] = useState({
    fd_fecha_venta: "",
    fc_folio: "",
    fc_cliente: "",
    fc_tipo_venta: "",
    fn_cantidad_vendida: "",
    fn_precio_venta: "",
    fn_abonado: "",
    fc_encargado_venta: "",
    fc_observaciones: "",
    fc_empresa: empresa,
  });

  /* ============================================================
      NORMALIZAR LISTAS
  ============================================================ */
  const listaClientes = clientes.map((c) => ({
    nombre: c.nombre,
  }));

  const listaEncargados = expedientes.map((e) => ({
    nombre: e.nombre,
  }));

  /* ============================================================
      CARGAR VENTAS POR EMPRESA
  ============================================================ */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    obtenerVentas();
  }, [empresa]);

  const obtenerVentas = async () => {
    const res = await axios.get(API);
    setVentas(res.data.filter((v) => v.fc_empresa === empresa));
  };

  /* ============================================================
      CARGAR CLIENTES
  ============================================================ */
  useEffect(() => {
    obtenerClientes();
  }, []);

  const obtenerClientes = async () => {
  const res = await axios.get("http://localhost:5000/ventas/clientes");
  setClientes(res.data);
};

  /* ============================================================
      CARGAR ENCARGADOS POR EMPRESA
  ============================================================ */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    obtenerEncargados();
    setForm((prev) => ({
      ...prev,
      fc_encargado_venta: "",
    }));
  }, [empresa]);

  const obtenerEncargados = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/ventas/encargados/${empresa}`
      );
      setExpedientes(res.data);
    } catch (err) {
      console.error(err);
      setExpedientes([]);
    }
  };

  /* ============================================================
      HANDLE CHANGE
  ============================================================ */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ============================================================
      CÁLCULOS AUTOMÁTICOS
  ============================================================ */
  const total =
    Number(form.fn_cantidad_vendida || 0) *
    Number(form.fn_precio_venta || 0);

  const adeudo = total - Number(form.fn_abonado || 0);

  const estado =
    adeudo === total
      ? "ADEUDO"
      : adeudo > 0
      ? "PARCIAL"
      : "LIQUIDADO";

  const colorEstado = {
    ADEUDO: "red",
    PARCIAL: "orange",
    LIQUIDADO: "green",
  };

  /* ============================================================
      GUARDAR
  ============================================================ */
  const guardar = async () => {
    if (!form.fc_cliente || !form.fc_encargado_venta) {
      alert("Debe seleccionar un cliente y un encargado.");
      return;
    }

    const payload = {
      ...form,
      fc_empresa: empresa,
    };

    try {
      if (editando) {
        await axios.put(`${API}/${idEditando}`, payload);
        alert("Venta actualizada");
      } else {
        await axios.post(API, payload);
        alert("Venta registrada");
      }

      limpiar();
      obtenerVentas();
    } catch (err) {
      console.error(err);
      alert("Error al guardar. Ver consola.");
    }
  };

  /* ============================================================
      EDITAR
  ============================================================ */
  const editarVenta = (v) => {
    setEditando(true);
    setIdEditando(v.fi_venta_id);

    setForm({
      fd_fecha_venta: v.fd_fecha_venta?.split("T")[0],
      fc_folio: v.fc_folio,
      fc_cliente: v.fc_cliente,
      fc_tipo_venta: v.fc_tipo_venta,
      fn_cantidad_vendida: v.fn_cantidad_vendida,
      fn_precio_venta: v.fn_precio_venta,
      fn_abonado: v.fn_abonado,
      fc_encargado_venta: v.fc_encargado_venta,
      fc_observaciones: v.fc_observaciones,
      fc_empresa: v.fc_empresa,
    });
  };

  /* ============================================================
      LIMPIAR
  ============================================================ */
  const limpiar = () => {
    setForm({
      fd_fecha_venta: "",
      fc_folio: "",
      fc_cliente: "",
      fc_tipo_venta: "",
      fn_cantidad_vendida: "",
      fn_precio_venta: "",
      fn_abonado: "",
      fc_encargado_venta: "",
      fc_observaciones: "",
      fc_empresa: empresa,
    });

    setEditando(false);
    setIdEditando(null);
  };

  /* ============================================================
      ELIMINAR
  ============================================================ */
  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar venta?")) return;
    await axios.delete(`${API}/${id}`);
    obtenerVentas();
  };

  /* ============================================================
      UI
  ============================================================ */
  const formatNumero = (valor) => {
  if (valor === null || valor === undefined) return "0";
  return Number(valor).toLocaleString("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

  return (
    <Box p={3}>
      {/* BOTONES EMPRESA */}
      <Box display="flex" justifyContent="center" gap={2} mb={3}>
        {["MEDELLIN", "CEIBA", "QUALITY"].map((e) => (
          <Button
            key={e}
            variant={empresa === e ? "contained" : "outlined"}
            color="success"
            onClick={() => setEmpresa(e)}
          >
            {e}
          </Button>
        ))}
      </Box>

      {/* FORMULARIO */}
      <Card sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 4 }}>
        <Typography variant="h5" textAlign="center" mb={2} fontWeight="bold">
          Registro de Ventas
        </Typography>

        <Grid container spacing={2}>
          {/* FECHA */}
          <Grid item xs={12} md={3}>
            <TextField
              type="date"
              label="Fecha"
              name="fd_fecha_venta"
              value={form.fd_fecha_venta}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* FOLIO */}
          <Grid item xs={12} md={3}>
            <TextField
              label="Folio"
              name="fc_folio"
              value={form.fc_folio}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          {/* CLIENTE */}
          <Grid item xs={12} md={3}>
            <Autocomplete
              options={listaClientes}
              getOptionLabel={(o) => o.nombre}
              value={
                listaClientes.find(
                  (o) => o.nombre === form.fc_cliente
                ) || null
              }
              onChange={(e, val) =>
                setForm({
                  ...form,
                  fc_cliente: val ? val.nombre : "",
                })
              }
              renderInput={(params) => (
                <TextField {...params} label="Razón Social" fullWidth />
              )}
            />
          </Grid>

          {/* TIPO */}
          <Grid item xs={12} md={3}>
            <TextField
              select
              label="Tipo de venta"
              name="fc_tipo_venta"
              value={form.fc_tipo_venta}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="ALEVINES">Venta de Alevines</MenuItem>
              <MenuItem value="MOJARRA_KG">Venta de Mojarra (Kg)</MenuItem>
              <MenuItem value="ALIMENTO">Venta de Alimento</MenuItem>
              <MenuItem value="MEDICAMENTO">Venta de Medicamento</MenuItem>
            </TextField>
          </Grid>

          {/* CANTIDAD */}
          <Grid item xs={12} md={3}>
            <TextField
              label="Cantidad"
              name="fn_cantidad_vendida"
              value={form.fn_cantidad_vendida}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          {/* PRECIO */}
          <Grid item xs={12} md={3}>
            <TextField
              label="Precio"
              name="fn_precio_venta"
              value={form.fn_precio_venta}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          {/* TOTAL */}
          <Grid item xs={12} md={3}>
            <TextField
            label="Total"
            value={formatNumero(total)}
            disabled
            fullWidth
          />
          </Grid>

          {/* ABONADO */}
          <Grid item xs={12} md={3}>
            <TextField
              label="Abonado"
              name="fn_abonado"
              value={form.fn_abonado}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          {/* ESTADO */}
          <Grid item xs={12} md={3}>
            <TextField
              label="Estado"
              value={estado}
              disabled
              fullWidth
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  color: colorEstado[estado],
                  fontWeight: "bold",
                },
              }}
            />
          </Grid>

          {/* ENCARGADO */}
          <Grid item xs={12} md={3}>
            <Autocomplete
              options={listaEncargados}
              getOptionLabel={(o) => o.nombre}
              value={
                listaEncargados.find(
                  (o) => o.nombre === form.fc_encargado_venta
                ) || null
              }
              onChange={(e, val) =>
                setForm({
                  ...form,
                  fc_encargado_venta: val ? val.nombre : "",
                })
              }
              renderInput={(params) => (
                <TextField {...params} label="Encargado de venta" fullWidth />
              )}
            />
          </Grid>

          {/* OBSERVACIONES */}
          <Grid item xs={12}>
            <TextField
              label="Observaciones"
              name="fc_observaciones"
              multiline
              rows={2}
              fullWidth
              value={form.fc_observaciones}
              onChange={handleChange}
            />
          </Grid>

          {/* BOTONES */}
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              onClick={guardar}
            >
              {editando ? "Actualizar Venta" : "Registrar Venta"}
            </Button>

            {editando && (
              <Button
                sx={{ mt: 1 }}
                fullWidth
                variant="outlined"
                onClick={limpiar}
              >
                Cancelar
              </Button>
            )}
          </Grid>
        </Grid>
      </Card>

      {/* TABLA */}
     <Card sx={{ p: 2 }}>
  <Typography variant="h5" mb={2} fontWeight="bold">
    Lista de Ventas – {empresa}
  </Typography>

  {/* 🔽 CONTENEDOR CON SCROLL */}
  <Box sx={{ overflowX: "auto" }}>
    <Table sx={{ minWidth: 1300 }}>
      <TableHead>
        <TableRow>
          <TableCell>Fecha</TableCell>
          <TableCell>Folio</TableCell>
          <TableCell>Razón Social</TableCell>
          <TableCell>Tipo</TableCell>
          <TableCell>Cant.</TableCell>
          <TableCell>Precio</TableCell>
          <TableCell>Total</TableCell>
          <TableCell>Abonado</TableCell>
          <TableCell>Estado</TableCell>
          <TableCell>Encargado</TableCell>
          <TableCell>Observaciones</TableCell>
          <TableCell>Acciones</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {ventas.map((v) => (
          <TableRow key={v.fi_venta_id}>
            <TableCell>{v.fd_fecha_venta?.split("T")[0]}</TableCell>
            <TableCell>{v.fc_folio}</TableCell>
            <TableCell>{v.fc_cliente}</TableCell>
            <TableCell>{v.fc_tipo_venta}</TableCell>
            <TableCell>{v.fn_cantidad_vendida}</TableCell>
            <TableCell>${formatNumero(v.fn_precio_venta)}</TableCell>
            <TableCell>${formatNumero(v.fn_monto_total)}</TableCell>
            <TableCell>${formatNumero(v.fn_abonado)}</TableCell>
            <TableCell>
              <b style={{ color: colorEstado[v.fc_estado_pago] }}>
                {v.fc_estado_pago}
              </b>
            </TableCell>
            <TableCell>{v.fc_encargado_venta}</TableCell>
            <TableCell>{v.fc_observaciones || "-"}</TableCell>
            <TableCell>
              <Button color="warning" onClick={() => editarVenta(v)}>
                Editar
              </Button>
              <Button color="error" onClick={() => eliminar(v.fi_venta_id)}>
                Eliminar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Box>
</Card>
</Box>
  );
}
