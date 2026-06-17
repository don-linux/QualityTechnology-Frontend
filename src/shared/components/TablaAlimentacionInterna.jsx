import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import { formatCantidad, formatFecha } from "@shared/utils/formatters";

export default function TablaAlimentacionInterna({ data, loading, piletaNombre }) {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!data) return null;

  const organismo = data.organismo ?? {};
  const kpis = data.kpis ?? {};

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
        Alimentacion interna — {piletaNombre || organismo.pileta_nombre || "Pileta"}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: "bold" }}>
              Datos del organismo
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Pileta</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {piletaNombre || organismo.pileta_nombre || "—"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Ubicacion</Typography>
                <Typography variant="body2" fontWeight="bold">{organismo.ubicacion || "—"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Etapa</Typography>
                <Typography variant="body2" fontWeight="bold">{organismo.etapa || "—"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Organismos</Typography>
                <Typography variant="body2" fontWeight="bold">{formatCantidad(organismo.cantidad_total)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Peso (g)</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {organismo.peso_gramos != null ? formatCantidad(organismo.peso_gramos) : "—"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Inicio ciclo</Typography>
                <Typography variant="body2" fontWeight="bold">{formatFecha(organismo.fecha_inicio) || "—"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Consumo real (kg)</Typography>
                <Typography variant="body2" fontWeight="bold">{formatCantidad(kpis.consumo_real_kg)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Plan total (kg)</Typography>
                <Typography variant="body2" fontWeight="bold">{formatCantidad(kpis.plan_alimento_total_kg)}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
            Plan teorico diario
          </Typography>
          <Paper sx={{ borderRadius: 2, mb: 2 }}>
            <TableContainer sx={{ overflowX: "auto", maxWidth: "100%" }}>
              <Table size="small" sx={{ minWidth: 1350 }}>
                <TableHead sx={{ backgroundColor: "#006d77" }}>
                  <TableRow>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Dia</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Tipo alimento</TableCell>
                    <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>Peso prom. (g)</TableCell>
                    <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>Biomasa (kg)</TableCell>
                    <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>% alimentacion</TableCell>
                    <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>Kg/dia</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data.plan_diario ?? []).slice(0, 60).map((f) => (
                    <TableRow key={f.dia}>
                      <TableCell>{f.dia}</TableCell>
                      <TableCell>{f.tipo_alimento}</TableCell>
                      <TableCell align="right">{f.peso_promedio_g}</TableCell>
                      <TableCell align="right">{f.biomasa_kg}</TableCell>
                      <TableCell align="right">{f.tasa_alimentacion_pct}</TableCell>
                      <TableCell align="right">{f.kg_alimento_dia}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {(data.plan_diario ?? []).length > 60 ? (
              <Typography variant="caption" sx={{ p: 1, display: "block" }}>
                Mostrando los primeros 60 dias de {(data.plan_diario ?? []).length}.
              </Typography>
            ) : null}
          </Paper>

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
            Consumo real (insumos)
          </Typography>
          <Paper sx={{ borderRadius: 2 }}>
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="small" sx={{ minWidth: 720 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Descripcion</TableCell>
                    <TableCell>Cantidad UdM</TableCell>
                    <TableCell>Kg estimados</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data.egresos_reales ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">Sin egresos vinculados a esta pileta.</TableCell>
                    </TableRow>
                  ) : (
                    (data.egresos_reales ?? []).map((r) => (
                      <TableRow key={r.fi_id ?? r.id}>
                        <TableCell>{formatFecha(r.fd_fecha)}</TableCell>
                        <TableCell>{r.fc_descripcion || "—"}</TableCell>
                        <TableCell>{r.fc_cantidad_udm || "—"}</TableCell>
                        <TableCell>{r.cantidad_kg != null ? formatCantidad(r.cantidad_kg) : "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
