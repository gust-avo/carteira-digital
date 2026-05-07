import AddIcon from "@mui/icons-material/Add";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { Box, Button, Card, CardContent, Chip, Stack, Tooltip, Typography } from "@mui/material";
import { formatCurrency } from "../utils/formatters";

export function CardConta({ conta, onDeposit, onWithdraw, onTransfer, onStatement }) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Stack spacing={2}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
            <Chip label={conta.tipo === "poupanca" ? "Poupanca" : "Corrente"} color="primary" variant="outlined" />
            <Typography variant="caption" color="text.secondary">
              Conta #{conta.id}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Saldo disponivel
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {formatCurrency(conta.saldo)}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
            <Tooltip title="Depositar">
              <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => onDeposit(conta)}>
                Depositar
              </Button>
            </Tooltip>
            <Tooltip title="Sacar">
              <Button size="small" variant="outlined" startIcon={<ArrowDownwardIcon />} onClick={() => onWithdraw(conta)}>
                Sacar
              </Button>
            </Tooltip>
            <Tooltip title="Transferir">
              <Button size="small" variant="outlined" startIcon={<SwapHorizIcon />} onClick={() => onTransfer(conta)}>
                Transferir
              </Button>
            </Tooltip>
            <Tooltip title="Ver extrato">
              <Button size="small" variant="text" startIcon={<ReceiptLongIcon />} onClick={() => onStatement(conta)}>
                Extrato
              </Button>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
