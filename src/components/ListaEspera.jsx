import React, { useState, useEffect } from "react";
import { API_URL } from "../utils/api.js";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Autocomplete from "@mui/material/Autocomplete";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import AddIcon from "@mui/icons-material/Add";
import axios from "../utils/axiosInstance.js";
import useFormValidation from "../hooks/useFormValidation";
import useConfirm from "../hooks/useConfirm";
import FormHelperText from "@mui/material/FormHelperText";

export default function ListaEspera() {
  return <ListaEsperaContent />;
}

function ListaEsperaContent() {
  const rol = localStorage.getItem("rol") || "";
  const nombreUsuario = localStorage.getItem("nombre") || "";
  const usuarioId = localStorage.getItem("usuario_id") || "";

  const granjaDefault =
    rol === "Jefe GAM" ? "Medellin" : rol === "Jefe GAC" ? "La Ceiba" : "";

  const [editId, setEditId] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [openCliente, setOpenCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    fc_nombre: "",
    fc_telefono: "",
    fc_correo: "",
    fc_localidad: "",
    fc_cp: "",
    fi_usuario_id: usuarioId,
  });

  const emptyForm = {
    fd_fecha_entrega: "",
    fc_talla: "",
    fn_cantidad: "",
    fc_cliente: "",
    fc_lugar_entrega: "",
    fc_encargado_venta: nombreUsuario,
    fc_unidad_produccion: "",
    fc_hora_embolsado: "",
    fc_hora_entrega: "",
    fn_precio_venta: "",
    fc_uap_asignada: "",
    fc_granja_asignada: granjaDefault,
  };

  const [form, setForm] = useState(emptyForm);
  const [lista, setLista] = useState([]);

  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  const requiredFields = [
    "fd_fecha_entrega", "fc_talla", "fn_cantidad", "fc_cliente",
    "fc_lugar_entrega", "fc_unidad_produccion", "fc_hora_embolsado",
    "fc_hora_entrega", "fn_precio_venta", "fc_uap_asignada",
    "fc_granja_asignada",
  ];

  const cargarLista = async () => {
    try {
      const res = await axios.get(`${API_URL}/lista-espera`);
      setLista(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al cargar lista de espera:", err);
      setLista([]);
    }
  };

  const cargarClientes = async () => {
    try {
      const res = await axios.get(`${API_URL}/clientes`);
      setClientes(res.data);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
    }
  };

  useEffect(() => {
    cargarLista();
    cargarClientes();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearFieldError(e.target.name);
  };

  const registrar = async () => {
    if (!validate(form, requiredFields)) return;

    if (!form.fd_fecha_entrega) {
      alert("Debes seleccionar una fecha de entrega.");
      return;
    }

    try {
      await axios.post(`${API_URL}/lista-espera`, form);
      alert("Registrado en Lista de Espera");
      setForm(emptyForm);
      cargarLista();
    } catch (err) {
      console.error("Error al registrar en lista de espera:", err);
    }
  };

  const editar = (item) => {
    clearErrors();
    setEditId(item.fi_lista_id);
    setForm(item);
  };

  const actualizar = async () => {
    if (!validate(form, requiredFields)) return;

    try {
      await axios.put(`${API_URL}/lista-espera/${editId}`, form);
      alert("Actualizado correctamente");
      setEditId(null);
      setForm(emptyForm);
      cargarLista();
    } catch (err) {
      console.error("Error al actualizar en lista de espera:", err);
    }
  };

  const eliminar = async (id) => {
    if (!await confirm("¿Eliminar este registro?")) return;

    try {
      await axios.delete(`${API_URL}/lista-espera/${id}`);
      alert("Eliminado");
      cargarLista();
    } catch (err) {
      console.error("Error al eliminar en lista de espera:", err);
    }
  };

  const convertir = async (id) => {
    if (!await confirm("¿Convertir a venta real?")) return;

    try {
      await axios.post(`${API_URL}/lista-espera/convertir/${id}`);
      alert("Convertido a venta correctamente");
      cargarLista();
    } catch (err) {
      const message = err?.response?.data?.error || err.message;
      alert("Error al convertir: " + message);
    }
  };

  const registrarClienteRapido = async () => {
    try {
      await axios.post(`${API_URL}/clientes`, nuevoCliente);
      await cargarClientes();
      setOpenCliente(false);
      setNuevoCliente({
        fc_nombre: "",
        fc_telefono: "",
        fc_correo: "",
        fc_localidad: "",
        fc_cp: "",
        fi_usuario_id: usuarioId,
      });
    } catch (err) {
      alert("Error al registrar cliente");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
         Lista de Espera
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Registrar / Editar Pedido
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              type="date"
              label="Fecha de Entrega"
              name="fd_fecha_entrega"
              value={form.fd_fecha_entrega}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!!errors.fd_fecha_entrega}
              helperText={errors.fd_fecha_entrega}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Talla" name="fc_talla" value={form.fc_talla} onChange={handleChange} error={!!errors.fc_talla} helperText={errors.fc_talla} />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth type="number" label="Cantidad" name="fn_cantidad" value={form.fn_cantidad} onChange={handleChange} error={!!errors.fn_cantidad} helperText={errors.fn_cantidad} />
          </Grid>

          {/* CLIENTE AUTOCOMPLETE */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Grid container spacing={1}>
              <Grid size={10}>
                <Autocomplete
                  freeSolo
                  fullWidth
                  options={clientes}
                  getOptionLabel={(o) => o.fc_nombre || ""}
                  value={form.fc_cliente}
                  onChange={(e, val) => {
                    setForm({ ...form, fc_cliente: val?.fc_nombre || "" });
                    clearFieldError("fc_cliente");
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Cliente" error={!!errors.fc_cliente} helperText={errors.fc_cliente} />
                  )}
                />
              </Grid>
              <Grid size={2}>
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

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Lugar" name="fc_lugar_entrega" value={form.fc_lugar_entrega} onChange={handleChange} error={!!errors.fc_lugar_entrega} helperText={errors.fc_lugar_entrega} />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Unidad Producción" name="fc_unidad_produccion" value={form.fc_unidad_produccion} onChange={handleChange} error={!!errors.fc_unidad_produccion} helperText={errors.fc_unidad_produccion} />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Hora Embolsado" name="fc_hora_embolsado" value={form.fc_hora_embolsado} onChange={handleChange} error={!!errors.fc_hora_embolsado} helperText={errors.fc_hora_embolsado} />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Hora Entrega" name="fc_hora_entrega" value={form.fc_hora_entrega} onChange={handleChange} error={!!errors.fc_hora_entrega} helperText={errors.fc_hora_entrega} />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Precio Venta" name="fn_precio_venta" value={form.fn_precio_venta} onChange={handleChange} error={!!errors.fn_precio_venta} helperText={errors.fn_precio_venta} />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth error={!!errors.fc_uap_asignada}>
              <InputLabel>Tipo de Venta</InputLabel>
              <Select
                name="fc_uap_asignada"
                value={form.fc_uap_asignada}
                onChange={handleChange}
                label="Tipo de Venta"
              >
                <MenuItem value="ALEVIN">Alevines (por pieza)</MenuItem>
                <MenuItem value="KG">Mojarra (por Kg)</MenuItem>
                <MenuItem value="ALIMENTO">Alimento</MenuItem>
                <MenuItem value="MEDICAMENTO">Medicamento</MenuItem>
              </Select>
              {errors.fc_uap_asignada && <FormHelperText>{errors.fc_uap_asignada}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            {rol === "Administrador" ? (
              <TextField select fullWidth label="Granja" name="fc_granja_asignada" value={form.fc_granja_asignada} onChange={handleChange} error={!!errors.fc_granja_asignada} helperText={errors.fc_granja_asignada}>
                <MenuItem value="Medellin">Medellín</MenuItem>
                <MenuItem value="La Ceiba">La Ceiba</MenuItem>
              </TextField>
            ) : (
              <TextField fullWidth label="Granja" name="fc_granja_asignada" value={form.fc_granja_asignada} slotProps={{ input: { readOnly: true } }} />
            )}
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          {!editId ? (
            <Button variant="contained" onClick={registrar}>
              Registrar en Lista de Espera
            </Button>
          ) : (
            <>
              <Button variant="contained" color="warning" onClick={actualizar}>
                Actualizar
              </Button>
              <Button
                variant="outlined"
                color="error"
                sx={{ ml: 2 }}
                onClick={() => {
                  setEditId(null);
                  setForm(emptyForm);
                  clearErrors();
                }}
              >
                Cancelar
              </Button>
            </>
          )}
        </Box>
      </Paper>

      {/* Tabla */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Lista de Pedidos
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Lugar</TableCell>
                <TableCell>Granja</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lista.map((item) => (
                <TableRow key={item.fi_lista_id}>
                  <TableCell>{item.fd_fecha_entrega}</TableCell>
                  <TableCell>{item.fc_cliente}</TableCell>
                  <TableCell>{item.fn_cantidad}</TableCell>
                  <TableCell>{item.fc_lugar_entrega}</TableCell>
                  <TableCell>{item.fc_granja_asignada}</TableCell>
                  <TableCell>${item.fn_precio_venta}</TableCell>
                  <TableCell>
                    <Button variant="outlined" color="warning" sx={{ mr: 1 }} onClick={() => editar(item)}>
                      Editar
                    </Button>
                    <Button variant="outlined" color="error" sx={{ mr: 1 }} onClick={() => eliminar(item.fi_lista_id)}>
                      Eliminar
                    </Button>
                    <Button variant="contained" color="success" onClick={() => convertir(item.fi_lista_id)}>
                      Convertir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal para cliente rápido */}
      <Dialog open={openCliente} onClose={() => setOpenCliente(false)} fullWidth maxWidth="sm">
        <DialogTitle>Registrar nuevo cliente</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <TextField label="Nombre o razón social" fullWidth value={nuevoCliente.fc_nombre} onChange={(e) => setNuevoCliente({ ...nuevoCliente, fc_nombre: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField label="Teléfono" fullWidth value={nuevoCliente.fc_telefono} onChange={(e) => setNuevoCliente({ ...nuevoCliente, fc_telefono: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField label="Correo" fullWidth value={nuevoCliente.fc_correo} onChange={(e) => setNuevoCliente({ ...nuevoCliente, fc_correo: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField label="Localidad" fullWidth value={nuevoCliente.fc_localidad} onChange={(e) => setNuevoCliente({ ...nuevoCliente, fc_localidad: e.target.value })} />
            </Grid>
            <Grid size={6}>
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
      {ConfirmModal}
    </Box>
  );
}
