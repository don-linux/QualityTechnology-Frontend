import React, { useState, useEffect, useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import dayjs from "dayjs";
import "dayjs/locale/es";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

import Badge from "@mui/icons-material/Badge";
import Cake from "@mui/icons-material/Cake";
import Work from "@mui/icons-material/Work";
import CorporateFare from "@mui/icons-material/CorporateFare";
import Business from "@mui/icons-material/Business";
import EventAvailable from "@mui/icons-material/EventAvailable";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import FolderShared from "@mui/icons-material/FolderShared";
import ArrowForward from "@mui/icons-material/ArrowForward";
import CheckCircle from "@mui/icons-material/CheckCircle";
import WarningAmber from "@mui/icons-material/WarningAmber";
import ReportProblem from "@mui/icons-material/ReportProblem";

import { getPerfil } from "../services/perfilService";
import { listDocumentos, listTiposDocumento } from "../services/documentosService";

dayjs.locale("es");

const GREEN = "#006d52";
const GREEN_DARK = "#00543f";
const GREEN_LIGHT = "#3aa87d";
const HERO_GRADIENT = `linear-gradient(135deg, ${GREEN_DARK} 0%, ${GREEN} 55%, ${GREEN_LIGHT} 100%)`;
const TRACK_COLOR = "#E6E9ED";

const MotionDiv = motion.div;

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const idTipo = (x) => x?.tipo_documento_id ?? null;

function fmtFecha(value) {
  if (!value) return "No registrada";
  const d = dayjs(value);
  return d.isValid() ? d.format("D [de] MMMM [de] YYYY") : "No registrada";
}

function getEstado(ratio) {
  if (ratio >= 1) {
    return { color: "#2E7D32", icon: <CheckCircle />, label: "Documentacion completa" };
  }
  if (ratio >= 0.5) {
    return { color: "#F9A825", icon: <WarningAmber />, label: "Avanzando, faltan documentos" };
  }
  return { color: "#D32F2F", icon: <ReportProblem />, label: "Documentacion incompleta" };
}

function InfoRow({ icon, label, value }) {
  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 1.5 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          flexShrink: 0,
          borderRadius: 2.5,
          display: "grid",
          placeItems: "center",
          color: GREEN,
          bgcolor: "rgba(0,109,82,0.10)",
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary", wordBreak: "break-word" }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

function LegendDot({ color, label }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: color }} />
      <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
        {label}
      </Typography>
    </Stack>
  );
}

