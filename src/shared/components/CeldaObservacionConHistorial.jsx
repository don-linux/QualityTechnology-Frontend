import React, { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const TRUNCAR_MAX = 40;

const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return "—";
  const d = new Date(fechaISO);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-MX");
};

const ETIQUETA_PROCESO = {
  alevinaje: "Alevinaje",
  engorda: "Engorda",
  trazabilidad: "Trazabilidad",
  venta: "Venta",
};

function etiquetaProceso(proceso) {
  if (!proceso) return null;
  const key = String(proceso).trim().toLowerCase();
  return ETIQUETA_PROCESO[key] ?? proceso;
}

function normalizarHistorialObservaciones(rows) {
  return (Array.isArray(rows) ? rows : [])
    .map((r) => {
      const comentario = (r.comentario ?? r.observacion ?? r.fc_observacion ?? "").trim();
      if (!comentario) return null;
      return {
        fecha:
          r.created_at ??
          r.fd_fecha ??
          r.fecha ??
          r.fecha_peso ??
          r.fd_fecha_peso ??
          r.fd_ultima_observacion_pileta ??
          null,
        comentario,
        proceso: etiquetaProceso(r.proceso ?? r.fc_proceso),
        registroId: r.fi_observacion_id ?? r.observacion_id ?? r.fi_id ?? r.fi_engorda_id ?? r.id ?? null,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const ta = a.fecha ? new Date(a.fecha).getTime() : 0;
      const tb = b.fecha ? new Date(b.fecha).getTime() : 0;
      if (tb !== ta) return tb - ta;
      return Number(b.registroId ?? 0) - Number(a.registroId ?? 0);
    });
}

/**
 * Celda de observación con menú kebab para abrir historial por pileta.
 */
export default function CeldaObservacionConHistorial({
  texto,
  piletaId,
  piletaNombre,
  etapaLabel,
  cargarHistorial,
}) {
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState(null);

  const abrirModal = useCallback(
    async (e) => {
      e.stopPropagation();
      if (!piletaId || !cargarHistorial) return;
      setAbierto(true);
      setCargando(true);
      setError(null);
      setHistorial([]);
      try {
        const res = await cargarHistorial(piletaId);
        setHistorial(normalizarHistorialObservaciones(res.data));
      } catch (err) {
        console.error("Error cargando historial de observaciones:", err);
        setError("No se pudo cargar el historial de observaciones.");
      } finally {
        setCargando(false);
      }
    },
    [piletaId, cargarHistorial],
  );

  const cerrarModal = () => {
    setAbierto(false);
    setError(null);
  };

  const textoVisible = texto ? truncar(texto) : "—";

  return (
    <>
      <Box
        sx={{
          position: "relative",
          pr: 3.5,
          minHeight: 28,
          maxWidth: 200,
        }}
      >
        <Typography
          component="span"
          variant="body2"
          title={texto || ""}
          sx={{ display: "block", pr: 0.5, wordBreak: "break-word" }}
        >
          {textoVisible}
        </Typography>
        {piletaId && cargarHistorial && (
          <IconButton
            size="small"
            onClick={abrirModal}
            aria-label="Ver historial de observaciones"
            sx={{
              position: "absolute",
              top: -4,
              right: -8,
              p: 0.25,
              color: "text.secondary",
              "&:hover": { color: "primary.main", backgroundColor: "action.hover" },
            }}
          >
            <MoreVertIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>

      <Dialog open={abierto} onClose={cerrarModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          Historial de observaciones
          {piletaNombre ? ` — ${piletaNombre}` : ""}
          {etapaLabel ? (
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
              {etapaLabel}
            </Typography>
          ) : null}
        </DialogTitle>
        <DialogContent dividers>
          {cargando ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={32} />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : historial.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No hay observaciones registradas para esta pileta.
            </Typography>
          ) : (
            <List dense disablePadding>
              {historial.map((item, idx) => (
                <React.Fragment key={`${item.registroId ?? idx}-${item.fecha ?? idx}`}>
                  {idx > 0 && <Divider component="li" />}
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        item.proceso
                          ? `${formatearFecha(item.fecha)} · ${item.proceso}`
                          : formatearFecha(item.fecha)
                      }
                      secondary={item.comentario}
                      primaryTypographyProps={{ fontWeight: 600, variant: "body2" }}
                      secondaryTypographyProps={{
                        variant: "body2",
                        sx: { whiteSpace: "pre-wrap", mt: 0.5 },
                      }}
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModal}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
