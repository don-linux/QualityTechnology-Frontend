// src/components/FormDialog.jsx
import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, TextField, Button, MenuItem
} from "@mui/material";

const FormDialog = React.memo(({ open, onClose, onSubmit, formData, setFormData, editId }) => {
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value ?? "" }));
  };

  const handleSave = () => onSubmit(formData);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{editId ? "Editar Movimiento" : "Nuevo Movimiento"}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
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

          <Grid item xs={6}>
            <TextField
              label="Cuenta"
              name="fc_cuenta"
              value={formData.fc_cuenta || ""}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Ingreso"
              type="number"
              name="fn_ingreso"
              value={formData.fn_ingreso || ""}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Egreso"
              type="number"
              name="fn_egreso"
              value={formData.fn_egreso || ""}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Descripción"
              name="fc_descripcion"
              value={formData.fc_descripcion || ""}
              onChange={handleChange}
              fullWidth
              multiline
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Categoría"
              name="fc_categoria"
              value={formData.fc_categoria || ""}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Factura"
              name="fc_factura"
              value={formData.fc_factura || ""}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
            <Grid item xs={12}>
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
});

export default FormDialog;
