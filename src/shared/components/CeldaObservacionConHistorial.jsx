import React, { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { formatFecha } from "@shared/utils/formatters";

const TRUNCAR_MAX = 40;

const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;

const formatearFecha = (fechaISO) => formatFecha(fechaISO);

const formatearHora = (fechaISO) => {
  if (!fechaISO) return null;
  const d = new Date(fechaISO);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true });
};

const ETIQUETA_PROCESO = {
  alevinaje: "Alevinaje",
  engorda: "Engorda",
  trazabilidad: "Trazabilidad",
  venta: "Venta",
  biometria: "Biometría",
  reproductor: "Reproductores",
  eficiencia_reproductiva: "Eficiencia reproductiva",
  evento_cosecha: "Eficiencia reproductiva",
  siembra: "Siembra",
  alimentacion: "Alimentación",
  recambio: "Recambio de agua",
  inventario_alevines: "Inventario alevines",
  parametros: "Parámetros de agua",
  medicamentos: "Medicamentos",
  plagas: "Plagas",
  visitas: "Visitas",
  banos: "Baños",
  recepcion_insumos: "Recepción insumos",
};

function etiquetaProceso(proceso) {
  if (!proceso) return "General";
  const key = String(proceso).trim().toLowerCase();
  if (ETIQUETA_PROCESO[key]) return ETIQUETA_PROCESO[key];
  return key
    .split("_")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function etiquetaRol(rol) {
  if (!rol) return null;
  const texto = String(rol).trim();
  if (!texto) return null;
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function normalizarHistorialObservaciones(rows) {
  return (Array.isArray(rows) ? rows : [])
    .map((r) => {
      const comentario = (r.comentario ?? r.observacion ?? r.fc_observacion ?? "").trim();
      if (!comentario) return null;
      const fecha =
        r.created_at ??
        r.fd_fecha ??
        r.fecha ??
        r.fecha_peso ??
        r.fd_fecha_peso ??
        r.fd_ultima_observacion_pileta ??
        null;
      return {
        fecha,
        comentario,
        proceso: etiquetaProceso(r.proceso ?? r.fc_proceso),
        usuarioNombre: r.usuario_nombre ?? r.fc_usuario ?? null,
        rolNombre: etiquetaRol(r.rol_nombre ?? r.fc_rol),
        hora: formatearHora(fecha),
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

function EntradaHistorial({ item }) {
  const autorLinea = [item.rolNombre, item.usuarioNombre].filter(Boolean).join(": ");

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
        {formatearFecha(item.fecha)} • {item.proceso || "General"}
      </Typography>

      <Typography
        variant="body1"
        fontWeight={600}
        color="text.primary"
        sx={{ whiteSpace: "pre-wrap", mb: 1.25, lineHeight: 1.5 }}
      >
        {item.comentario}
      </Typography>

      {autorLinea ? (
        <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
          <PersonOutlineIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography variant="caption" color="text.secondary">
            {autorLinea}
          </Typography>
          {item.hora ? (
            <>
              <AccessTimeIcon sx={{ fontSize: 14, color: "text.secondary", ml: 0.5 }} />
              <Typography variant="caption" color="text.secondary">
                {item.hora}
              </Typography>
            </>
          ) : null}
        </Stack>
      ) : null}
    </Box>
  );
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

      <Dialog
        open={abierto}
        onClose={cerrarModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <Box sx={{ px: 3, pt: 2.5, pb: 2, position: "relative" }}>
          <IconButton
            aria-label="Cerrar"
            onClick={cerrarModal}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "text.secondary",
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography
            variant="h6"
            component="h2"
            fontWeight={700}
            color="primary.main"
            sx={{ pr: 4, lineHeight: 1.3 }}
          >
            Historial de observaciones
            {piletaNombre ? ` — ${piletaNombre}` : ""}
          </Typography>

          {etapaLabel ? (
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
              sx={{ mt: 0.75, letterSpacing: "0.06em", textTransform: "uppercase" }}
            >
              {etapaLabel}
            </Typography>
          ) : null}
        </Box>

        <Divider />

        <DialogContent sx={{ px: 3, py: 0 }}>
          {cargando ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ py: 2 }}>
              {error}
            </Typography>
          ) : historial.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
              No hay observaciones registradas para esta pileta.
            </Typography>
          ) : (
            <Box>
              {historial.map((item, idx) => (
                <React.Fragment key={`${item.registroId ?? idx}-${item.fecha ?? idx}`}>
                  {idx > 0 && <Divider />}
                  <EntradaHistorial item={item} />
                </React.Fragment>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="outlined"
            onClick={cerrarModal}
            sx={{
              color: "primary.main",
              borderColor: "grey.300",
              fontWeight: 600,
              px: 3,
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "action.hover",
              },
            }}
          >
            CERRAR
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
