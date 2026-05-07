import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Alert, Box, Button, Container, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getApiError } from "../services/api";
import { formatCpf } from "../utils/formatters";

export default function LoginPage() {
  const router = useRouter();
  const { login, register, isAuthenticated, hydrated } = useAuth();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", senha: "" });
  const [registerForm, setRegisterForm] = useState({ nome: "", email: "", cpf: "", senha: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [hydrated, isAuthenticated, router]);

  function validateLogin() {
    const next = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) next.email = "Email invalido.";
    if (!loginForm.senha) next.senha = "Informe a senha.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateRegister() {
    const next = {};
    if (!/^[A-Za-zÀ-ÿ' ]{2,80}$/.test(registerForm.nome.trim())) next.nome = "Use apenas letras e espacos.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) next.email = "Email invalido.";
    if (registerForm.cpf.replace(/\D/g, "").length !== 11) next.cpf = "CPF deve ter 11 digitos.";
    if (registerForm.senha.length < 6) next.senha = "Senha deve ter pelo menos 6 caracteres.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submitLogin(event) {
    event.preventDefault();
    if (!validateLogin()) return;
    setLoading(true);
    setMessage("");
    try {
      await login(loginForm.email, loginForm.senha);
    } catch (error) {
      setMessage(getApiError(error));
    } finally {
      setLoading(false);
    }
  }

  async function submitRegister(event) {
    event.preventDefault();
    if (!validateRegister()) return;
    setLoading(true);
    setMessage("");
    try {
      await register(registerForm);
    } catch (error) {
      setMessage(getApiError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", py: 4, bgcolor: "background.default" }}>
      <Container maxWidth="sm">
        <Paper elevation={2} sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={3}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <AccountBalanceWalletIcon color="primary" fontSize="large" />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>
                  Senaibank Digital
                </Typography>
                <Typography color="text.secondary">Carteira digital para contas, saldos e transacoes.</Typography>
              </Box>
            </Stack>

            <Tabs value={tab} onChange={(_event, value) => { setTab(value); setErrors({}); setMessage(""); }} variant="fullWidth">
              <Tab icon={<LoginIcon />} iconPosition="start" label="Login" />
              <Tab icon={<PersonAddIcon />} iconPosition="start" label="Cadastro" />
            </Tabs>

            {message && <Alert severity="error">{message}</Alert>}

            {tab === 0 ? (
              <Stack component="form" spacing={2} onSubmit={submitLogin}>
                <TextField label="Email" value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} error={Boolean(errors.email)} helperText={errors.email} fullWidth />
                <TextField label="Senha" type="password" value={loginForm.senha} onChange={(event) => setLoginForm({ ...loginForm, senha: event.target.value })} error={Boolean(errors.senha)} helperText={errors.senha} fullWidth />
                <Button type="submit" variant="contained" size="large" disabled={loading} startIcon={<LoginIcon />}>
                  Entrar
                </Button>
              </Stack>
            ) : (
              <Stack component="form" spacing={2} onSubmit={submitRegister}>
                <TextField label="Nome" value={registerForm.nome} onChange={(event) => setRegisterForm({ ...registerForm, nome: event.target.value })} error={Boolean(errors.nome)} helperText={errors.nome} fullWidth />
                <TextField label="Email" value={registerForm.email} onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })} error={Boolean(errors.email)} helperText={errors.email} fullWidth />
                <TextField label="CPF" value={registerForm.cpf} onChange={(event) => setRegisterForm({ ...registerForm, cpf: formatCpf(event.target.value) })} error={Boolean(errors.cpf)} helperText={errors.cpf} fullWidth />
                <TextField label="Senha" type="password" value={registerForm.senha} onChange={(event) => setRegisterForm({ ...registerForm, senha: event.target.value })} error={Boolean(errors.senha)} helperText={errors.senha} fullWidth />
                <Button type="submit" variant="contained" size="large" disabled={loading} startIcon={<PersonAddIcon />}>
                  Criar conta
                </Button>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
