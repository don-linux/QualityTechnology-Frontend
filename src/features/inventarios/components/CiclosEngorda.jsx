import React, { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import MenuItem from "@mui/material/MenuItem";
import CampoTexto from "@shared/components/CampoTexto";
import Chip from "@mui/material/Chip";
import useSnackbar from "@shared/hooks/useSnackbar";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import TablasPorUbicacionGranja from "@shared/components/TablasPorUbicacionGranja";
import { formatCantidad, formatFecha } from "@shared/utils/formatters";
import { ordenarYNumerar, SIGLAS_MODULO } from "@shared/utils/ordenarFilas";
import {
  getCicloEngordaDashboard,
  listCiclosEngorda,
} from "../services/ciclosEngordaService";

const colorEstado = {
  activo: "success",
  cerrado: "default",
  vendido: "info",
};

function KpiCard({ titulo, valor, subtitulo }) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {titulo}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: "bold", mt: 0.5 }}>
          {valor}
        </Typography>
        {subtitulo ? (
          <Typography variant="caption" color="text.secondary">
            {subtitulo}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function CiclosEngorda() {
  const showSnackbar = useSnackbar();
  const { defaultUbicacion, getGroups } = useUbicacionesGranja();
  const [ciclos, setCiclos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [cargandoDashboard, setCargandoDashboard] = useState(false);

  const cargarCiclos = useCallback(async () => {
    try {
      const res = await listCiclosEngorda(defaultUbicacion || null, {
        estado: filtroEstado || undefined,
      });
      setCiclos(res.data ?? []);
    } catch {
      showSnackbar("Error cargando ciclos de engorda", "error");
    }
  }, [defaultUbicacion, filtroEstado, showSnackbar]);

  useEffect(() => {
    cargarCiclos();
  }, [cargarCiclos]);

  const grupos = useMemo(
    () => getGroups(ciclos, "fc_granja"),
    [ciclos, getGroups],
  );

  const cargarDashboard = async (ciclo) => {
    setSeleccionado(ciclo);
    setCargandoDashboard(true);
    try {
      const res = await getCicloEngordaDashboard(ciclo.fi_ciclo_id ?? ciclo.id);
      setDashboard(res.data);
    } catch {
      setDashboard(null);
      showSnackbar("No se pudo cargar el dashboard del ciclo", "error");
    } finally {
      setCargandoDashboard(false);
    }
  };

  const kpis = dashboard?.kpis ?? {};

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
        Ciclos de Engorda
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Proyectos productivos por pileta: siembra, biometrías, consumo de alimento y cierre.
      </Typography>

      <Box sx={{ mb: 2, maxWidth: 260 }}>
        <CampoTexto
          select
          fullWidth
          size="small"
          label="Estado"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="activo">Activo</MenuItem>
          <MenuItem value="cerrado">Cerrado</MenuItem>
          <MenuItem value="vendido">Vendido</MenuItem>
        </CampoTexto>
      </Box>

      <TablasPorUbicacionGranja
        grupos={grupos}
        renderTabla={(rows, { siglaGranja } = {}) => {
          const filas = ordenarYNumerar(rows, ["fi_ciclo_id", "id"], {
            siglaGranja,
            siglaModulo: SIGLAS_MODULO.ciclosEngorda,
          });
          return (
            <Paper sx={{ width: "100%", borderRadius: 2, boxShadow: 3 }}>
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table size="small" sx={{ minWidth: 900 }}>
                  <TableHead sx={{ backgroundColor: "#006d77" }}>
                    <TableRow>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>ID</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Pileta</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Lote</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Inicio</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Cierre</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Estado</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Cant. inicial</TableCell>
                      <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>
                        Acción
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          No hay ciclos registrados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filas.map((c) => (
                        <TableRow
                          key={c.fi_ciclo_id ?? c.id}
                          hover
                          selected={
                            (seleccionado?.fi_ciclo_id ?? seleccionado?.id) ===
                            (c.fi_ciclo_id ?? c.id)
                          }
                          sx={{ cursor: "pointer" }}
                          onClick={() => cargarDashboard(c)}
                        >
                          <TableCell>{c._num}</TableCell>
                          <TableCell>{c.nombre_pileta || "—"}</TableCell>
                          <TableCell>{c.lote || c.fc_lote || "—"}</TableCell>
                          <TableCell>{formatFecha(c.fecha_inicio ?? c.fd_fecha_inicio)}</TableCell>
                          <TableCell>
                            {c.fecha_cierre || c.fd_fecha_cierre
                              ? formatFecha(c.fecha_cierre ?? c.fd_fecha_cierre)
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={c.estado ?? c.fc_estado ?? "—"}
                              color={colorEstado[c.estado ?? c.fc_estado] ?? "default"}
                            />
                          </TableCell>
                          <TableCell>{formatCantidad(c.cantidad_inicial)}</TableCell>
                          <TableCell align="center">
                            <Button size="small" variant="outlined" onClick={() => cargarDashboard(c)}>
                              Ver KPIs
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          );
        }}
      />

      {seleccionado && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", color: "#023047" }}>
            Dashboard — {seleccionado.nombre_pileta} ({seleccionado.estado ?? seleccionado.fc_estado})
          </Typography>

          {cargandoDashboard ? (
            <Typography variant="body2">Cargando indicadores…</Typography>
          ) : dashboard ? (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <KpiCard
                    titulo="Duración"
                    valor={`${kpis.duracion_dias ?? 0} días`}
                    subtitulo={`Desde ${formatFecha(kpis.fecha_inicio)}`}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <KpiCard
                    titulo="Cantidad"
                    valor={`${formatCantidad(kpis.cantidad_inicial)} → ${formatCantidad(kpis.cantidad_actual)}`}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <KpiCard
                    titulo="Consumo real"
                    valor={`${formatCantidad(kpis.consumo_real_kg ?? 0)} kg`}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <KpiCard
                    titulo="Índice crecimiento (SGR)"
                    valor={
                      kpis.indice_crecimiento_sgr != null
                        ? `${kpis.indice_crecimiento_sgr}%`
                        : "—"
                    }
                    subtitulo={
                      kpis.peso_inicial_g && kpis.peso_final_g
                        ? `${kpis.peso_inicial_g} g → ${kpis.peso_final_g} g`
                        : undefined
                    }
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                Biometrías del ciclo
              </Typography>
              <Paper sx={{ mb: 3, borderRadius: 2 }}>
                <TableContainer sx={{ overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Peso prom. (g)</TableCell>
                        <TableCell>Muestreados</TableCell>
                        <TableCell>Encargado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(dashboard.biometrias ?? []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            Sin biometrías en el periodo del ciclo.
                          </TableCell>
                        </TableRow>
                      ) : (
                        dashboard.biometrias.map((b) => (
                          <TableRow key={b.id}>
                            <TableCell>{formatFecha(b.fecha)}</TableCell>
                            <TableCell>{b.peso_promedio ?? "—"}</TableCell>
                            <TableCell>{b.organismos_muestreados ?? "—"}</TableCell>
                            <TableCell>{b.encargado || "—"}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                Consumo de alimento (insumos)
              </Typography>
              <Paper sx={{ borderRadius: 2 }}>
                <TableContainer sx={{ overflowX: "auto" }}>
                  <Table size="small" sx={{ minWidth: 720 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell>Cantidad UdM</TableCell>
                        <TableCell>Kg estimados</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(dashboard.consumo_real ?? []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            Sin consumo registrado en insumos.
                          </TableCell>
                        </TableRow>
                      ) : (
                        dashboard.consumo_real.map((r) => (
                          <TableRow key={r.fi_id}>
                            <TableCell>{formatFecha(r.fd_fecha)}</TableCell>
                            <TableCell>{r.fc_descripcion || "—"}</TableCell>
                            <TableCell>{r.fc_cantidad_udm || "—"}</TableCell>
                            <TableCell>
                              {r.cantidad_kg != null ? formatCantidad(r.cantidad_kg) : "—"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </>
          ) : null}
        </Box>
      )}
    </Box>
  );
}
