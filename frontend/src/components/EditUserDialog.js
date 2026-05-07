import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { formatCpf } from "../utils/formatters";

export function EditUserDialog({ open, user, onClose, onSubmit }) {
  const [form, setForm] = useState({ nome: "", email: "", cpf: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && user) {
      setForm({ nome: user.nome || "", email: user.email || "", cpf: formatCpf(user.cpf || "") });
      setErrors({});
    }
  }, [open, user]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: field === "cpf" ? formatCpf(value) : value }));
  }

  function submit() {
    const nextErrors = {};
    if (!/^[A-Za-zÀ-ÿ' ]{2,80}$/.test(form.nome.trim())) nextErrors.nome = "Use apenas letras e espacos.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = "Email invalido.";
    if (form.cpf.replace(/\D/g, "").length !== 11) nextErrors.cpf = "CPF deve ter 11 digitos.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      onSubmit(form);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Atualizar dados</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField label="Nome" value={form.nome} onChange={(event) => setField("nome", event.target.value)} error={Boolean(errors.nome)} helperText={errors.nome} fullWidth />
          <TextField label="Email" value={form.email} onChange={(event) => setField("email", event.target.value)} error={Boolean(errors.email)} helperText={errors.email} fullWidth />
          <TextField label="CPF" value={form.cpf} onChange={(event) => setField("cpf", event.target.value)} error={Boolean(errors.cpf)} helperText={errors.cpf} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={submit}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
