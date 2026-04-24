import React, { useState, useEffect, useCallback } from "react";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import {
  listDocumentos,
  listTiposDocumento,
  uploadDocumento,
  viewDocumento,
  downloadDocumento,
  removeDocumento,
} from "../services/documentosService";
import useSnackbar from "@shared/hooks/useSnackbar";
import useConfirm from "@shared/hooks/useConfirm";

const PREVIEWABLE_EXTENSIONS = /\.(pdf|png|jpe?g|gif|webp)$/i;

function canPreviewFile(fileName) {
  return PREVIEWABLE_EXTENSIONS.test(fileName || "");
}

function openBlobInNewTab(blob) {
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || "documento";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function DocumentosEmpleado({ empleadoId, selfService = false }) {
  const showSnackbar = useSnackbar();
  const { confirm, ConfirmModal } = useConfirm();
  const [documentos, setDocumentos] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");
  const [archivo, setArchivo] = useState(null);

  const cargarDocumentos = useCallback(async () => {
    try {
      const { data } = await listDocumentos(selfService ? null : empleadoId);
      setDocumentos(data);
    } catch (e) { console.error(e); }
  }, [empleadoId, selfService]);

  const cargarTipos = useCallback(async () => {
    try {
      const { data } = await listTiposDocumento();
      setTiposDocumento(data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    cargarDocumentos();
    cargarTipos();
  }, [cargarDocumentos, cargarTipos]);

  const subirArchivo = async () => {
    if (!archivo || !tipoSeleccionado) return showSnackbar("Selecciona tipo y archivo", "error");

    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("fi_tipo_documento_id", tipoSeleccionado);

    try {
      await uploadDocumento(selfService ? null : empleadoId, formData);
      setArchivo(null);
      setTipoSeleccionado("");
      await cargarDocumentos();
    } catch (e) {
      console.error(e);
      showSnackbar(e.response?.data?.error || "Error al subir documento", "error");
    }
  };

  const verDocumento = async (doc) => {
    try {
      const { data } = await viewDocumento(doc.fi_documento_id, selfService);
      openBlobInNewTab(data);
    } catch (e) {
      console.error(e);
      showSnackbar("Error al abrir documento", "error");
    }
  };

  const descargarDocumento = async (doc) => {
    try {
      const { data } = await downloadDocumento(doc.fi_documento_id, selfService);
      downloadBlob(data, doc.fc_nombre_original);
    } catch (e) {
      console.error(e);
      showSnackbar("Error al descargar documento", "error");
    }
  };

  const eliminarDocumento = async (doc) => {
    if (!await confirm(`¿Eliminar el documento "${doc.fc_nombre_original}"?`)) return;
    try {
      await removeDocumento(doc.fi_documento_id, selfService);
      await cargarDocumentos();
      showSnackbar("Documento eliminado correctamente", "success");
    } catch (e) {
      console.error(e);
      showSnackbar("Error al eliminar documento", "error");
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Documentos</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center", flexWrap: "wrap" }}>
        <TextField
          select
          label="Tipo de documento"
          value={tipoSeleccionado}
          onChange={(e) => setTipoSeleccionado(e.target.value)}
          sx={{ minWidth: 220 }}
          size="small"
        >
          {tiposDocumento.map((t) => (
            <MenuItem key={t.fi_tipo_documento_id} value={t.fi_tipo_documento_id}>
              {t.fc_nombre} {t.fb_obligatorio ? "*" : ""}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="outlined" component="label" size="small">
          {archivo ? archivo.name : "Seleccionar archivo"}
          <input type="file" hidden onChange={(e) => setArchivo(e.target.files[0])} />
        </Button>
        <Button variant="contained" size="small" onClick={subirArchivo} disabled={!archivo || !tipoSeleccionado}>
          Subir
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tipo</TableCell>
              <TableCell>Archivo</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Obligatorio</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tiposDocumento.map((tipo) => {
              const doc = documentos.find((d) => d.fi_tipo_documento_id === tipo.fi_tipo_documento_id);
              return (
                <TableRow key={tipo.fi_tipo_documento_id}>
                  <TableCell>{tipo.fc_nombre}</TableCell>
                  <TableCell>
                    {doc ? (
                      <Chip label={doc.fc_nombre_original} color="success" size="small" variant="outlined" />
                    ) : (
                      <Chip label="Pendiente" color="warning" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>{doc?.fd_fecha_carga || "-"}</TableCell>
                  <TableCell>{tipo.fb_obligatorio ? "Si" : "No"}</TableCell>
                  <TableCell align="center">
                    {doc ? (
                      <>
                        {canPreviewFile(doc.fc_nombre_original) && (
                          <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => verDocumento(doc)}>
                            Ver
                          </Button>
                        )}
                        <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => descargarDocumento(doc)}>
                          Descargar
                        </Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => eliminarDocumento(doc)}>
                          Eliminar
                        </Button>
                      </>
                    ) : "-"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {ConfirmModal}
    </Box>
  );
}
