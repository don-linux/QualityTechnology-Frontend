import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

const COLOR = "#004d73";

function KpiCard({ label, value, suffix = "" }) {
  return (
    <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
      <Card variant="outlined" sx={{ height: "100%", borderColor: "divider" }}>
        <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
            {label}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: COLOR, fontSize: "1rem" }}>
            {value}
            {suffix}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}

export default function CicloEngordaKpis({ ciclo }) {
  const kpis = ciclo?.kpis ?? {};
  const fmtMoney = (n) =>
    Number(n ?? 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });
  const fmtPct = (n) => `${Number(n ?? 0).toFixed(2)}%`;
  const fmtNum = (n, d = 2) => Number(n ?? 0).toFixed(d);

  return (
    <Grid container spacing={1.5} sx={{ mb: 2 }}>
      <KpiCard label="Total gastos" value={fmtMoney(kpis.total_gastos)} />
      <KpiCard label="Total ventas" value={fmtMoney(kpis.total_ventas)} />
      <KpiCard label="Utilidad neta" value={fmtMoney(kpis.utilidad_neta)} />
      <KpiCard label="Margen" value={fmtPct(kpis.margen_pct)} />
      <KpiCard label="Costo / animal" value={fmtMoney(kpis.costo_animal_inicial)} />
      <KpiCard label="Mortalidad" value={fmtPct(kpis.mortalidad_pct)} />
      <KpiCard label="Consumo alimento" value={fmtNum(kpis.consumo_alimento_kg, 1)} suffix=" kg" />
      <KpiCard label="Peso final prom." value={fmtNum(kpis.peso_final_prom_g, 2)} suffix=" g" />
      <KpiCard label="GDP final" value={fmtNum(kpis.gdp_final_g_dia, 2)} suffix=" g/día" />
      <KpiCard label="FCR aprox." value={fmtNum(kpis.fcr_aprox, 2)} />
    </Grid>
  );
}
