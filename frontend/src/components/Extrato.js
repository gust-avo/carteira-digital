import { Dialog, DialogContent, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { formatCurrency, formatDate } from "../utils/formatters";

const labels = {
  deposito: "Deposito",
  saque: "Saque",
  transferencia_enviada: "Transferencia enviada",
  transferencia_recebida: "Transferencia recebida",
};

export function Extrato({ open, conta, transacoes, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Extrato da conta #{conta?.id}</DialogTitle>
      <DialogContent>
        {transacoes.length === 0 ? (
          <Typography color="text.secondary">Nenhuma movimentacao encontrada.</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell align="right">Saldo apos</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transacoes.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{formatDate(item.data)}</TableCell>
                  <TableCell>{labels[item.tipo] || item.tipo}</TableCell>
                  <TableCell align="right">{formatCurrency(item.valor)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.saldoApos)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
