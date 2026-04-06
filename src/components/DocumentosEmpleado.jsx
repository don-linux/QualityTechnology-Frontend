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
import axios from "../utils/axiosInstance.js";

export default function DocumentosEmpleado({ empleadoId, selfService = false }) {
  const [documentos, setDocumentos] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");
  const [archivo, setArchivo] = useState(null);

  const cargarDocumentos = useCallback(async () => {
    try {
      const endpoint = selfService
        ? "/documentos-empleado/mis-documentos"
        : `/documentos-empleado/${empleadoId}`;
      const { data } = await axios.get(endpoint);
      setDocumentos(data);
    } catch (e) { console.error(e); }
  }, [empleadoId, selfService]);

  const cargarTipos = useCallback(async () => {
    try {
      const { data } = await axios.get("/tipos-documento/activos");
      setTiposDocumento(data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    cargarDocumentos();
    cargarTipos();
  }, [cargarDocumentos, cargarTipos]);

  const subirArchivo = async () => {
    if (!archivo || !tipoSeleccionado) return alert("Selecciona tipo y archivo");

    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("fi_tipo_documento_id", tipoSeleccionado);

    const endpoint = selfService
      ? "/documentos-empleado/mis-documentos/upload"
      : `/documentos-empleado/${empleadoId}/upload`;

    try {
      await axios.post(endpoint, formData);
      setArchivo(null);
      setTipoSeleccionado("");
      await cargarDocumentos();
    } catch (e) {
      console.error(e);
      alert("Error al subir documento");
    }
  };

  const tiposSubidos = new Set(documentos.map((d) => d.fi_tipo_documento_id));

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
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
