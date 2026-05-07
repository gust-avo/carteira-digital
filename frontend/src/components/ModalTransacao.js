import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

export function ModalTransacao({ open, mode, conta, contas, onClose, onSubmit }) {
  const [valor, setValor] = useState("");
  const [destino, setDestino] = useState("");
  const [error, setError] = useState("");
  const isTransfer = mode === "transferencia";

  useEffect(() => {
    if (open) {
      setValor("");
      setDestino("");
      setError("");
    }
  }, [open]);

  const title = useMemo(() => {
    if (mode === "deposito") return "Depositar";
    if (mode === "saque") return "Sacar";
    return "Transferir";
  }, [mode]);

  function submit() {
    const number = Number(String(valor).replace(",", "."));
    if (!Number.isFinite(number) || number <= 0 || number > 1000000) {
      setError("Informe um valor entre R$ 0,01 e R$ 1.000.000,00.");
      return;
    }
    if (isTransfer && !destino) {
      setError("Selecione a conta destino.");
      return;
    }
    onSubmit({ valor: number, destino: Number(destino) });
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title} na conta #{conta?.id}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {isTransfer && (
            <FormControl fullWidth error={Boolean(error && !destino)}>
              <InputLabel id="destino-label">Conta destino</InputLabel>
              <Select labelId="destino-label" label="Conta destino" value={destino} onChange={(event) => setDestino(event.target.value)}>
                {contas
                  .filter((item) => item.id !== conta?.id)
                  .map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      #{item.id} - {item.tipo === "poupanca" ? "Poupanca" : "Corrente"}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}
          <TextField
            label="Valor"
            value={valor}
            onChange={(event) => setValor(event.target.value)}
            inputMode="decimal"
            helperText={error || "Use ponto ou virgula para centavos."}
            error={Boolean(error)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={submit}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
