const { db } = require("../models/db");
const { HttpError } = require("../utils/httpError");
const { assertName, assertEmail, assertCpf, assertMoney, formatAccount } = require("../utils/validators");
const { publicUser } = require("./authService");

async function listAccounts(userId) {
  const rows = await db("accounts").where({ user_id: userId, status: "ativa" }).orderBy("id", "desc");
  return rows.map(formatAccount);
}

async function createAccount(userId, payload) {
  const tipo = String(payload.tipo || "").toLowerCase();
  if (!["corrente", "poupanca", "poupança"].includes(tipo)) {
    throw new HttpError(400, "Tipo de conta deve ser corrente ou poupanca.");
  }

  const saldoCentavos = assertMoney(payload.saldoInicial ?? 0, { allowZero: true });
  const [id] = await db("accounts").insert({
    user_id: userId,
    tipo: tipo === "poupança" ? "poupanca" : tipo,
    saldo_centavos: saldoCentavos,
    status: "ativa",
  });

  const account = await db("accounts").where({ id }).first();
  return formatAccount(account);
}

async function getOwnedAccount(accountId, userId, trx = db) {
  const account = await trx("accounts").where({ id: accountId, user_id: userId, status: "ativa" }).first();
  if (!account) {
    throw new HttpError(404, "Conta nao encontrada.");
  }
  return account;
}

async function getBalance(accountId, userId) {
  const account = await getOwnedAccount(accountId, userId);
  return { contaId: account.id, saldo: account.saldo_centavos / 100 };
}

async function updateAccountUser(accountId, userId, payload) {
  await getOwnedAccount(accountId, userId);

  const nome = assertName(payload.nome);
  const email = assertEmail(payload.email);
  const cpf = assertCpf(payload.cpf);

  const duplicated = await db("users")
    .where((builder) => builder.where({ email }).orWhere({ cpf }))
    .whereNot({ id: userId })
    .first();

  if (duplicated) {
    throw new HttpError(400, "Email ou CPF ja cadastrado.");
  }

  await db("users").where({ id: userId }).update({ nome, email, cpf, updated_at: db.fn.now() });
  const user = await db("users").where({ id: userId }).first();
  return publicUser(user);
}

async function deleteAccount(accountId, userId) {
  const account = await getOwnedAccount(accountId, userId);
  if (account.saldo_centavos > 0) {
    throw new HttpError(400, "Nao e permitido excluir conta com saldo maior que zero.");
  }

  const pendingTransactions = await db("transactions").where({ account_id: accountId }).count({ total: "*" }).first();
  if (Number(pendingTransactions.total) > 0) {
    throw new HttpError(400, "Nao e permitido excluir conta com movimentacoes.");
  }

  await db("accounts").where({ id: accountId }).del();
  return { message: "Conta excluida com sucesso." };
}

module.exports = {
  listAccounts,
  createAccount,
  getOwnedAccount,
  getBalance,
  updateAccountUser,
  deleteAccount,
};
