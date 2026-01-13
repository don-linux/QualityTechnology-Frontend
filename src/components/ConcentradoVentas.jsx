import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import axios from "axios";
import * as XLSX from "xlsx";
import { LineChart } from "@mui/x-charts/LineChart";

export default function ConcentradoGeneral() {
  const [dataMedellin, setDataMedellin] = useState([]);
  const [dataCeiba, setDataCeiba] = useState([]);
  const [dataIntegral, setDataIntegral] = useState([]);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    obtenerConcentrado();
  }, []);

  const obtenerConcentrado = async () => {
    try {
      const res = await axios.get("http://localhost:5000/ventas/concentrado");
      const rows = res.data || [];

      const normalizar = (nombre) =>
        nombre?.toUpperCase().includes("MEDELLIN")
          ? "MEDELLIN"
          : nombre?.toUpperCase().includes("CEIBA")
          ? "LA CEIBA"
          : nombre;

      const rowsNorm = rows.map((r) => ({
        ...r,
        granja: normalizar(r.granja),
      }));

      setDataMedellin(rowsNorm.filter((r) => r.granja === "MEDELLIN"));
      setDataCeiba(rowsNorm.filter((r) => r.granja === "LA CEIBA"));
      setDataIntegral(rowsNorm);
    } catch (error) {
      console.error("❌ Error al obtener concentrado:", error);
    }
  };

  const mesesTexto = {
    "01": "Enero",
    "02": "Febrero",
    "03": "Marzo",
    "04": "Abril",
    "05": "Mayo",
    "06": "Junio",
    "07": "Julio",
    "08": "Agosto",
    "09": "Septiembre",
    "10": "Octubre",
    "11": "Noviembre",
    "12": "Diciembre",
  };
  const formatearMes = (mes) => mesesTexto[mes.split("-")[1]];

  const exportarExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataIntegral);
    XLSX.utils.book_append_sheet(wb, ws, "Concentrado General");
    XLSX.writeFile(wb, "Concentrado_General.xlsx");
  };

  const TablaSimple = ({ titulo, campo, data, color }) => (
    <Paper
      elevation={3}
      sx={{
        mb: 4,
        borderLeft: `6px solid ${color}`,
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <Box sx={{ background: color, p: 1.2 }}>
        <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
          {titulo}
        </Typography>
      </Box>
      <TableContainer>
        <Table>
          <TableHead sx={{ background: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>Mes</b></TableCell>
              <TableCell align="right"><b>{campo}</b></TableCell>
              <TableCell align="right"><b>Importe</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.mes}>
                <TableCell>{formatearMes(row.mes)}</TableCell>
                <TableCell align="right">{(row[`total_${campo.toLowerCase()}`] || 0).toLocaleString("es-MX")}</TableCell>
                <TableCell align="right">{(row.total_mes || 0).toLocaleString("es-MX")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  const ChartSimple = ({ titulo, campo, data, color }) => (
    <Card sx={{ mb: 3, borderTop: `4px solid ${color}` }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          {titulo}
        </Typography>
        <LineChart
          height={220}
          xAxis={[{ scaleType: "band", data: data.map((r) => formatearMes(r.mes)) }]}
          series={[
            { id: campo, data: data.map((r) => r[`total_${campo.toLowerCase()}`] || 0), label: campo, color },
            { id: "Importe", data: data.map((r) => r.total_mes || 0), label: "Importe", color: "#ff9800" },
          ]}
        />
      </CardContent>
    </Card>
  );

  const renderSeccion = (titulo, color, data) => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color }}>
        {titulo}
      </Typography>

      <ChartSimple titulo="Alevines vs Importe" campo="alevines" data={data} color={color} />
      <TablaSimple titulo="Ventas de Alevines" campo="alevines" data={data} color={color} />

      <ChartSimple titulo="Mojarra (Kg) vs Importe" campo="kg" data={data} color={color} />
      <TablaSimple titulo="Ventas de Mojarra (Kg)" campo="kg" data={data} color={color} />

      <ChartSimple titulo="Alimento vs Importe" campo="alimento" data={data} color={color} />
      <TablaSimple titulo="Consumo de Alimento" campo="alimento" data={data} color={color} />

      <ChartSimple titulo="Medicamentos vs Importe" campo="medicamento" data={data} color={color} />
      <TablaSimple titulo="Uso de Medicamentos" campo="medicamento" data={data} color={color} />
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 0, p: 0 }}>
      {/* Encabezado */}
      <Box sx={{ width: "100%", background: "#0D4D3A", padding: "20px 30px", mb: 2 }}>
        <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
          📊 Concentrado General de Ventas
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-start", px: 3, mb: 2 }}>
        <Button
          variant="contained"
          onClick={exportarExcel}
          sx={{ background: "#1D5C42", color: "white" }}
        >
          Exportar Excel
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="🟦 Medellín" sx={{ fontWeight: "bold", color: "#1565C0" }} />
          <Tab label="🟩 La Ceiba" sx={{ fontWeight: "bold", color: "#2E7D32" }} />
          <Tab label="📘 Integral Quality" sx={{ fontWeight: "bold", color: "#B71C1C" }} />
        </Tabs>
      </Box>

      {tab === 0 && renderSeccion("🟦 Granja Acuícola Medellín", "#1565C0", dataMedellin)}
      {tab === 1 && renderSeccion("🟩 Granja Acuícola La Ceiba", "#2E7D32", dataCeiba)}
      {tab === 2 && renderSeccion("📘 Integral Quality", "#B71C1C", dataIntegral)}
    </Container>
  );
}
