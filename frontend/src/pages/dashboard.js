import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CardConta } from "../components/CardConta";
import { EditUserDialog } from "../components/EditUserDialog";
import { Extrato } from "../components/Extrato";
import { ModalTransacao } from "../components/ModalTransacao";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { api, getApiError } from "../services/api";

export default function DashboardPage() {
  const router = useRouter();
  const { hydrated, isAuthenticated, user, updateUser } = useAuth();
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({ tipo: "corrente", saldoInicial: "0" });
  const [transaction, setTransaction] = useState({ open: false, mode: "deposito", conta: null });
  const [statement, setStatement] = useState({ open: false, conta: null, rows: [] });
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/");
    }
  }, [hydrated, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAccounts();
    }
  }, [isAuthenticated]);

  async function loadAccounts() {
    setLoading(true);
    try {
      const response = await api.get("/contas");
      setContas(response.data);
    } catch (apiError) {
      setError(getApiError(apiError));
    } finally {
      setLoading(false);
    }
  }

  async function createAccount() {
    const saldoInicial = newAccount.saldoInicial === "" ? 0 : Number(String(newAccount.saldoInicial).replace(",", "."));
    if (!Number.isFinite(saldoInicial) || saldoInicial < 0) {
      setError("Informe um saldo inicial valido.");
      return;
    }

    try {
      await api.post("/contas", { ...newAccount, saldoInicial });
      setCreateOpen(false);
      setNewAccount({ tipo: "corrente", saldoInicial: "0" });
      setFeedback("Conta criada com sucesso.");
      await loadAccounts();
    } catch (apiError) {
      setError(getApiError(apiError));
    }
  }

  async function submitTransaction(payload) {
    const { mode, conta } = transaction;
    try {
      if (mode === "deposito") {
        await api.post(`/contas/${conta.id}/deposito`, { valor: payload.valor });
      } else if (mode === "saque") {
        await api.post(`/contas/${conta.id}/saque`, { valor: payload.valor });
      } else {
        await api.post("/transferencia", { origem: conta.id, destino: payload.destino, valor: payload.valor });
      }
      setTransaction({ open: false, mode: "deposito", conta: null });
      setFeedback("Operacao realizada com sucesso.");
      await loadAccounts();
    } catch (apiError) {
      setError(getApiError(apiError));
    }
  }

  async function openStatement(conta) {
    try {
      const response = await api.get(`/contas/${conta.id}/extrato`);
      setStatement({ open: true, conta, rows: response.data });
    } catch (apiError) {
      setError(getApiError(apiError));
    }
  }

  async function saveUser(payload) {
    if (contas.length === 0) {
      setError("Crie uma conta antes de atualizar os dados do usuario.");
      return;
    }
    try {
      const response = await api.put(`/contas/${contas[0].id}/usuario`, payload);
      updateUser(response.data);
      setEditOpen(false);
      setFeedback("Dados atualizados.");
    } catch (apiError) {
      setError(getApiError(apiError));
    }
  }

  if (!hydrated || !isAuthenticated) {
    return null;
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                Dashboard
              </Typography>
              <Typography color="text.secondary">Gerencie contas, transferencias e extratos em um so lugar.</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                Editar usuario
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
                Criar nova conta
              </Button>
            </Stack>
          </Box>

          {loading ? (
            <Alert severity="info">Carregando contas...</Alert>
          ) : contas.length === 0 ? (
            <Alert severity="info">Nenhuma conta cadastrada. Crie a primeira conta para comecar.</Alert>
          ) : (
            <Grid container spacing={2}>
              {contas.map((conta) => (
                <Grid item xs={12} md={6} key={conta.id}>
                  <CardConta
                    conta={conta}
                    onDeposit={(item) => setTransaction({ open: true, mode: "deposito", conta: item })}
                    onWithdraw={(item) => setTransaction({ open: true, mode: "saque", conta: item })}
                    onTransfer={(item) => setTransaction({ open: true, mode: "transferencia", conta: item })}
                    onStatement={openStatement}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      </Container>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Criar nova conta</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="tipo-label">Tipo</InputLabel>
              <Select labelId="tipo-label" label="Tipo" value={newAccount.tipo} onChange={(event) => setNewAccount({ ...newAccount, tipo: event.target.value })}>
                <MenuItem value="corrente">Corrente</MenuItem>
                <MenuItem value="poupanca">Poupanca</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Saldo inicial" type="number" inputProps={{ min: 0, step: "1" }} value={newAccount.saldoInicial} onChange={(event) => setNewAccount({ ...newAccount, saldoInicial: event.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={createAccount}>
            Criar
          </Button>
        </DialogActions>
      </Dialog>

      <ModalTransacao
        open={transaction.open}
        mode={transaction.mode}
        conta={transaction.conta}
        contas={contas}
        onClose={() => setTransaction({ open: false, mode: "deposito", conta: null })}
        onSubmit={submitTransaction}
      />
      <Extrato open={statement.open} conta={statement.conta} transacoes={statement.rows} onClose={() => setStatement({ open: false, conta: null, rows: [] })} />
      <EditUserDialog open={editOpen} user={user} onClose={() => setEditOpen(false)} onSubmit={saveUser} />

      <Snackbar open={Boolean(feedback)} autoHideDuration={3500} onClose={() => setFeedback("")}>
        <Alert severity="success" onClose={() => setFeedback("")}>{feedback}</Alert>
      </Snackbar>
      <Snackbar open={Boolean(error)} autoHideDuration={5000} onClose={() => setError("")}>
        <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
      </Snackbar>
    </>
  );
}
