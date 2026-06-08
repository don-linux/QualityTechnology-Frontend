import React, { useEffect, useState, useCallback } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  listMovimientos,
  createMovimiento,
  updateMovimiento,
  removeMovimiento,
} from "../services/flujoCajaService";
import FormDialog from "./FormDialog";
import { getUploadUrl } from "@shared/lib/uploadUrl";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";

function TablaMovimientos({ movimientos, onEdit, onDelete }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ background: "#f0f0f0" }}>
          <TableRow>
            <TableCell><b>Fecha</b></TableCell>
            <TableCell align="right"><b>Ingreso</b></TableCell>
            <TableCell align="right"><b>Egreso</b></TableCell>
            <TableCell><b>Descripcion</b></TableCell>
            <TableCell><b>Cuenta</b></TableCell>
            <TableCell><b>Categoria</b></TableCell>
            <TableCell><b>Subcategoria</b></TableCell>
            <TableCell><b>Beneficiario</b></TableCell>
            <TableCell><b>Proyecto</b></TableCell>
            <TableCell><b>Factura</b></TableCell>
            <TableCell><b>Estatus</b></TableCell>
            <TableCell align="center"><b>Acciones</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {movimientos.map((row) => (
            <TableRow key={row.fi_movimiento_id}>
              <TableCell>
                {new Date(row.fd_fecha).toLocaleDateString("es-MX", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell align="right">
                {new Intl.NumberFormat("es-MX", {
                  style: "currency",
                  currency: "MXN",
                  minimumFractionDigits: 2,
                }).format(row.fn_ingreso || 0)}
              </TableCell>
              <TableCell align="right">
                {new Intl.NumberFormat("es-MX", {
                  style: "currency",
                  currency: "MXN",
                  minimumFractionDigits: 2,
                }).format(row.fn_egreso || 0)}
              </TableCell>
              <TableCell>{row.fc_descripcion}</TableCell>
              <TableCell>{row.fc_cuenta}</TableCell>
              <TableCell>{row.fc_categoria}</TableCell>
              <TableCell>{row.fc_subcategoria}</TableCell>
              <TableCell>{row.fc_beneficiario}</TableCell>
              <TableCell>{row.fc_noproyecto}</TableCell>
              <TableCell>
                {row.fc_factura && row.fc_factura !== "NO" ? (
                  <a
                    href={getUploadUrl(row.fc_factura)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#1D5C42",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                     Ver factura
                  </a>
                ) : row.fc_factura === "NO" ? (
                  "No aplica"
                ) : (
                  "Pendiente"
                )}
              </TableCell>
              <TableCell>{row.fc_estatus}</TableCell>
              <TableCell align="center">
                <IconButton size="small" aria-label="Editar" onClick={() => onEdit(row)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  aria-label="Eliminar"
                  onClick={() => onDelete(row.fi_movimiento_id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {movimientos.length === 0 && (
            <TableRow>
              <TableCell colSpan={12} align="center">
                No hay movimientos registrados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function FlujoCaja() {
  const [movimientos, setMovimientos] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editId, setEditId] = useState(null);
  const showSnackbar = useSnackbar();

  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  const requiredFields = [
    "fd_fecha", "fc_cuenta", "tipo_transaccion", "fn_monto", "fc_descripcion",
    "fc_categoria", "fc_subcategoria", "fc_noproyecto", "fc_factura_opcion", "fc_estatus",
  ];

  // =====================================================
  //  Cargar datos
  // =====================================================
  const obtenerMovimientos = useCallback(async () => {
    try {
      const res = await listMovimientos();
      setMovimientos(res.data || []);
    } catch (err) {
      console.error(" Error al obtener movimientos:", err);
      showSnackbar("Error al obtener los movimientos", "error");
    }
  }, []);

  useEffect(() => {
    obtenerMovimientos();
  }, [obtenerMovimientos]);

  // =====================================================
  //  Exportar Excel
  // =====================================================
  const exportarExcel = async () => {
    const { default: ExcelJS } = await import("exceljs");
    const { saveAs } = await import("file-saver");
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("FlujoCaja");
    if (movimientos.length > 0) {
      ws.columns = Object.keys(movimientos[0]).map((key) => ({ header: key, key }));
      ws.addRows(movimientos);
    }
    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `FlujoCaja.xlsx`);
  };

  // =====================================================
  //  CRUD
  // =====================================================
  const handleOpen = (data = null) => {
    clearErrors();
    if (data) {
      const ingreso = Number(data.fn_ingreso) || 0;
      const egreso = Number(data.fn_egreso) || 0;
      const tipoTransaccion = ingreso > 0 ? "INGRESO" : egreso > 0 ? "EGRESO" : "";
      const monto = tipoTransaccion === "INGRESO" ? ingreso : tipoTransaccion === "EGRESO" ? egreso : "";
      setFormData({
        fd_fecha: data.fd_fecha || "",
        tipo_transaccion: tipoTransaccion,
        fn_monto: monto || "",
        fc_descripcion: data.fc_descripcion || "",
        fc_cuenta: data.fc_cuenta || "",
        fc_categoria: data.fc_categoria || "",
        fc_subcategoria: data.fc_subcategoria || "",
        fc_beneficiario: data.fc_beneficiario || "",
        fc_noproyecto: data.fc_noproyecto || "",
        fc_factura: data.fc_factura || "",
        fc_estatus: data.fc_estatus || "",
      });
      setEditId(data.fi_movimiento_id);
    } else {
      setFormData({
        fd_fecha: "",
        tipo_transaccion: "",
        fn_monto: "",
        fc_descripcion: "",
        fc_cuenta: "",
        fc_categoria: "",
        fc_subcategoria: "",
        fc_beneficiario: "",
        fc_noproyecto: "",
        fc_factura: "",
        fc_estatus: "",
      });
      setEditId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    clearErrors();
    setOpen(false);
  };

  const handleSubmit = async (data) => {
    if (!validate(data, requiredFields)) return;

    try {
      const monto = Math.max(Number(data.fn_monto) || 0, 0);
      const { tipo_transaccion, fn_monto, ...rest } = data;
      const payload = {
        ...rest,
        fn_ingreso: tipo_transaccion === "INGRESO" ? monto : 0,
        fn_egreso: tipo_transaccion === "EGRESO" ? monto : 0,
      };
      if (editId) {
        await updateMovimiento(editId, payload);
        showSnackbar("Movimiento actualizado correctamente ", "success");
      } else {
        await createMovimiento(payload);
        showSnackbar("Movimiento agregado correctamente ", "success");
      }
      setOpen(false);
      obtenerMovimientos();
    } catch (err) {
      console.error(" Error al guardar:", err);
      showSnackbar("Error al guardar el movimiento ", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!await confirm("¿Eliminar este registro?")) return;
    try {
      await removeMovimiento(id);
      obtenerMovimientos();
      showSnackbar("Movimiento eliminado correctamente ", "success");
    } catch (err) {
      console.error(" Error al eliminar:", err);
      showSnackbar("Error al eliminar el movimiento ", "error");
    }
  };

  // =====================================================
  //  Render Principal
  // =====================================================
  return (
    <Container maxWidth="xl" sx={{ mt: 0, p: 0 }}>
      <Box sx={{ width: "100%", background: "#0D4D3A", padding: "20px 30px", mb: 2 }}>
        <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
           Módulo de Flujo de Caja — Sistema Quality
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, gap: 2 }}>
          <Button variant="contained" color="success" onClick={() => handleOpen()}>
            + Nuevo Movimiento
          </Button>
          <Button variant="contained" sx={{ background: "#1D5C42" }} onClick={exportarExcel}>
            Exportar Excel
          </Button>
        </Box>

        <TablaMovimientos movimientos={movimientos} onEdit={handleOpen} onDelete={handleDelete} />
      </Box>

      {/* Formularios y Modales */}
      <FormDialog
        open={open}
        formData={formData}
        setFormData={setFormData}
        onClose={handleClose}
        onSubmit={handleSubmit}
        editId={editId}
        errors={errors}
        clearFieldError={clearFieldError}
        clearErrors={clearErrors}
        validate={validate}
        requiredFields={requiredFields}
      />

      {ConfirmModal}
    </Container>
  );
}
