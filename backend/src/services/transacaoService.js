const { db } = require("../models/db");
const { HttpError } = require("../utils/httpError");
const { assertMoney, formatTransaction } = require("../utils/validators");
const { getOwnedAccount } = require("./contaService");

async function createTransaction(trx, account, tipo, valorCentavos, saldoAposCentavos, relatedAccountId, descricao) {
  const [id] = await trx("transactions").insert({
    account_id: account.id,
    related_account_id: relatedAccountId || null,
    tipo,
    valor_centavos: valorCentavos,
    saldo_apos_centavos: saldoAposCentavos,
    descricao,
  });
  return trx("transactions").where({ id }).first();
}

async function deposit(accountId, userId, payload) {
  const valorCentavos = assertMoney(payload.valor);
  return db.transaction(async (trx) => {
    const account = await getOwnedAccount(accountId, userId, trx);
    const saldoApos = account.saldo_centavos + valorCentavos;
    await trx("accounts").where({ id: account.id }).update({ saldo_centavos: saldoApos, updated_at: trx.fn.now() });
    const transaction = await createTransaction(trx, account, "deposito", valorCentavos, saldoApos, null, "Deposito em conta");
    return formatTransaction(transaction);
  });
}

async function withdraw(accountId, userId, payload) {
  const valorCentavos = assertMoney(payload.valor);
  return db.transaction(async (trx) => {
    const account = await getOwnedAccount(accountId, userId, trx);
    if (account.saldo_centavos < valorCentavos) {
      throw new HttpError(400, "Saldo insuficiente para saque.");
    }

    const saldoApos = account.saldo_centavos - valorCentavos;
    await trx("accounts").where({ id: account.id }).update({ saldo_centavos: saldoApos, updated_at: trx.fn.now() });
    const transaction = await createTransaction(trx, account, "saque", valorCentavos, saldoApos, null, "Saque em conta");
    return formatTransaction(transaction);
  });
}

async function transfer(userId, payload) {
  const origem = Number(payload.origem);
  const destino = Number(payload.destino);
  const valorCentavos = assertMoney(payload.valor);

  if (!origem || !destino || origem === destino) {
    throw new HttpError(400, "Contas de origem e destino devem ser diferentes.");
  }

  return db.transaction(async (trx) => {
    const source = await getOwnedAccount(origem, userId, trx);
    const target = await trx("accounts").where({ id: destino, user_id: userId, status: "ativa" }).first();

    if (!target) {
      throw new HttpError(404, "Conta destino nao encontrada.");
    }
    if (source.saldo_centavos < valorCentavos) {
      throw new HttpError(400, "Saldo insuficiente para transferencia.");
    }

    const sourceBalance = source.saldo_centavos - valorCentavos;
    const targetBalance = target.saldo_centavos + valorCentavos;

    await trx("accounts").where({ id: source.id }).update({ saldo_centavos: sourceBalance, updated_at: trx.fn.now() });
    await trx("accounts").where({ id: target.id }).update({ saldo_centavos: targetBalance, updated_at: trx.fn.now() });

    const debit = await createTransaction(
      trx,
      source,
      "transferencia_enviada",
      valorCentavos,
      sourceBalance,
      target.id,
      "Transferencia enviada"
    );
    const credit = await createTransaction(
      trx,
      target,
      "transferencia_recebida",
      valorCentavos,
      targetBalance,
      source.id,
      "Transferencia recebida"
    );

    return { origem: formatTransaction(debit), destino: formatTransaction(credit) };
  });
}

async function statement(accountId, userId) {
  await getOwnedAccount(accountId, userId);
  const rows = await db("transactions").where({ account_id: accountId }).orderBy("created_at", "desc").orderBy("id", "desc");
  return rows.map(formatTransaction);
}

module.exports = { deposit, withdraw, transfer, statement };
