import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import ListadoToolbar from "@shared/components/ListadoToolbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import useSnackbar from "@shared/hooks/useSnackbar";
import { exportarTablaExcel, exportarTablaPDF } from "@shared/utils/exportarTabla";
import { seccionToExportColumns } from "./cicloEngordaSecciones";
import { campoFormSx } from "@shared/components/FormularioInventarioSecciones";

const headerCell = { fontWeight: "bold", bgcolor: "#004d73", color: "#fff" };

function filtrarFilas(rows, query, searchKeys) {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) =>
    searchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(q)),
  );
}

function buildEmptyForm(fields) {
  const form = {};
  for (const field of fields) {
    form[field.name] = field.default ?? "";
  }
  return form;
}

function rowToForm(row, fields) {
  const form = buildEmptyForm(fields);
  for (const field of fields) {
    const val = row[field.name];
    form[field.name] = val == null ? "" : String(val);
  }
  return form;
}

function payloadFromForm(form, fields) {
  const payload = {};
  for (const field of fields) {
    const raw = form[field.name];
    if (raw === "" || raw == null) {
      if (field.type === "number") payload[field.name] = null;
      else payload[field.name] = null;
      continue;
    }
    payload[field.name] =
      field.type === "number" ? Number(raw) : raw;
  }
  return payload;
}

export default function CicloEngordaTablaSeccion({
  cicloId,
  cicloLabel,
  seccion,
  rows = [],
  onCreate,
  onUpdate,
  onDelete,
  onReload,
}) {
  const showSnackbar = useSnackbar();
  const { visible, toggle, cerrar } = useFormularioVisible();
  const [busqueda, setBusqueda] = useState("");
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(() => buildEmptyForm(seccion.fields));
  const [guardando, setGuardando] = useState(false);

  const filas = useMemo(
    () => filtrarFilas(rows, busqueda, seccion.searchKeys ?? []),
    [rows, busqueda, seccion.searchKeys],
  );

  const exportColumnas = useMemo(() => seccionToExportColumns(seccion), [seccion]);

  const resetForm = () => {
    setEditId(null);
    setFormData(buildEmptyForm(seccion.fields));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setFormData(rowToForm(row, seccion.fields));
    if (!visible) toggle();
  };

  const handleDelete = async (row) => {
    if (!window.confirm("¿Eliminar este registro?")) return;
    try {
      await onDelete(row.id);
      showSnackbar("Registro eliminado.", "success");
      await onReload?.();
    } catch (err) {
      console.error(err);
      showSnackbar("No se pudo eliminar el registro.", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const field of seccion.fields) {
      if (field.required && !String(formData[field.name] ?? "").trim()) {
        showSnackbar(`El campo ${field.label} es obligatorio.`, "error");
        return;
      }
    }
    setGuardando(true);
    try {
      const payload = payloadFromForm(formData, seccion.fields);
      if (editId) {
        await onUpdate(editId, payload);
        showSnackbar("Registro actualizado.", "success");
      } else {
        await onCreate(payload);
        showSnackbar("Registro creado.", "success");
      }
      resetForm();
      cerrar();
      await onReload?.();
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.error ?? "Error al guardar.", "error");
    } finally {
      setGuardando(false);
    }
  };

  const tituloExport = `${seccion.label} — ${cicloLabel ?? cicloId}`;

  return (
    <Box>
      <ListadoToolbar
        busqueda={busqueda}
        onBuscar={setBusqueda}
        placeholder={`Buscar en ${seccion.label.toLowerCase()}...`}
        exportDisabled={!filas.length}
        onExportarExcel={() =>
          exportarTablaExcel({
            columnas: exportColumnas,
            filas,
            nombreHoja: seccion.label,
            nombreArchivo: `${seccion.exportNombre}_${cicloLabel ?? cicloId}`,
            color: [0, 77, 115],
          })
        }
        onExportarPDF={() =>
          exportarTablaPDF({
            columnas: exportColumnas,
            filas,
            titulo: tituloExport,
            nombreArchivo: `${seccion.exportNombre}_${cicloLabel ?? cicloId}`,
            color: [0, 77, 115],
          })
        }
      />

      <FormularioRegistroPanel
        visible={visible}
        onToggle={() => {
          if (visible) resetForm();
          toggle();
        }}
        label={editId ? "EDITAR REGISTRO" : "+ NUEVO REGISTRO"}
      >
        <Paper sx={{ p: 2, mb: 2 }} component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {seccion.fields.map((field) => (
              <Grid key={field.name} size={{ xs: 12, sm: field.multiline ? 12 : 6, md: 4 }}>
                <TextField
                  fullWidth
                  select={field.type === "select"}
                  type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                  multiline={Boolean(field.multiline)}
                  rows={field.multiline ? 2 : undefined}
                  label={field.label}
                  name={field.name}
                  value={formData[field.name] ?? ""}
                  onChange={handleChange}
                  sx={campoFormSx}
                  slotProps={field.type === "date" ? { inputLabel: { shrink: true } } : undefined}
                >
                  {field.type === "select"
                    ? field.options.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))
                    : null}
                </TextField>
              </Grid>
            ))}
            <Grid size={12}>
              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button type="button" onClick={() => { resetForm(); cerrar(); }}>
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" disabled={guardando}>
                  {editId ? "Guardar cambios" : "Registrar"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </FormularioRegistroPanel>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {seccion.columns.map((col) => (
                <TableCell key={col.key} sx={headerCell}>
                  {col.header}
                </TableCell>
              ))}
              <TableCell sx={headerCell} align="center">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={seccion.columns.length + 1} align="center">
                  Sin registros
                </TableCell>
              </TableRow>
            ) : (
              filas.map((row) => (
                <TableRow key={row.id} hover>
                  {seccion.columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(row) : row[col.key] ?? ""}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    <IconButton size="small" color="primary" onClick={() => handleEdit(row)} aria-label="Editar">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(row)} aria-label="Eliminar">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
