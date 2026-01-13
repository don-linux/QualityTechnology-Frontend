// src/components/Venta.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
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
  Tabs,
  Tab,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Venta() {
  return <VentaContent />;
}

function VentaContent() {
  const usuario_id = localStorage.getItem("usuario_id") || "1";
  const usuario_nombre = localStorage.getItem("nombre") || "Usuario";

  const [modoEdicion, setModoEdicion] = useState(false);
  const [ventaEditando, setVentaEditando] = useState(null);
  const [tab, setTab] = useState(0);
  const tipos = ["ALEVIN", "KG", "ALIMENTO", "MEDICAMENTO"];

  const [clientes, setClientes] = useState([]);
  const [openCliente, setOpenCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    fc_nombre: "",
    fc_telefono: "",
    fc_correo: "",
    fc_localidad: "",
    fc_cp: "",
    fi_usuario_id: 1,
  });

  const [form, setForm] = useState({
    fd_fecha_venta: "",
    fn_talla: "",
    fn_cantidad_vendida: "",
    fc_cliente: "",
    fn_precio_venta: "",
    fc_lugar_entrega: "",
    fc_estado: "",
    fc_encargado_venta: usuario_nombre,
    fc_estanque_cosecha: "",
    fc_estado_pago: "",
    fc_metodo_pago: "",
    fc_observaciones: "",
    fc_unidad_produccion: tipos[0],
    fi_usuario_id: usuario_id,
    fc_granja: "",
  });

  const [ventas, setVentas] = useState([]);

  // === Cargar ventas y clientes ===
  useEffect(() => {
    obtenerVentas();
    obtenerClientes();
  }, []);

  const obtenerClientes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/clientes");
      setClientes(res.data);
    } catch (err) {
      console.error("Error al cargar clientes", err);
    }
  };

  const obtenerVentas = async () => {
    const res = await axios.get("http://localhost:5000/ventas");
    setVentas(res.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "fc_unidad_produccion" && value !== "ALEVIN") {
      setForm((prev) => ({ ...prev, fn_talla: "" }));
    }
    setForm({ ...form, [name]: value });
  };

  // === Validar ===
  const validarFormulario = () => {
    if (!form.fc_unidad_produccion)
      return "Seleccione una unidad de producción.";
    if (form.fc_unidad_produccion === "ALEVIN" && !form.fn_talla)
      return "Debe ingresar talla para Alevines.";
    if (
      (form.fc_unidad_produccion === "KG" ||
        form.fc_unidad_produccion === "ALIMENTO" ||
        form.fc_unidad_produccion === "MEDICAMENTO") &&
      form.fn_talla
    )
      return "No debe ingresar talla si no son Alevines.";
    return null;
  };

  // === Registrar / Actualizar ===
  const registrarVenta = async () => {
    const error = validarFormulario();
    if (error) {
      alert(error);
      return;
    }

    try {
      if (modoEdicion) {
        await axios.put(`http://localhost:5000/ventas/${ventaEditando}`, form);
        alert("Venta actualizada correctamente");
      } else {
        await axios.post("http://localhost:5000/ventas", form);
        alert("Venta registrada correctamente");
      }

      setModoEdicion(false);
      setVentaEditando(null);
      setForm({
        ...form,
        fd_fecha_venta: "",
        fn_talla: "",
        fn_cantidad_vendida: "",
        fc_cliente: "",
        fn_precio_venta: "",
        fc_lugar_entrega: "",
        fc_estado: "",
        fc_estanque_cosecha: "",
        fc_estado_pago: "",
        fc_metodo_pago: "",
        fc_observaciones: "",
      });
      obtenerVentas();
    } catch (error) {
      console.error("❌ Error al registrar/actualizar venta:", error);
      alert("Error al registrar/actualizar la venta");
    }
  };

  const eliminarVenta = async (id) => {
    if (!window.confirm("¿Eliminar esta venta?")) return;
    await axios.delete(`http://localhost:5000/ventas/${id}`);
    alert("Venta eliminada");
    obtenerVentas();
  };

  const editarVenta = (venta) => {
    setModoEdicion(true);
    setVentaEditando(venta.fi_venta_id);
    setForm({
      fd_fecha_venta: venta.fd_fecha_venta?.split("T")[0] || "",
      fn_talla: venta.fn_talla || "",
      fn_cantidad_vendida: venta.fn_cantidad_vendida || "",
      fc_cliente: venta.fc_cliente || "",
      fn_precio_venta: venta.fn_precio_venta || "",
      fc_lugar_entrega: venta.fc_lugar_entrega || "",
      fc_estado: venta.fc_estado || "",
      fc_encargado_venta: venta.fc_encargado_venta || usuario_nombre,
      fc_estanque_cosecha: venta.fc_estanque_cosecha || "",
      fc_estado_pago: venta.fc_estado_pago || "",
      fc_metodo_pago: venta.fc_metodo_pago || "",
      fc_observaciones: venta.fc_observaciones || "",
      fc_unidad_produccion: venta.fc_unidad_produccion || "",
      fi_usuario_id: venta.fi_usuario_id,
      fc_granja: venta.fc_granja || "",
    });
    setTab(tipos.indexOf(venta.fc_unidad_produccion) || 0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // === Exportar Excel ===
  const exportarExcel = () => {
    const data = ventas.map((v) => ({
      ID: v.fi_venta_id,
      Fecha: v.fd_fecha_venta?.split("T")[0],
      Cliente: v.fc_cliente,
      Cantidad: v.fn_cantidad_vendida,
      Precio: v.fn_precio_venta,
      Total: Number(v.fn_cantidad_vendida || 0) * Number(v.fn_precio_venta || 0),
      Unidad: v.fc_unidad_produccion,
      Granja: v.fc_granja,
    }));

    const hoja = XLSX.utils.json_to_sheet(data);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Ventas");

    const excelBuffer = XLSX.write(libro, { bookType: "xlsx", type: "array" });
    const archivo = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(archivo, "ventas.xlsx");
  };

  // === Registrar cliente rápido ===
  const registrarClienteRapido = async () => {
    try {
      await axios.post("http://localhost:5000/clientes", nuevoCliente);
      await obtenerClientes();
      setOpenCliente(false);
      setNuevoCliente({
        fc_nombre: "",
        fc_telefono: "",
        fc_correo: "",
        fc_localidad: "",
        fc_cp: "",
        fi_usuario_id: 1,
      });
    } catch {
      alert("No se pudo registrar el cliente");
    }
  };

  // === Tabs ===
  const handleTabChange = (_, newValue) => {
    setTab(newValue);
    setForm({ ...form, fc_unidad_produccion: tipos[newValue], fn_talla: "" });
  };

  const etiquetas = {
    ALEVIN: "Alevines (por pieza)",
    KG: "Mojarra (por Kg)",
    ALIMENTO: "Alimento (Kg)",
    MEDICAMENTO: "Medicamentos",
  };

  return (
    <Box padding={3}>
      <Typography variant="h4" align="center" fontWeight="bold">
        💰 Registro de Ventas
      </Typography>

      <Tabs
        value={tab}
        onChange={handleTabChange}
        sx={{ mb: 2, borderBottom: "2px solid #c7ff6cff" }}
      >
        <Tab label="Alevines" />
        <Tab label="Mojarra (Kg)" />
        <Tab label="Alimento" />
        <Tab label="Medicamentos" />
      </Tabs>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {etiquetas[form.fc_unidad_produccion]}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                type="date"
                label="Fecha de Venta"
                name="fd_fecha_venta"
                value={form.fd_fecha_venta}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {form.fc_unidad_produccion === "ALEVIN" && (
              <Grid item xs={12} md={4}>
                <TextField
                  name="fn_talla"
                  label="Talla"
                  value={form.fn_talla}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            )}

            <Grid item xs={12} md={4}>
              <TextField
                name="fn_cantidad_vendida"
                label={`Cantidad ${form.fc_unidad_produccion === "KG" ? "(Kg)" : ""}`}
                type="number"
                value={form.fn_cantidad_vendida}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/* CLIENTE AUTOCOMPLETE */}
            <Grid item xs={12} md={4}>
              <Grid container spacing={1}>
                <Grid item xs={10}>
                  <Autocomplete
                    freeSolo
                    fullWidth
                    options={clientes}
                    getOptionLabel={(o) => o.fc_nombre || ""}
                    value={form.fc_cliente}
                    onChange={(e, val) =>
                      setForm({ ...form, fc_cliente: val?.fc_nombre || "" })
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Cliente" />
                    )}
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    onClick={() => setOpenCliente(true)}
                  >
                    <AddIcon />
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                name="fn_precio_venta"
                label="Precio de Venta"
                type="number"
                value={form.fn_precio_venta}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                name="fc_lugar_entrega"
                label="Lugar de Entrega"
                value={form.fc_lugar_entrega}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                name="fc_granja"
                label="Granja"
                value={form.fc_granja}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="MEDELLIN">Medellín</MenuItem>
                <MenuItem value="LA CEIBA">La Ceiba</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="fc_observaciones"
                label="Observaciones"
                multiline
                rows={2}
                value={form.fc_observaciones}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          </Grid>

          <Button variant="contained" sx={{ marginTop: 3 }} onClick={registrarVenta}>
            {modoEdicion ? "Actualizar Venta" : "Registrar Venta"}
          </Button>
        </CardContent>
      </Card>

      {/* Tabla de ventas */}
      <Card sx={{ marginTop: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight="bold">
              Lista de Ventas
            </Typography>
            <Button variant="contained" color="success" onClick={exportarExcel}>
              Exportar a Excel
            </Button>
          </Box>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Unidad</TableCell>
                <TableCell>Granja</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {ventas.map((v) => (
                <TableRow key={v.fi_venta_id}>
                  <TableCell>{v.fi_venta_id}</TableCell>
                  <TableCell>{v.fd_fecha_venta?.split("T")[0]}</TableCell>
                  <TableCell>{v.fc_cliente}</TableCell>
                  <TableCell>{v.fn_cantidad_vendida}</TableCell>
                  <TableCell>${v.fn_precio_venta}</TableCell>
                  <TableCell>
                    $
                    {Number(v.fn_cantidad_vendida || 0) *
                      Number(v.fn_precio_venta || 0)}
                  </TableCell>
                  <TableCell>{v.fc_unidad_produccion}</TableCell>
                  <TableCell>{v.fc_granja}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="warning"
                      sx={{ mr: 1 }}
                      onClick={() => editarVenta(v)}
                    >
                      EDITAR
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => eliminarVenta(v.fi_venta_id)}
                    >
                      ELIMINAR
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal para nuevo cliente */}
      <Dialog open={openCliente} onClose={() => setOpenCliente(false)} fullWidth maxWidth="sm">
        <DialogTitle>Registrar nuevo cliente</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField label="Nombre o razón social" fullWidth value={nuevoCliente.fc_nombre} onChange={(e) => setNuevoCliente({ ...nuevoCliente, fc_nombre: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Teléfono" fullWidth value={nuevoCliente.fc_telefono} onChange={(e) => setNuevoCliente({ ...nuevoCliente, fc_telefono: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Correo" fullWidth value={nuevoCliente.fc_correo} onChange={(e) => setNuevoCliente({ ...nuevoCliente, fc_correo: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Localidad" fullWidth value={nuevoCliente.fc_localidad} onChange={(e) => setNuevoCliente({ ...nuevoCliente, fc_localidad: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Código postal" fullWidth value={nuevoCliente.fc_cp} onChange={(e) => setNuevoCliente({ ...nuevoCliente, fc_cp: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCliente(false)}>Cancelar</Button>
          <Button variant="contained" color="success" onClick={registrarClienteRapido}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
