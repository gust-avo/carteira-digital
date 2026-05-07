import { Box, Card, CardContent, Grid, Stack, Typography, useTheme } from "@mui/material";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompactCurrency, formatCurrency } from "../utils/formatters";

const typeLabels = {
  corrente: "Corrente",
  poupanca: "Poupanca",
};

function toMoney(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function CurrencyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0].payload;
  return (
    <Box sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1.25, boxShadow: 2 }}>
      <Typography variant="caption" color="text.secondary">
        {item.tipo || label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 800 }}>
        {formatCurrency(payload[0].value)}
      </Typography>
    </Box>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0].payload;
  return (
    <Box sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1.25, boxShadow: 2 }}>
      <Typography variant="caption" color="text.secondary">
        {item.name}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 800 }}>
        {formatCurrency(item.saldo)}
      </Typography>
    </Box>
  );
}

export function DashboardCharts({ contas }) {
  const theme = useTheme();
  const chartColors = [theme.palette.primary.main, theme.palette.secondary.main, "#F5A524", "#6C63FF"];

  const accountRows = contas.map((conta) => ({
    name: `#${conta.id}`,
    tipo: typeLabels[conta.tipo] || conta.tipo,
    saldo: toMoney(conta.saldo),
  }));

  const typeRows = Object.values(
    contas.reduce((acc, conta) => {
      const key = conta.tipo || "outro";
      if (!acc[key]) {
        acc[key] = { name: typeLabels[key] || key, saldo: 0 };
      }
      acc[key].saldo += toMoney(conta.saldo);
      return acc;
    }, {})
  );

  const totalBalance = accountRows.reduce((sum, item) => sum + item.saldo, 0);
  const biggestAccount = accountRows.reduce((biggest, item) => (item.saldo > biggest.saldo ? item : biggest), accountRows[0]);

  if (contas.length === 0) {
    return null;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        <Card variant="outlined" sx={{ height: "100%" }}>
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Saldo por conta
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Comparativo rapido dos saldos disponiveis.
                </Typography>
              </Box>

              <Box sx={{ height: 280 }} role="img" aria-label="Grafico de barras com saldo por conta">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={accountRows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={formatCompactCurrency} tickLine={false} axisLine={false} width={82} />
                    <Tooltip content={<CurrencyTooltip />} cursor={{ fill: theme.palette.primary.light }} />
                    <Bar dataKey="saldo" name="Saldo" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card variant="outlined" sx={{ height: "100%" }}>
          <CardContent>
            <Stack spacing={2} sx={{ height: "100%" }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Distribuicao
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Saldo agrupado por tipo de conta.
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Patrimonio total
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>
                  {formatCurrency(totalBalance)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Maior saldo: conta {biggestAccount.name}
                </Typography>
              </Box>

              <Box sx={{ height: 210, minHeight: 210 }} role="img" aria-label="Grafico circular com saldo por tipo de conta">
                {totalBalance > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={typeRows} dataKey="saldo" nameKey="name" innerRadius={48} outerRadius={76} paddingAngle={3}>
                        {typeRows.map((entry, index) => (
                          <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                      <Legend iconType="circle" verticalAlign="bottom" height={28} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ alignItems: "center", bgcolor: "background.default", borderRadius: 1, display: "flex", height: "100%", justifyContent: "center", px: 2, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Sem saldo para distribuir.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
