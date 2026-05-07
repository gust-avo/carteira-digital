const { isValidCpf, normalizeCpf } = require("./cpfValidator");
const { HttpError } = require("./httpError");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[A-Za-zÀ-ÿ' ]{2,80}$/;
const cpfFormatRegex = /^(\d{3}\.?\d{3}\.?\d{3}-?\d{2})$/;
const moneyLimitInCents = 100000000;

function assertName(nome) {
  if (!nome || !nameRegex.test(String(nome).trim())) {
    throw new HttpError(400, "Nome invalido. Use letras, espacos e apostrofo.");
  }
  return String(nome).trim();
}

function assertEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!emailRegex.test(normalized) || /[<>"'`;()]/.test(normalized)) {
    throw new HttpError(400, "Email invalido.");
  }
  return normalized;
}

function assertCpf(cpf) {
  const text = String(cpf || "").trim();
  if (!cpfFormatRegex.test(text) || !isValidCpf(text)) {
    throw new HttpError(400, "CPF invalido.");
  }
  return normalizeCpf(text);
}

function assertPassword(senha) {
  if (!senha || String(senha).length < 6) {
    throw new HttpError(400, "Senha deve ter pelo menos 6 caracteres.");
  }
  return String(senha);
}

function toCents(value) {
  if (typeof value === "string" && !/^\d+([,.]\d{1,2})?$/.test(value.trim())) {
    throw new HttpError(400, "Valor monetario invalido.");
  }
  const number = Number(String(value).replace(",", "."));
  if (!Number.isFinite(number)) {
    throw new HttpError(400, "Valor monetario invalido.");
  }
  return Math.round(number * 100);
}

function assertMoney(value, { allowZero = false } = {}) {
  const cents = toCents(value);
  const min = allowZero ? 0 : 1;
  if (cents < min || cents > moneyLimitInCents) {
    throw new HttpError(400, "Valor deve estar entre R$ 0,01 e R$ 1.000.000,00.");
  }
  return cents;
}

function formatAccount(row) {
  return {
    id: row.id,
    userId: row.user_id,
    tipo: row.tipo,
    saldo: row.saldo_centavos / 100,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formatTransaction(row) {
  return {
    id: row.id,
    contaId: row.account_id,
    contaRelacionadaId: row.related_account_id,
    tipo: row.tipo,
    valor: row.valor_centavos / 100,
    saldoApos: row.saldo_apos_centavos / 100,
    descricao: row.descricao,
    data: row.created_at,
  };
}

module.exports = {
  assertName,
  assertEmail,
  assertCpf,
  assertPassword,
  assertMoney,
  formatAccount,
  formatTransaction,
  moneyLimitInCents,
};
