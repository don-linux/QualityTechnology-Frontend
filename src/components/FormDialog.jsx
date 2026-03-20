// src/components/FormDialog.jsx
import React, { useState, useCallback } from "react";
import { API_URL } from "../utils/api.js";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import axios from "../utils/axiosInstance.js";

const FormDialog = React.memo(
  ({ open, onClose, onSubmit, formData, setFormData, editId }) => {
    const [clientes, setClientes] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [cuentas, setCuentas] = useState([]);

    const fetchDatos = useCallback(async () => {
      try {
        const [resClientes, resProveedores, resCuentas] = await Promise.all([
          axios.get(`${API_URL}/flujo-caja/clientes`),
          axios.get(`${API_URL}/flujo-caja/proveedores`),
          axios.get(`${API_URL}/cuentas`),
        ]);
        setClientes(resClientes.data);
        setProveedores(resProveedores.data);
        setCuentas(resCuentas.data);
      } catch (err) {
        console.error("Error al obtener datos:", err);
      }
    }, []);

    const handleChange = (e) => {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value ?? "" }));
    };

    const handleSave = () => {
      onSubmit(formData);
    };

    return (
      <Dialog open={open} onClose={onClose} fullWidth TransitionProps={{ onEnter: () => fetchDatos() }}>
        <DialogTitle>{editId ? "Editar Movimiento" : "Nuevo Movimiento"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={6}>
              <TextField
                label="Fecha"
                type="date"
                name="fd_fecha"
                value={formData.fd_fecha || ""}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/*  Select de cuentas */}
            <Grid size={6}>
              <TextField
                select
                label="Cuenta"
                name="fc_cuenta"
                value={formData.fc_cuenta || ""}
                onChange={handleChange}
                fullWidth
              >
                {cuentas.map((cuenta) => (
                  <MenuItem key={cuenta.id} value={cuenta.nombre}>
                    {cuenta.nombre} — ${parseFloat(cuenta.saldo).toLocaleString("es-MX")}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={6}>
              <TextField
                label="Ingreso"
                type="number"
                name="fn_ingreso"
                value={formData.fn_ingreso || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    fn_ingreso: val,
                    fn_egreso: val > 0 ? "" : prev.fn_egreso,
                    fc_beneficiario: "",
                  }));
                }}
                disabled={Number(formData.fn_egreso) > 0}
                fullWidth
                margin="dense"
              />
            </Grid>

            <Grid size={6}>
              <TextField
                label="Egreso"
                type="number"
                name="fn_egreso"
                value={formData.fn_egreso || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    fn_egreso: val,
                    fn_ingreso: val > 0 ? "" : prev.fn_ingreso,
                    fc_beneficiario: "",
                  }));
                }}
                disabled={Number(formData.fn_ingreso) > 0}
                fullWidth
                margin="dense"
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Descripción"
                name="fc_descripcion"
                value={formData.fc_descripcion || ""}
                onChange={handleChange}
                fullWidth
                multiline
              />
            </Grid>

            <Grid size={6}>
              <TextField
                label="Categoría"
                name="fc_categoria"
                value={formData.fc_categoria || ""}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid size={6}>
              <TextField
                label="Subcategoría"
                name="fc_subcategoria"
                value={formData.fc_subcategoria || ""}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/*  Beneficiario dinámico */}
            <Grid size={12}>
              <TextField
                select
                label="Beneficiario / Proveedor"
                name="fc_beneficiario"
                value={formData.fc_beneficiario || ""}
                onChange={handleChange}
                fullWidth
                disabled={!formData.fn_ingreso && !formData.fn_egreso}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        backgroundColor: "#ffffff !important",
                        color: "#000000 !important",
                        "& .MuiMenuItem-root": {
                          color: "#000000 !important",
                          "&:hover": {
                            backgroundColor: "#f5f5f5 !important",
                          },
                        },
                      },
                    },
                  },
                }}
              >
                {Number(formData.fn_ingreso) > 0 &&
                  clientes.map((cli) => (
                    <MenuItem key={cli.nombre} value={cli.nombre}>
                      {cli.nombre}
                    </MenuItem>
                  ))}

                {Number(formData.fn_egreso) > 0 &&
                  proveedores.map((prov) => (
                    <MenuItem key={prov.nombre} value={prov.nombre}>
                      {prov.nombre}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>

            <Grid size={6}>
              <TextField
                label="Proyecto"
                name="fc_noproyecto"
                value={formData.fc_noproyecto || ""}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
{/*  Menú de factura con 3 opciones */}
<Grid size={6}>
  <TextField
    select
    label="Factura"
    name="fc_factura_opcion"
    value={formData.fc_factura_opcion || ""}
    onChange={(e) => {
      const opcion = e.target.value;
      setFormData((prev) => ({
        ...prev,
        fc_factura_opcion: opcion,
        fc_factura:
          opcion === "NO_APLICA"
            ? "NO"
            : opcion === "PENDIENTE"
            ? ""
            : prev.fc_factura,
        facturaFile: opcion === "CON_FACTURA" ? prev.facturaFile : null,
      }));
    }}
    fullWidth
  >
    <MenuItem value="APLICA">Con factura</MenuItem>
    <MenuItem value="PENDIENTE">Pendiente</MenuItem>
    <MenuItem value="NO_APLICA">No aplica</MenuItem>
  </TextField>
</Grid>

    {/*  Mostrar botón de carga solo si elige "Con factura" */}
    {formData.fc_factura_opcion === "APLICA" && (
      <Grid size={6}>
        <Button
          variant="outlined"
          component="label"
          fullWidth
          sx={{ textTransform: "none" }}
        >
          {formData.facturaFile ? formData.facturaFile.name : "Subir factura"}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                facturaFile: e.target.files[0],
              }))
            }
          />
        </Button>
      </Grid>
    )}
            <Grid size={6}>
              <TextField
                select
                label="Estatus"
                name="fc_estatus"
                value={formData.fc_estatus || ""}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="REPOSICION">Reposición</MenuItem>
                <MenuItem value="LIQUIDADO">Liquidado</MenuItem>
                <MenuItem value="ADEUDO">Adeudo</MenuItem>
                <MenuItem value="PARCIAL">Parcial</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="success">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

export default FormDialog;
