import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

/**
 * Selector de empleado activo como responsable (nombre_completo).
 */
export default function CampoResponsableEmpleado({
  name = "responsable",
  value = "",
  onChange,
  empleados = [],
  error = false,
  helperText,
  fullWidth = true,
  size = "small",
  disabled = false,
  required = false,
}) {
  const valor = value ?? "";
  const valorEnCatalogo = empleados.some((e) => e.nombre_completo === valor);

  return (
    <TextField
      select
      label="Responsable"
      name={name}
      value={valor}
      onChange={onChange}
      fullWidth={fullWidth}
      size={size}
      disabled={disabled}
      required={required}
      error={error}
      helperText={helperText}
    >
      <MenuItem value="">Selecciona un empleado</MenuItem>
      {empleados.map((empleado) => (
        <MenuItem key={empleado.empleado_id} value={empleado.nombre_completo}>
          {empleado.nombre_completo}
        </MenuItem>
      ))}
      {valor && !valorEnCatalogo && <MenuItem value={valor}>{valor}</MenuItem>}
    </TextField>
  );
}
