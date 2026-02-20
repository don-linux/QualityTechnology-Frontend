import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import axios from "axios";
import * as XLSX from "xlsx";

export default function TesoreriaGeneral() {
  const [tab, setTab] = useState(0);
  const [datos, setDatos] = useState([]);
  const [anioSeleccionado] = useState(new Date().getFullYear());

  // ✅ Usa la ruta sin acento (coincide con backend)
  const API = "http://localhost:5000/tesoreria";
  const granjas = ["Medellin", "La Ceiba", "Quality"];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    obtenerDatos();
  }, [anioSeleccionado, tab]);

  const obtenerDatos = async () => {
    try {
      const granjaActual = granjas[tab];
      const res = await axios.get(`${API}?anio=${anioSeleccionado}&granja=${granjaActual}`);
      setDatos(res.data || []);
    } catch (err) {
      console.error("❌ Error al obtener datos de tesoreria:", err);
    }
  };

  const exportarExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datos);
    XLSX.utils.book_append_sheet(wb, ws, `Tesoreria_${anioSeleccionado}`);
    XLSX.writeFile(wb, `Tesoreria_${granjas[tab]}_${anioSeleccionado}.xlsx`);
  };

  const agrupados = datos.reduce((acc, item) => {
    const key = `${item.grupo || "SIN GRUPO"}||${item.subgrupo || "SIN SUBGRUPO"}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const totalGeneral = {
    ingreso: datos.reduce((s, r) => s + Number(r.total_ingreso || 0), 0),
    egreso: datos.reduce((s, r) => s + Number(r.total_egreso || 0), 0),
    saldo: datos.reduce((s, r) => s + Number(r.saldo_neto || 0), 0),
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 0, p: 0 }}>
      <Box sx={{ width: "100%", background: "#0D4D3A", padding: "20px 30px", mb: 2 }}>
        <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
          💰 Tesoreria General — Sistema Quality
        </Typography>
      </Box>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
        <Tab label="🟦 Medellin" />
        <Tab label="🟩 La Ceiba" />
        <Tab label="📘 Quality" />
      </Tabs>

      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", color: "#0A3D2D" }}>
          Tesoreria {granjas[tab]} — {anioSeleccionado}
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ background: "#f0f0f0" }}>
              <TableRow>
                <TableCell><b>Mes</b></TableCell>
                <TableCell><b>Grupo</b></TableCell>
                <TableCell><b>Subgrupo</b></TableCell>
                <TableCell><b>Categoria</b></TableCell>
                <TableCell align="right"><b>Total Ingresos</b></TableCell>
                <TableCell align="right"><b>Total Egresos</b></TableCell>
                <TableCell align="right"><b>Saldo Neto</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {Object.entries(agrupados).map(([key, registros], i) => {
                const [grupo, subgrupo] = key.split("||");
                const totalIngreso = registros.reduce((s, r) => s + Number(r.total_ingreso || 0), 0);
                const totalEgreso = registros.reduce((s, r) => s + Number(r.total_egreso || 0), 0);
                const saldo = registros.reduce((s, r) => s + Number(r.saldo_neto || 0), 0);

                return (
                  <React.Fragment key={i}>
                    <TableRow sx={{ background: "#e0f7fa" }}>
                      <TableCell colSpan={7} sx={{ fontWeight: "bold", color: "#004d40" }}>
                        {grupo.toUpperCase()}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ background: "#f1f8e9" }}>
                      <TableCell colSpan={7} sx={{ pl: 4, fontWeight: "bold" }}>
                        {subgrupo}
                      </TableCell>
                    </TableRow>
                    {registros.map((r, j) => (
                      <TableRow key={j}>
                        <TableCell>{r.mes_nombre}</TableCell>
                        <TableCell>{r.grupo || "—"}</TableCell>
                        <TableCell>{r.subgrupo || "—"}</TableCell>
                        <TableCell>{r.categoria || "—"}</TableCell>
                        <TableCell align="right">
                          {Number(r.total_ingreso || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
                        </TableCell>
                        <TableCell align="right">
                          {Number(r.total_egreso || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
                        </TableCell>
                        <TableCell align="right" sx={{ color: r.saldo_neto >= 0 ? "green" : "red", fontWeight: "bold" }}>
                          {Number(r.saldo_neto || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ background: "#fffde7" }}>
                      <TableCell colSpan={4} align="right" sx={{ fontWeight: "bold" }}>
                        Subtotal {subgrupo}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        {totalIngreso.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        {totalEgreso.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", color: saldo >= 0 ? "green" : "red" }}>
                        {saldo.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}

              {datos.length > 0 && (
                <TableRow sx={{ background: "#dcedc8" }}>
                  <TableCell colSpan={4} align="right" sx={{ fontWeight: "bold", color: "#33691e" }}>
                    TOTAL GENERAL {anioSeleccionado}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", color: "#33691e" }}>
                    {totalGeneral.ingreso.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", color: "#33691e" }}>
                    {totalGeneral.egreso.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", color: totalGeneral.saldo >= 0 ? "green" : "red" }}>
                    {totalGeneral.saldo.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
                  </TableCell>
                </TableRow>
              )}

              {datos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No hay datos registrados para esta granja en {anioSeleccionado}.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Button
          variant="contained"
          sx={{ mt: 3, background: "#1D5C42", "&:hover": { background: "#0a3829" } }}
          onClick={exportarExcel}
        >
          📤 Exportar a Excel
        </Button>
      </Box>
    </Container>
  );
}
