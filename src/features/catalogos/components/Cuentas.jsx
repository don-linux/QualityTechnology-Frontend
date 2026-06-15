import React, { useState, useEffect } from "react";
import {
  listCuentas,
  createCuenta,
  updateCuenta,
  activateCuenta,
  deactivateCuenta,
} from "@features/catalogos/services/cuentasService";
import { listUnidadesNegocioActivas } from "@features/catalogos/services/unidadesNegocioService";
import { TIPO_CUENTA_OPTIONS } from "@shared/constants/cuentas";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import { formatPrecio } from "@shared/utils/formatters";
import { ordenarYNumerar } from "@shared/utils/ordenarFilas";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";

const EMPTY_FORM = {
  fi_cuenta_id: null,
  fc_udn: "",
  fc_nombre: "",
  fc_numero_cuenta: "",
  fc_banco: "",
  fc_tipo: "",
};

export default function Cuentas() {
  const showSnackbar = useSnackbar();
  const [form, setForm] = useState(EMPTY_FORM);
  const [cuentas, setCuentas] = useState([]);
  const [unidadesNegocio, setUnidadesNegocio] = useState([]);
  const [loading, setLoading] = useState(true);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  const esEdicion = !!form.fi_cuenta_id;

  const requiredFields = ["fc_udn", "fc_nombre", "fc_tipo"];

  useEffect(() => {
    obtenerCuentas();
    obtenerUnidadesNegocio();
  }, []);

  const obtenerCuentas = async () => {
    setLoading(true);
    try {
      const { data } = await listCuentas();
      setCuentas(data);
    } catch (e) {
      console.error(e);
      showSnackbar("Error al cargar cuentas", "error");
    } finally {
      setLoading(false);
    }
  };

  const obtenerUnidadesNegocio = async () => {
    try {
      const { data } = await listUnidadesNegocioActivas();
      setUnidadesNegocio(data);
    } catch (e) {
      console.error(e);
      showSnackbar("Error al cargar unidades de negocio", "error");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearFieldError(e.target.name);
  };

  const limpiar = () => {
    setForm(EMPTY_FORM);
    clearErrors();
    cerrarFormulario();
  };

  const construirPayload = () => ({
    fc_udn: form.fc_udn,
    fc_nombre: form.fc_nombre.trim(),
    fc_numero_cuenta: form.fc_numero_cuenta?.trim() || null,
    fc_banco: form.fc_banco?.trim() || null,
    fc_tipo: form.fc_tipo,
  });

  const registrar = async () => {
    if (!validate(form, requiredFields)) return;
    try {
      await createCuenta(construirPayload());
      await obtenerCuentas();
      limpiar();
      showSnackbar("Cuenta registrada correctamente", "success");
    } catch (e) {
      console.error(e);
      const mensaje = e?.response?.data?.error || "Error al registrar cuenta";
      showSnackbar(mensaje, "error");
    }
  };

  const actualizar = async () => {
    if (!esEdicion) return;
    if (!validate(form, requiredFields)) return;
    try {
      await updateCuenta(form.fi_cuenta_id, construirPayload());
      await obtenerCuentas();
      limpiar();
      showSnackbar("Cuenta actualizada correctamente", "success");
    } catch (e) {
      console.error(e);
      const mensaje = e?.response?.data?.error || "Error al actualizar cuenta";
      showSnackbar(mensaje, "error");
    }
  };

  const desactivar = async (cuenta) => {
    if (!(await confirm(`¿Desactivar la cuenta "${cuenta.fc_nombre}"?`))) return;
    try {
      await deactivateCuenta(cuenta.fi_cuenta_id);
      await obtenerCuentas();
      if (form.fi_cuenta_id === cuenta.fi_cuenta_id) limpiar();
    } catch (e) {
      console.error(e);
      showSnackbar("Error al desactivar cuenta", "error");
    }
  };

  const activar = async (cuenta) => {
    if (!(await confirm(`¿Activar la cuenta "${cuenta.fc_nombre}"?`))) return;
    try {
      await activateCuenta(cuenta.fi_cuenta_id);
      await obtenerCuentas();
      if (form.fi_cuenta_id === cuenta.fi_cuenta_id) limpiar();
    } catch (e) {
      console.error(e);
      showSnackbar("Error al activar cuenta", "error");
    }
  };

  const seleccionar = (cuenta) => {
    setForm({
      fi_cuenta_id: cuenta.fi_cuenta_id,
      fc_udn: cuenta.fc_udn || "",
      fc_nombre: cuenta.fc_nombre || "",
      fc_numero_cuenta: cuenta.fc_numero_cuenta || "",
      fc_banco: cuenta.fc_banco || "",
      fc_tipo: cuenta.fc_tipo || "",
    });
    clearErrors();
    abrirFormulario();
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
      <Box textAlign="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Catálogo de Cuentas</Typography>
        <Typography variant="body2" color="text.secondary">
          Administra las cuentas financieras de la organización
        </Typography>
      </Box>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
      <Card sx={{ mb: 4, borderRadius: 4, boxShadow: 4, border: "1px solid #eee" }}>
        <CardContent>
          <Typography variant="subtitle1" mb={2} fontWeight="bold">
            {esEdicion ? "Editando Cuenta" : "Nueva Cuenta"}
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                name="fc_udn"
                label="UdN"
                fullWidth
                value={form.fc_udn}
                onChange={handleChange}
                error={!!errors.fc_udn}
                helperText={errors.fc_udn}
              >
                {unidadesNegocio.map((u) => (
                  <MenuItem key={u.fi_unidad_negocio_id} value={u.fc_nombre}>
                    {u.fc_nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                name="fc_tipo"
                label="Tipo de cuenta"
                fullWidth
                value={form.fc_tipo}
                onChange={handleChange}
                error={!!errors.fc_tipo}
                helperText={errors.fc_tipo}
              >
                {TIPO_CUENTA_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={12}>
              <TextField
                name="fc_nombre"
                label="Nombre de la cuenta"
                fullWidth
                value={form.fc_nombre}
                onChange={handleChange}
                error={!!errors.fc_nombre}
                helperText={errors.fc_nombre}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="fc_numero_cuenta"
                label="Número de cuenta"
                fullWidth
                value={form.fc_numero_cuenta}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="fc_banco"
                label="Nombre del banco"
                fullWidth
                value={form.fc_banco}
                onChange={handleChange}
                error={!!errors.fc_banco}
                helperText={errors.fc_banco || "Opcional. Máximo 150 caracteres."}
                inputProps={{ maxLength: 150 }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} mt={1}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button fullWidth variant="contained" color="success" onClick={registrar} disabled={esEdicion}>
                Registrar
              </Button>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button fullWidth variant="contained" onClick={actualizar} disabled={!esEdicion}>
                Actualizar
              </Button>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button fullWidth variant="outlined" onClick={limpiar}>Limpiar</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      </FormularioRegistroPanel>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ maxHeight: 500, overflowY: "auto" }}>
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>UdN</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Número</TableCell>
                  <TableCell>Banco</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="right">Saldo actual</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ordenarYNumerar(cuentas, ["fi_cuenta_id", "cuenta_id"]).map((cuenta) => (
                  <TableRow key={cuenta.fi_cuenta_id} hover>
                    <TableCell>{cuenta._num}</TableCell>
                    <TableCell>{cuenta.fc_udn}</TableCell>
                    <TableCell>{cuenta.fc_nombre}</TableCell>
                    <TableCell>{cuenta.fc_numero_cuenta || "—"}</TableCell>
                    <TableCell>{cuenta.fc_banco || "—"}</TableCell>
                    <TableCell>{cuenta.fc_tipo}</TableCell>
                    <TableCell align="right">{formatPrecio(cuenta.fn_saldo_actual)}</TableCell>
                    <TableCell>
                      <Chip
                        label={cuenta.fb_activo ? "Activa" : "Inactiva"}
                        color={cuenta.fb_activo ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 1, flexWrap: "nowrap" }}>
                        <Button size="small" variant="outlined" onClick={() => seleccionar(cuenta)}>Seleccionar</Button>
                        {cuenta.fb_activo ? (
                          <Button size="small" variant="outlined" color="error" onClick={() => desactivar(cuenta)}>
                            Desactivar
                          </Button>
                        ) : (
                          <Button size="small" variant="outlined" color="success" onClick={() => activar(cuenta)}>
                            Activar
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {cuentas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No hay cuentas registradas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      {ConfirmModal}
    </Container>
  );
}
