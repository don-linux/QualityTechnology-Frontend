import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  listCiclosAvicola,
  getCicloAvicola,
  createCalendarioEvento,
  updateCalendarioEvento,
  deleteCalendarioEvento,
  createGasto,
  updateGasto,
  deleteGasto,
  createVenta,
  updateVenta,
  deleteVenta,
  createBiometria,
  updateBiometria,
  deleteBiometria,
  createMortalidad,
  updateMortalidad,
  deleteMortalidad,
  createAlimentoFase,
  updateAlimentoFase,
  deleteAlimentoFase,
  createConsumoEstimado,
  updateConsumoEstimado,
  deleteConsumoEstimado,
  createSanidad,
  updateSanidad,
  deleteSanidad,
} from "../services/cicloAvicolaService";
import { formatFecha } from "@shared/utils/formatters";
import CicloEngordaKpis from "./ciclos-engorda/CicloEngordaKpis";
import CicloEngordaTablaSeccion from "./ciclos-engorda/CicloEngordaTablaSeccion";
import { SECCIONES_CICLO_ENGORDA } from "./ciclos-engorda/cicloEngordaSecciones";

const API_HANDLERS = {
  calendario: {
    create: createCalendarioEvento,
    update: updateCalendarioEvento,
    delete: deleteCalendarioEvento,
  },
  gastos: {
    create: createGasto,
    update: updateGasto,
    delete: deleteGasto,
  },
  ventas: {
    create: createVenta,
    update: updateVenta,
    delete: deleteVenta,
  },
  biometrias: {
    create: createBiometria,
    update: updateBiometria,
    delete: deleteBiometria,
  },
  mortalidad: {
    create: createMortalidad,
    update: updateMortalidad,
    delete: deleteMortalidad,
  },
  alimento: {
    create: createAlimentoFase,
    update: updateAlimentoFase,
    delete: deleteAlimentoFase,
  },
  "consumo-estimado": {
    create: createConsumoEstimado,
    update: updateConsumoEstimado,
    delete: deleteConsumoEstimado,
  },
  sanidad: {
    create: createSanidad,
    update: updateSanidad,
    delete: deleteSanidad,
  },
};

export default function CiclosEngorda() {
  const [ciclos, setCiclos] = useState([]);
  const [cicloId, setCicloId] = useState("");
  const [ciclo, setCiclo] = useState(null);
  const [tab, setTab] = useState(0);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const cargarLista = useCallback(async () => {
    setCargandoLista(true);
    try {
      const res = await listCiclosAvicola("engorda");
      const data = Array.isArray(res.data) ? res.data : [];
      setCiclos(data);
      setCicloId((prev) => prev || (data[0] ? String(data[0].id) : ""));
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoLista(false);
    }
  }, []);

  const cargarDetalle = useCallback(async (id) => {
    if (!id) {
      setCiclo(null);
      return;
    }
    setCargandoDetalle(true);
    try {
      const res = await getCicloAvicola(id);
      setCiclo(res.data);
    } catch (err) {
      console.error(err);
      setCiclo(null);
    } finally {
      setCargandoDetalle(false);
    }
  }, []);

  useEffect(() => {
    cargarLista();
  }, [cargarLista]);

  useEffect(() => {
    cargarDetalle(cicloId);
  }, [cicloId, cargarDetalle]);

  const seccionActiva = SECCIONES_CICLO_ENGORDA[tab];
  const handlers = seccionActiva ? API_HANDLERS[seccionActiva.id] : null;

  const filasSeccion = useMemo(() => {
    if (!ciclo || !seccionActiva) return [];
    return ciclo[seccionActiva.dataKey] ?? [];
  }, [ciclo, seccionActiva]);

  const recargarCiclo = () => cargarDetalle(cicloId);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", color: "#004d73" }}>
        Ciclos de engorda
      </Typography>

      {cargandoLista ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : ciclos.length === 0 ? (
        <Typography color="text.secondary">
          No hay ciclos de engorda registrados. Ejecute la migración y el seed del backend.
        </Typography>
      ) : (
        <>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2, alignItems: "center" }}>
            <TextField
              select
              label="Ciclo / lote"
              value={cicloId}
              onChange={(e) => setCicloId(e.target.value)}
              sx={{ minWidth: 220 }}
              size="small"
            >
              {ciclos.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.id_ciclo} — {c.especie}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {cargandoDetalle || !ciclo ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#004d73", mb: 1 }}>
                    Datos del ciclo
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                    <Typography variant="body2">
                      <strong>ID:</strong> {ciclo.id_ciclo}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Especie:</strong> {ciclo.especie}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Objetivo:</strong> {ciclo.objetivo ?? "—"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Inicio:</strong> {formatFecha(ciclo.fecha_inicio)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Salida est.:</strong> {formatFecha(ciclo.fecha_salida_estimada)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Animales iniciales:</strong> {ciclo.animales_iniciales}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Estado:</strong> {ciclo.estado_label ?? ciclo.estado}
                    </Typography>
                    {ciclo.ubicacion ? (
                      <Typography variant="body2">
                        <strong>Ubicación:</strong> {ciclo.ubicacion}
                      </Typography>
                    ) : null}
                  </Box>
                </CardContent>
              </Card>

              <CicloEngordaKpis ciclo={ciclo} />

              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
              >
                {SECCIONES_CICLO_ENGORDA.map((s) => (
                  <Tab key={s.id} label={s.label} />
                ))}
              </Tabs>

              {seccionActiva && handlers ? (
                <CicloEngordaTablaSeccion
                  cicloId={ciclo.id}
                  cicloLabel={ciclo.id_ciclo}
                  seccion={seccionActiva}
                  rows={filasSeccion}
                  onCreate={(data) => handlers.create(ciclo.id, data)}
                  onUpdate={(itemId, data) => handlers.update(ciclo.id, itemId, data)}
                  onDelete={(itemId) => handlers.delete(ciclo.id, itemId)}
                  onReload={recargarCiclo}
                />
              ) : null}
            </>
          )}
        </>
      )}
    </Box>
  );
}
