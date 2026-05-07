import { Box, Typography, useTheme } from "@mui/material";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompactCurrency, formatCurrency, formatDate } from "../utils/formatters";

const labels = {
  deposito: "Deposito",
  saque: "Saque",
  transferencia_enviada: "Transferencia enviada",
  transferencia_recebida: "Transferencia recebida",
};

function StatementTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0].payload;
  return (
    <Box sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1.25, boxShadow: 2 }}>
      <Typography variant="caption" color="text.secondary">
        {item.data}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 800 }}>
        {formatCurrency(item.saldo)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {item.tipo} - {formatCurrency(item.valor)}
      </Typography>
    </Box>
  );
}

export function ExtratoChart({ transacoes }) {
  const theme = useTheme();
  const rows = [...transacoes]
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .map((item, index) => ({
      label: `${index + 1}`,
      data: formatDate(item.data),
      tipo: labels[item.tipo] || item.tipo,
      valor: Number(item.valor || 0),
      saldo: Number(item.saldoApos || 0),
    }));

  if (rows.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Evolucao do saldo
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Linha do tempo com o saldo apos cada movimentacao.
        </Typography>
      </Box>
      <Box sx={{ height: 280 }} role="img" aria-label="Grafico de linha com evolucao do saldo no extrato">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickFormatter={formatCompactCurrency} tickLine={false} axisLine={false} width={82} />
            <Tooltip content={<StatementTooltip />} />
            <Line type="monotone" dataKey="saldo" name="Saldo apos" stroke={theme.palette.primary.main} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