export default function MiPerfil() {
  const [perfil, setPerfil] = useState(null);
  const [tipos, setTipos] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await getPerfil();
        if (!activo) return;
        setPerfil(data);
        setError(null);
        try {
          const [tiposRes, docsRes] = await Promise.all([listTiposDocumento(), listDocumentos(null)]);
          if (!activo) return;
          setTipos(Array.isArray(tiposRes.data) ? tiposRes.data : []);
          setDocumentos(Array.isArray(docsRes.data) ? docsRes.data : []);
        } catch (docErr) {
          console.error(docErr);
          if (activo) {
            setTipos([]);
            setDocumentos([]);
          }
        }
      } catch (e) {
        console.error(e);
        if (activo) {
          setError("No se encontro un perfil de empleado vinculado a tu usuario. Contacta al administrador.");
          setPerfil(null);
        }
      } finally {
        if (activo) setLoading(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  const resumen = useMemo(() => {
    const total = tipos.length;
    const tiene =
      total === 0 ? 0 : tipos.filter((t) => documentos.some((d) => idTipo(d) === idTipo(t))).length;
    const faltan = Math.max(total - tiene, 0);
    const ratio = total > 0 ? tiene / total : 0;
    const porcentaje = Math.round(ratio * 100);
    return { total, tiene, faltan, ratio, porcentaje };
  }, [tipos, documentos]);

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress sx={{ color: GREEN }} />
          <Typography color="text.secondary">Cargando tu perfil...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 640, mx: "auto", px: 2, py: { xs: 3, md: 6 } }}>
        <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card sx={{ borderRadius: 4, boxShadow: "0 12px 32px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  mx: "auto",
                  mb: 2,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(0,109,82,0.10)",
                  color: GREEN,
                }}
              >
                <FolderShared sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h5" fontWeight={800} gutterBottom>
                Mi Perfil
              </Typography>
              <Alert severity="warning" sx={{ textAlign: "left" }}>
                {error}
              </Alert>
            </CardContent>
          </Card>
        </MotionDiv>
      </Box>
    );
  }

  const nombreCompleto = [perfil.nombre, perfil.apellido_paterno].filter(Boolean).join(" ").trim() || "Sin nombre";
  const inicial = (perfil.nombre || "?").charAt(0).toUpperCase();
  const puesto = perfil.puesto_nombre || "Puesto sin asignar";
  const estado = getEstado(resumen.ratio);
  const chartData = [
    { name: "Cargados", value: resumen.tiene },
    { name: "Faltantes", value: resumen.faltan },
  ];

  return (
    <Box sx={{ maxWidth: 1120, mx: "auto", px: { xs: 1, sm: 2 }, py: 2 }}>
      <MotionDiv variants={containerVariants} initial="hidden" animate="show">
        {/* Hero */}
        <MotionDiv variants={itemVariants}>
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 4,
              p: { xs: 3, sm: 4 },
              mb: 3,
              color: "#fff",
              background: HERO_GRADIENT,
              boxShadow: "0 18px 40px rgba(0,84,63,0.35)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -90,
                right: -60,
                width: 260,
                height: 260,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.10)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -110,
                right: 120,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
              }}
            />
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={3}
              alignItems={{ xs: "flex-start", sm: "center" }}
              sx={{ position: "relative" }}
            >
              <Avatar
                sx={{
                  width: 92,
                  height: 92,
                  fontSize: 40,
                  fontWeight: 700,
                  color: GREEN_DARK,
                  bgcolor: "rgba(255,255,255,0.92)",
                  border: "3px solid rgba(255,255,255,0.6)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
                }}
              >
                {inicial}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.85 }}>
                  Mi Perfil
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
                  {nombreCompleto}
                </Typography>
                <Typography sx={{ opacity: 0.92, mt: 0.5, fontWeight: 500 }}>{puesto}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap", gap: 1 }}>
                  {perfil.unidad_negocio_nombre && (
                    <Chip
                      icon={<Business sx={{ color: "#fff !important" }} />}
                      label={perfil.unidad_negocio_nombre}
                      size="small"
                      sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.18)", fontWeight: 600 }}
                    />
                  )}
                  {perfil.departamento_nombre && (
                    <Chip
                      icon={<CorporateFare sx={{ color: "#fff !important" }} />}
                      label={perfil.departamento_nombre}
                      size="small"
                      sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.18)", fontWeight: 600 }}
                    />
                  )}
                </Stack>
              </Box>
            </Stack>
          </Box>
        </MotionDiv>

        <Grid container spacing={3}>
          {/* Informacion general */}
          <Grid size={{ xs: 12, md: 7 }}>
            <MotionDiv variants={itemVariants} style={{ height: "100%" }}>
              <Card sx={{ borderRadius: 4, height: "100%", boxShadow: "0 12px 32px rgba(0,0,0,0.07)", border: "1px solid #eef1f0" }}>
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                    <Badge sx={{ color: GREEN }} />
                    <Typography variant="h6" fontWeight={800}>
                      Informacion general
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: 1 }} />
                  <Stack divider={<Divider flexItem />}>
                    <InfoRow icon={<Badge />} label="Nombre completo" value={nombreCompleto} />
                    <InfoRow icon={<Cake />} label="Fecha de nacimiento" value={fmtFecha(perfil.fecha_nacimiento)} />
                    <InfoRow icon={<Work />} label="Puesto" value={perfil.puesto_nombre || "No asignado"} />
                    <InfoRow icon={<CorporateFare />} label="Departamento" value={perfil.departamento_nombre || "No asignado"} />
                    <InfoRow icon={<Business />} label="Unidad de negocio" value={perfil.unidad_negocio_nombre || "No asignada"} />
                    <InfoRow icon={<EventAvailable />} label="Fecha de contratacion" value={fmtFecha(perfil.fecha_contratacion)} />
                  </Stack>
                </CardContent>
              </Card>
            </MotionDiv>
          </Grid>

          {/* Avance de documentacion */}
          <Grid size={{ xs: 12, md: 5 }}>
            <MotionDiv variants={itemVariants} style={{ height: "100%" }}>
              <Card sx={{ borderRadius: 4, height: "100%", boxShadow: "0 12px 32px rgba(0,0,0,0.07)", border: "1px solid #eef1f0" }}>
                <CardContent sx={{ p: { xs: 2.5, sm: 3 }, display: "flex", flexDirection: "column", height: "100%" }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                    <DescriptionOutlined sx={{ color: GREEN }} />
                    <Typography variant="h6" fontWeight={800}>
                      Avance de documentacion
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: 1 }} />

                  {resumen.total === 0 ? (
                    <Box sx={{ flexGrow: 1, display: "grid", placeItems: "center", py: 4 }}>
                      <Typography color="text.secondary" textAlign="center">
                        No hay tipos de documento configurados todavia.
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ position: "relative", width: "100%", height: 240, mt: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Tooltip
                              formatter={(value, name) => [`${value} documento(s)`, name]}
                              contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 6px 18px rgba(0,0,0,0.12)" }}
                            />
                            <Pie
                              data={chartData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={72}
                              outerRadius={98}
                              paddingAngle={resumen.tiene > 0 && resumen.faltan > 0 ? 3 : 0}
                              startAngle={90}
                              endAngle={-270}
                              stroke="none"
                            >
                              <Cell fill={estado.color} />
                              <Cell fill={TRACK_COLOR} />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            pointerEvents: "none",
                          }}
                        >
                          <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1 }}>
                            {resumen.tiene}/{resumen.total}
                          </Typography>
                          <Typography variant="body2" sx={{ color: estado.color, fontWeight: 700, mt: 0.5 }}>
                            {resumen.porcentaje}% completo
                          </Typography>
                        </Box>
                      </Box>

                      <Chip
                        icon={React.cloneElement(estado.icon, { sx: { color: `${estado.color} !important` } })}
                        label={estado.label}
                        sx={{
                          mt: 1,
                          alignSelf: "center",
                          fontWeight: 700,
                          color: estado.color,
                          bgcolor: `${estado.color}1A`,
                        }}
                      />

                      <Stack direction="row" spacing={3} justifyContent="center" sx={{ mt: 2 }}>
                        <LegendDot color={estado.color} label={`Cargados (${resumen.tiene})`} />
                        <LegendDot color={TRACK_COLOR} label={`Faltantes (${resumen.faltan})`} />
                      </Stack>
                    </>
                  )}

                  <Box sx={{ flexGrow: 1 }} />
                  <Button
                    component={RouterLink}
                    to="/mi-expediente"
                    variant="contained"
                    fullWidth
                    endIcon={<ArrowForward />}
                    sx={{ mt: 2.5, borderRadius: 2.5, textTransform: "none", fontWeight: 700, py: 1 }}
                  >
                    Ver expediente completo
                  </Button>
                </CardContent>
              </Card>
            </MotionDiv>
          </Grid>
        </Grid>
      </MotionDiv>
    </Box>
  );
}
