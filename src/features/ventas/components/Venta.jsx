import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import { listVentas } from "../services/ventasService";
import useSnackbar from "@shared/hooks/useSnackbar";

const colorEstado = {
  ADEUDO: "red",
  PARCIAL: "orange",
  LIQUIDADO: "green",
  PAGADO: "green",
};

function formatNumero(valor) {
  if (valor === null || valor === undefined) return "0";
  return Number(valor).toLocaleString("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function Venta() {
  const showSnackbar = useSnackbar();
  const [ventas, setVentas] = useState([]);

  const obtenerVentas = useCallback(async () => {
    try {
      const res = await listVentas();
      setVentas(res.data);
    } catch (err) {
      console.error(err);
      showSnackbar("Error al cargar ventas", "error");
    }
  }, [showSnackbar]);

  useEffect(() => {
    obtenerVentas();
  }, [obtenerVentas]);

  return (
    <Box p={3}>
      <Card sx={{ p: 2 }}>
        <Typography variant="h5" mb={2} fontWeight="bold">
          Control de Ventas
        </Typography>

        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow>
                <TableCell>Locación</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Folio</TableCell>
                <TableCell>Razón Social</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Cant.</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Abonado</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Encargado</TableCell>
                <TableCell>Observaciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {ventas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    No hay ventas registradas.
                  </TableCell>
                </TableRow>
              ) : (
                ventas.map((v) => (
                  <TableRow key={v.fi_venta_id}>
                    <TableCell>{v.fc_locacion ?? v.fc_empresa}</TableCell>
                    <TableCell>{v.fd_fecha_venta?.split("T")[0]}</TableCell>
                    <TableCell>{v.fc_folio}</TableCell>
                    <TableCell>{v.fc_cliente}</TableCell>
                    <TableCell>{v.fc_tipo_venta}</TableCell>
                    <TableCell>{v.fn_cantidad_vendida}</TableCell>
                    <TableCell>${formatNumero(v.fn_precio_venta)}</TableCell>
                    <TableCell>${formatNumero(v.fn_monto_total)}</TableCell>
                    <TableCell>${formatNumero(v.fn_abonado)}</TableCell>
                    <TableCell>
                      <b style={{ color: colorEstado[v.fc_estado_pago] }}>
                        {v.fc_estado_pago}
                      </b>
                    </TableCell>
                    <TableCell>{v.fc_encargado_venta}</TableCell>
                    <TableCell>{v.fc_observaciones || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
}
