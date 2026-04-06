import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Paper from "@mui/material/Paper";
import axios from "../../utils/axiosInstance.js";
import useFormValidation from "../../hooks/useFormValidation";
import useConfirm from "../../hooks/useConfirm";

const getTipoBanio = (row) => {
  return row.fc_tipo_banio || "";
};

function BitacoraBanosContent() {
  const [form, setForm] = useState({
    fc_mes: "",
    fc_dia: "",
    fc_tipo_banio: "",
    fc_regadera: "",
    fc_realizo: "",
    fc_observaciones: "",
    fi_usuario_id: 1,
  });

  const [data, setData] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  const requiredFields = [
    "fc_mes", "fc_dia", "fc_tipo_banio",
    "fc_regadera", "fc_realizo", "fc_observaciones",
  ];

  const handleChange = (e) => {
    clearFieldError(e.target.name);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  //  Cargar datos
  const cargarDatos = async () => {
    try {
      const res = await axios.get("/medellin/banos");
      setData(res.data);
    } catch {
      alert("Error al cargar registros.");
    }
  };

  const cargarEmpleados = async () => {
    try {
      const res = await axios.get("/medellin/banos/empleados");
      setEmpleados(res.data);
    } catch {
      alert("Error al cargar empleados.");
    }
  };

  useEffect(() => {
    cargarDatos();
    cargarEmpleados();
  }, []);

  //  Guardar / Actualizar
  const guardar = async () => {
    if (!validate(form, requiredFields)) return;
    try {
      if (editId) {
        await axios.put(`/medellin/banos/${editId}`, form);
        alert("Registro actualizado");
      } else {
        await axios.post("/medellin/banos", form);
        alert("Registro guardado");
      }

      setForm({
        fc_mes: "",
        fc_dia: "",
        fc_tipo_banio: "",
        fc_regadera: "",
        fc_realizo: "",
        fc_observaciones: "",
        fi_usuario_id: 1,
      });
      setEditId(null);
      cargarDatos();
    } catch {
      alert("Error al guardar registro.");
    }
  };

  //  Editar
  const editar = (row) => {
    clearErrors();
    setEditId(row.fi_id);
    setForm({
      fc_mes: row.fc_mes,
      fc_dia: row.fc_dia,
      fc_tipo_banio: getTipoBanio(row),
      fc_regadera: row.fc_regadera,
      fc_realizo: row.fc_realizo,
      fc_observaciones: row.fc_observaciones,
      fi_usuario_id: row.fi_usuario_id,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  //  Eliminar uno
  const eliminar = async (id) => {
    if (!await confirm("¿Eliminar registro?")) return;
    await axios.delete(`/medellin/banos/${id}`);
    cargarDatos();
  };

  //  Eliminar todos
  const eliminarTodos = async () => {
    if (!await confirm(" ¿Deseas eliminar TODOS los registros? Esta acción no se puede deshacer.")) return;
    await axios.delete(`/medellin/banos`);
    cargarDatos();
  };

  //  Exportar PDF
  const exportarPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF("l", "mm", "a4");
    const logoMedellin = `${""}/images/medellin.png`;

    // Encabezado
    doc.addImage(logoMedellin, "PNG", 10, 8, 25, 25);
    doc.setFontSize(14);
    doc.text("Bitácora de Baños - Granja Acuícola Medellín", 45, 20);
    doc.setFontSize(10);
    doc.text("Control de limpieza y mantenimiento de baños y regaderas", 45, 26);

    const columnas = [
      "Mes",
      "Día",
      "Tipo de Baño",
      "Regadera",
      "Realizó",
      "Observaciones",
    ];

    const filas = data.map((r) => [
      r.fc_mes,
      r.fc_dia,
      getTipoBanio(r),
      r.fc_regadera,
      r.fc_realizo,
      r.fc_observaciones,
    ]);

    autoTable(doc, {
      startY: 40,
      head: [columnas],
      body: filas,
      styles: { fontSize: 8, cellWidth: "wrap" },
      headStyles: {
        fillColor: [33, 150, 243], // Azul Medellín
        textColor: 255,
        halign: "center",
      },
      bodyStyles: { valign: "middle" },
    });

    const fecha = new Date().toLocaleDateString();
    doc.text(`Fecha de generación: ${fecha}`, 10, doc.lastAutoTable.finalY + 10);
    doc.save(`Bitacora_Banos_Medellin_${fecha}.pdf`);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
         Medellín — Baños
      </Typography>

      {/* FORMULARIO */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                label="Mes"
                name="fc_mes"
                value={form.fc_mes}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_mes}
                helperText={errors.fc_mes}
              >
                <MenuItem value="">Selecciona un mes</MenuItem>
                <MenuItem value="Enero">Enero</MenuItem>
                <MenuItem value="Febrero">Febrero</MenuItem>
                <MenuItem value="Marzo">Marzo</MenuItem>
                <MenuItem value="Abril">Abril</MenuItem>
                <MenuItem value="Mayo">Mayo</MenuItem>
                <MenuItem value="Junio">Junio</MenuItem>
                <MenuItem value="Julio">Julio</MenuItem>
                <MenuItem value="Agosto">Agosto</MenuItem>
                <MenuItem value="Septiembre">Septiembre</MenuItem>
                <MenuItem value="Octubre">Octubre</MenuItem>
                <MenuItem value="Noviembre">Noviembre</MenuItem>
                <MenuItem value="Diciembre">Diciembre</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Día"
                name="fc_dia"
                type="number"
                value={form.fc_dia}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_dia}
                helperText={errors.fc_dia}
                inputProps={{ min: 1, max: 31 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                label="Tipo de Baño"
                name="fc_tipo_banio"
                value={form.fc_tipo_banio}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_tipo_banio}
                helperText={errors.fc_tipo_banio}
              >
                <MenuItem value="">Selecciona un tipo</MenuItem>
                <MenuItem value="Hombre">Hombre</MenuItem>
                <MenuItem value="Mujer">Mujer</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Regadera" name="fc_regadera" value={form.fc_regadera} onChange={handleChange} fullWidth error={!!errors.fc_regadera} helperText={errors.fc_regadera} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                label="Realizó"
                name="fc_realizo"
                value={form.fc_realizo}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_realizo}
                helperText={errors.fc_realizo}
              >
                <MenuItem value="">Selecciona un empleado</MenuItem>
                {empleados.map((empleado) => (
                  <MenuItem key={empleado.fi_empleado_id} value={empleado.fc_nombre_completo}>
                    {empleado.fc_nombre_completo}
                  </MenuItem>
                ))}
                {form.fc_realizo && !empleados.some((e) => e.fc_nombre_completo === form.fc_realizo) && (
                  <MenuItem value={form.fc_realizo}>{form.fc_realizo}</MenuItem>
                )}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                label="Observaciones"
                name="fc_observaciones"
                multiline
                rows={2}
                fullWidth
                value={form.fc_observaciones}
                onChange={handleChange}
                error={!!errors.fc_observaciones}
                helperText={errors.fc_observaciones}
              />
            </Grid>
          </Grid>

          {/* BOTONES */}
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" onClick={guardar}>
              {editId ? "Actualizar" : "Guardar"}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              sx={{ ml: 2 }}
              onClick={exportarPDF}
            >
               Exportar PDF
            </Button>
            <Button
              variant="contained"
              color="error"
              sx={{ ml: 2 }}
              onClick={eliminarTodos}
            >
               Eliminar Todos
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* TABLA */}
      <Paper>
        <Table>
          <TableHead sx={{ background: "#E3F2FD" }}>
            <TableRow>
              <TableCell>Mes</TableCell>
              <TableCell>Día</TableCell>
              <TableCell>Tipo de Baño</TableCell>
              <TableCell>Regadera</TableCell>
              <TableCell>Realizó</TableCell>
              <TableCell>Observaciones</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((r) => (
              <TableRow key={r.fi_id}>
                <TableCell>{r.fc_mes}</TableCell>
                <TableCell>{r.fc_dia}</TableCell>
                <TableCell>{getTipoBanio(r)}</TableCell>
                <TableCell>{r.fc_regadera}</TableCell>
                <TableCell>{r.fc_realizo}</TableCell>
                <TableCell>{r.fc_observaciones}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="contained"
                    color="warning"
                    onClick={() => editar(r)}
                    sx={{ mr: 1 }}
                  >
                    Editar
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    onClick={() => eliminar(r.fi_id)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      {ConfirmModal}
    </Box>
  );
}

export default function BitacoraBanos() {
  return <BitacoraBanosContent />;
}
