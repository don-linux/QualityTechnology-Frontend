// src/components/EmpleadosRegistro.jsx
import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import dayjs from "dayjs";
import { apiFetch } from "../utils/api";
import useFormValidation from "../hooks/useFormValidation";

export default function EmpleadosRegistro() {
  const [form, setForm] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    genero: "",
    calle: "",
    cp: "",
    referencia: "",
    comentarios: "",
    usuario_id: "3", // fijo (puedes ajustarlo según login)
    puesto_id: "",
    departamento_id: "",
    ciudad_id: "",
    estado_id: "",
    edad: "",
    fecha_nacimiento: null,
    fecha_contratacion: null,
    fi_empleado_id: null,
  });

  const [empleados, setEmpleados] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(false);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const requiredFields = [
    "nombre", "apellido_paterno", "apellido_materno", "genero",
    "calle", "cp", "referencia", "comentarios",
    "puesto_id", "departamento_id", "ciudad_id", "estado_id",
    "edad", "fecha_nacimiento", "fecha_contratacion",
  ];

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    setLoading(true);
    try {
      const [emp, pue, dep, ciu, est] = await Promise.all([
        apiFetch("/empleados"),
        apiFetch("/puestos"),
        apiFetch("/departamentos"),
        apiFetch("/ciudades"),
        apiFetch("/estados"),
      ]);
      setEmpleados(emp);
      setPuestos(pue);
      setDepartamentos(dep);
      setCiudades(ciu);
      setEstados(est);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearFieldError(e.target.name);
  };

  const handleDateChange = (field, value) => {
    setForm({ ...form, [field]: value });
    clearFieldError(field);
  };

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      apellido_paterno: "",
      apellido_materno: "",
      genero: "",
      calle: "",
      cp: "",
      referencia: "",
      comentarios: "",
      usuario_id: "3",
      puesto_id: "",
      departamento_id: "",
      ciudad_id: "",
      estado_id: "",
      edad: "",
      fecha_nacimiento: null,
      fecha_contratacion: null,
      fi_empleado_id: null,
    });
    clearErrors();
  };

  const registrarEmpleado = async () => {
    if (!validate(form, requiredFields)) return;

    try {
      await apiFetch("/empleados", {
        method: "POST",
        body: JSON.stringify({
          fc_nombre: form.nombre,
          fc_apellido_paterno: form.apellido_paterno,
          fc_apellido_materno: form.apellido_materno,
          fc_genero: form.genero,
          fc_calle: form.calle,
          fc_cp: form.cp,
          fc_referencia: form.referencia,
          fc_comentarios: form.comentarios,
          fi_usuario_id: form.usuario_id,
          fi_puesto_id: Number(form.puesto_id),
          fi_departamento_id: Number(form.departamento_id),
          fi_ciudad_id: Number(form.ciudad_id),
          fi_estado_id: Number(form.estado_id),
          fi_edad: Number(form.edad),
          fd_fecha_nacimiento: dayjs(form.fecha_nacimiento).format("YYYY-MM-DD"),
          fd_fecha_contratacion: dayjs(form.fecha_contratacion).format("YYYY-MM-DD"),
        }),
      });
      await cargarTodo();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al registrar empleado:", error);
      alert("Error al registrar empleado.");
    }
  };

  const actualizarEmpleado = async () => {
    if (!form.fi_empleado_id) return alert("Selecciona un empleado para actualizar");
    if (!validate(form, requiredFields)) return;

    try {
      await apiFetch(`/empleados/${form.fi_empleado_id}`, {
        method: "PUT",
        body: JSON.stringify({
          fc_nombre: form.nombre,
          fc_apellido_paterno: form.apellido_paterno,
          fc_apellido_materno: form.apellido_materno,
          fc_genero: form.genero,
          fc_calle: form.calle,
          fc_cp: form.cp,
          fc_referencia: form.referencia,
          fc_comentarios: form.comentarios,
          fi_usuario_id: form.usuario_id,
          fi_puesto_id: Number(form.puesto_id),
          fi_departamento_id: Number(form.departamento_id),
          fi_ciudad_id: Number(form.ciudad_id),
          fi_estado_id: Number(form.estado_id),
          fi_edad: Number(form.edad),
          fd_fecha_nacimiento: dayjs(form.fecha_nacimiento).format("YYYY-MM-DD"),
          fd_fecha_contratacion: dayjs(form.fecha_contratacion).format("YYYY-MM-DD"),
        }),
      });
      await cargarTodo();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      alert("Error al actualizar empleado.");
    }
  };

  const eliminarEmpleado = async () => {
    if (!form.fi_empleado_id) return alert("Selecciona un empleado para eliminar");
    if (!window.confirm("¿Seguro que deseas eliminar este registro?")) return;

    try {
      await apiFetch(`/empleados/${form.fi_empleado_id}`, { method: "DELETE" });
      await cargarTodo();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      alert("Error al eliminar empleado.");
    }
  };

  const seleccionarEmpleado = (e) => {
    clearErrors();
    setForm({
      fi_empleado_id: e.fi_empleado_id,
      nombre: e.fc_nombre,
      apellido_paterno: e.fc_apellido_paterno,
      apellido_materno: e.fc_apellido_materno,
      genero: e.fc_genero,
      calle: e.fc_calle,
      cp: e.fc_cp,
      referencia: e.fc_referencia,
      comentarios: e.fc_comentarios,
      usuario_id: e.fi_usuario_id?.toString() || "3",
      puesto_id: e.fi_puesto_id?.toString() || "",
      departamento_id: e.fi_departamento_id?.toString() || "",
      ciudad_id: e.fi_ciudad_id?.toString() || "",
      estado_id: e.fi_estado_id?.toString() || "",
      edad: e.fi_edad?.toString() || "",
      fecha_nacimiento: e.fd_fecha_nacimiento ? dayjs(e.fd_fecha_nacimiento) : null,
      fecha_contratacion: e.fd_fecha_contratacion ? dayjs(e.fd_fecha_contratacion) : null,
    });
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 2, pb: 4 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
         Registro de Empleados
      </Typography>

      {loading ? (
        <Typography textAlign="center">Cargando datos...</Typography>
      ) : (
        <>
          {/* Formulario */}
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                {/* Campos de formulario (igual que antes) */}
                {/* ... (no se modifican, solo se dejan igual que tu código original) */}
              </Grid>
            </CardContent>
          </Card>

          {/* Tabla */}
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Empleados Registrados
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Apellido Paterno</TableCell>
                  <TableCell>Apellido Materno</TableCell>
                  <TableCell>Género</TableCell>
                  <TableCell>Puesto</TableCell>
                  <TableCell>Departamento</TableCell>
                  <TableCell>Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {empleados.map((e) => (
                  <TableRow key={e.fi_empleado_id}>
                    <TableCell>{e.fc_nombre}</TableCell>
                    <TableCell>{e.fc_apellido_paterno}</TableCell>
                    <TableCell>{e.fc_apellido_materno}</TableCell>
                    <TableCell>{e.fc_genero}</TableCell>
                    <TableCell>{e.puesto_nombre}</TableCell>
                    <TableCell>{e.departamento_nombre}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        onClick={() => seleccionarEmpleado(e)}
                      >
                        Seleccionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  );
}
