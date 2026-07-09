import React, { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  listActasAdministrativas,
  removeActaAdministrativa,
  uploadActaAdministrativa,
  viewActaAdministrativa,
  downloadActaAdministrativa,
} from "../services/actasAdministrativasService";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import { ordenarYNumerar } from "@shared/utils/ordenarFilas";

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
  link.download = fileName || "acta-administrativa";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ActasAdministrativas({ empleadoId }) {
  const showSnackbar = useSnackbar();
  const { confirm, ConfirmModal } = useConfirm();
  const [actas, setActas] = useState([]);
  const [motivo, setMotivo] = useState("");
  const [fecha, setFecha] = useState("");
  const [archivo, setArchivo] = useState(null);

  const cargarActas = useCallback(async () => {
    if (!empleadoId) return;
    try {
      const { data } = await listActasAdministrativas(empleadoId);
      setActas(data);
    } catch (e) {
      console.error(e);
      showSnackbar("Error al cargar actas administrativas", "error");
    }
  }, [empleadoId, showSnackbar]);

  useEffect(() => {
    cargarActas();
  }, [cargarActas]);

  const limpiar = () => {
    setMotivo("");
    setFecha("");
    setArchivo(null);
  };

  const subirActa = async () => {
    if (!motivo.trim() || !fecha || !archivo) {
      return showSnackbar("Captura motivo, fecha y archivo", "error");
    }

    const formData = new FormData();
    formData.append("motivo", motivo);
    formData.append("fecha", fecha);
    formData.append("archivo", archivo);

    try {
      await uploadActaAdministrativa(empleadoId, formData);
      limpiar();
      await cargarActas();
      showSnackbar("Acta administrativa guardada correctamente", "success");
    } catch (e) {
      console.error(e);
      showSnackbar(e.response?.data?.error || "Error al guardar acta administrativa", "error");
    }
  };

  const verActa = async (acta) => {
    try {
      const { data } = await viewActaAdministrativa(acta.acta_id);
      openBlobInNewTab(data);
    } catch (e) {
      console.error(e);
      showSnackbar("Error al abrir acta administrativa", "error");
    }
  };

  const descargarActa = async (acta) => {
    try {
      const { data } = await downloadActaAdministrativa(acta.acta_id);
      downloadBlob(data, acta.nombre_original);
    } catch (e) {
      console.error(e);
      showSnackbar("Error al descargar acta administrativa", "error");
    }
  };

  const eliminarActa = async (acta) => {
    if (!await confirm(`¿Eliminar el acta "${acta.nombre_original}"?`)) return;
    try {
      await removeActaAdministrativa(acta.acta_id);
      await cargarActas();
      showSnackbar("Acta administrativa eliminada correctamente", "success");
    } catch (e) {
      console.error(e);
      showSnackbar("Error al eliminar acta administrativa", "error");
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Actas Administrativas</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center", flexWrap: "wrap" }}>
        <TextField
          label="Motivo"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          size="small"
          sx={{ minWidth: 260 }}
        />
        <TextField
          label="Fecha"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Button variant="outlined" component="label" size="small">
          {archivo ? archivo.name : "Seleccionar archivo"}
          <input type="file" hidden onChange={(e) => setArchivo(e.target.files[0])} />
        </Button>
        <Button variant="contained" size="small" onClick={subirActa} disabled={!motivo.trim() || !fecha || !archivo}>
          Guardar acta
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell>Archivo</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ordenarYNumerar(actas, ["acta_id", "id"]).map((acta) => (
              <TableRow key={acta.acta_id}>
                <TableCell>{acta._num}</TableCell>
                <TableCell>{acta.fecha ? acta.fecha.substring(0, 10) : "-"}</TableCell>
                <TableCell>{acta.motivo}</TableCell>
                <TableCell>{acta.nombre_original}</TableCell>
                <TableCell align="center">
                  {canPreviewFile(acta.nombre_original) && (
                    <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => verActa(acta)}>
                      Ver
                    </Button>
                  )}
                  <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => descargarActa(acta)}>
                    Descargar
                  </Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => eliminarActa(acta)}>
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!actas.length && (
              <TableRow>
                <TableCell colSpan={5} align="center">Sin actas administrativas</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {ConfirmModal}
    </Box>
  );
}
