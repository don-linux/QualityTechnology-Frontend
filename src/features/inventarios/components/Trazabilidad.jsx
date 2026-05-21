import React, { useEffect, useState, useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import useSnackbar from "@shared/hooks/useSnackbar";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import TablasPorUbicacionGranja from "@shared/components/TablasPorUbicacionGranja";
import { fetchMergedPorUbicaciones } from "@shared/utils/fetchMergedPorUbicaciones";
import { listMovimientos } from "../services/trazabilidadService";

const TRUNCAR_MAX = 40;

const ETAPA_OPCIONES = [
  { value: "", label: "Todas las etapas" },
  { value: "reproductores", label: "Reproductores" },
  { value: "alevinaje", label: "Alevinaje" },
  { value: "engorda", label: "Engorda" },
];

const ETAPA_COLOR = {
  reproductores: "#1565C0",
  alevinaje: "#00838F",
  engorda: "#2E7D32",
};

const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;

export default function Trazabilidad() {
  const showSnackbar = useSnackbar();
  const { ubicacionesGranja, resolveFiltroUbicacion, getGroups } = useUbicacionesGranja();

  const filtrosUbicacion = useMemo(
    () => ubicacionesGranja.map((op) => resolveFiltroUbicacion(op.value)),
    [ubicacionesGranja, resolveFiltroUbicacion],
  );

  const [rastreos, setRastreos] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroEtapa, setFiltroEtapa] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const formatNumber = (num) => {
    if (!num && num !== 0) return "—";
    const n = Number(num);
    return Number.isInteger(n)
      ? n.toLocaleString("en-US")
      : n.toLocaleString("en-US", { minimumFractionDigits: 2 });
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "—";
    const f = new Date(fecha);
    return f.toLocaleDateString("es-MX");
  };

  const obtenerTrazabilidad = useCallback(async () => {
    try {
      const data = await fetchMergedPorUbicaciones(filtrosUbicacion, listMovimientos);
      setRastreos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar trazabilidad:", err);
      setRastreos([]);
      showSnackbar(
        err?.response?.data?.error || "No se pudieron cargar los movimientos.",
        "error",
      );
    }
  }, [filtrosUbicacion, showSnackbar]);

  useEffect(() => {
    obtenerTrazabilidad();
  }, [obtenerTrazabilidad]);

  const rastreosFiltrados = rastreos.filter((r) => {
    const texto = filtroTexto.toLowerCase();

    const coincideTexto =
      r.origen?.toLowerCase().includes(texto) ||
      r.destino?.toLowerCase().includes(texto) ||
      r.observacion?.toLowerCase().includes(texto) ||
      r.fc_etapa?.toLowerCase().includes(texto);

    const coincideEtapa = !filtroEtapa || r.etapa === filtroEtapa;

    const fechaMov = new Date(r.fecha_movimiento);
    const desde = fechaInicio ? new Date(fechaInicio) : null;
    const hasta = fechaFin ? new Date(fechaFin) : null;

    const coincideFecha =
      (!desde || fechaMov >= desde) && (!hasta || fechaMov <= hasta);

    return coincideTexto && coincideEtapa && coincideFecha;
  });

  const gruposRastreos = useMemo(
    () => getGroups(rastreosFiltrados, "fc_granja"),
    [rastreosFiltrados, getGroups],
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={2} color="#004C7D">
        Trazabilidad de Movimientos
      </Typography>

      <Paper
        elevation={0}
        sx={{
          backgroundColor: "#FFF3E0",
          p: 2,
          mb: 3,
          borderRadius: 2,
          borderLeft: "6px solid #E65100",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Historial unificado de traslados e ingresos entre piletas de reproductores,
          alevinaje y engorda. Los movimientos se registran al crear inventario en cada
          etapa del ciclo productivo.
        </Typography>
      </Paper>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          size="small"
          label="Buscar"
          sx={{ flex: "1 1 200px" }}
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
        />

        <TextField
          select
          size="small"
          label="Etapa"
          sx={{ minWidth: 180 }}
          value={filtroEtapa}
          onChange={(e) => setFiltroEtapa(e.target.value)}
        >
          {ETAPA_OPCIONES.map((op) => (
            <MenuItem key={op.value || "todas"} value={op.value}>
              {op.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          type="date"
          size="small"
          label="Fecha inicio"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          type="date"
          size="small"
          label="Fecha fin"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <Button
          variant="contained"
          onClick={() => obtenerTrazabilidad()}
          sx={{ height: "40px" }}
        >
          BUSCAR
        </Button>

        <Button
          variant="outlined"
          color="error"
          sx={{ height: "40px" }}
          onClick={() => {
            setFiltroTexto("");
            setFiltroEtapa("");
            setFechaInicio("");
            setFechaFin("");
          }}
        >
          LIMPIAR
        </Button>
      </Box>

      <TablasPorUbicacionGranja
        grupos={gruposRastreos}
        accordionSx={{ mb: 6, boxShadow: 2 }}
        renderTabla={(rows) => (
          <Paper sx={{ width: "100%", boxShadow: 2 }}>
            <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
              <Table stickyHeader sx={{ minWidth: 1060 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Etapa</TableCell>
                    <TableCell>Origen</TableCell>
                    <TableCell>Destino</TableCell>
                    <TableCell>Cantidad</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Observación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={`${r.fc_granja}-${r.fi_movimiento_id}`}>
                      <TableCell>
                        {r.fc_etapa ? (
                          <Chip
                            label={r.fc_etapa}
                            size="small"
                            sx={{
                              bgcolor: ETAPA_COLOR[r.etapa] ?? "#757575",
                              color: "#fff",
                              fontWeight: 600,
                            }}
                          />
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{r.origen || "—"}</TableCell>
                      <TableCell>{r.destino || "—"}</TableCell>
                      <TableCell>{formatNumber(r.cantidad_trasladada)}</TableCell>
                      <TableCell>{formatFecha(r.fecha_movimiento)}</TableCell>
                      <TableCell sx={{ maxWidth: 160 }}>
                        <span title={r.observacion || ""}>
                          {r.observacion ? truncar(r.observacion) : "—"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      />
    </Box>
  );
}
