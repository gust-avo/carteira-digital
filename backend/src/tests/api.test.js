const request = require("supertest");
const { app } = require("../app");
const { db } = require("../models/db");
const { resetDatabase } = require("../models/migrate");

async function authUser(email = "ana@email.com", cpf = "529.982.247-25") {
  const response = await request(app).post("/api/auth/register").send({
    nome: "Ana Silva",
    email,
    cpf,
    senha: "123456",
  });

  return response.body.token;
}

async function createAccount(token, tipo = "corrente", saldoInicial = 0) {
  const response = await request(app)
    .post("/api/contas")
    .set("Authorization", `Bearer ${token}`)
    .send({ tipo, saldoInicial });

  return response.body;
}

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await db.destroy();
});

describe("autenticacao", () => {
  test("cadastra usuario e retorna token", async () => {
    const response = await request(app).post("/api/auth/register").send({
      nome: "Ana Silva",
      email: "ana@email.com",
      cpf: "529.982.247-25",
      senha: "123456",
    });

    expect(response.status).toBe(201);
    expect(response.body.token).toBeTruthy();
    expect(response.body.user.email).toBe("ana@email.com");
  });

  test("faz login com credenciais validas", async () => {
    await authUser();
    const response = await request(app).post("/api/auth/login").send({
      email: "ana@email.com",
      senha: "123456",
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeTruthy();
  });

  test("bloqueia token invalido", async () => {
    const response = await request(app).get("/api/contas").set("Authorization", "Bearer token-invalido");
    expect(response.status).toBe(401);
  });
});

describe("contas e operacoes bancarias", () => {
  test("cria, lista e consulta saldo da conta", async () => {
    const token = await authUser();
    const account = await createAccount(token, "poupanca", 50);

    const list = await request(app).get("/api/contas").set("Authorization", `Bearer ${token}`);
    const balance = await request(app).get(`/api/contas/${account.id}/saldo`).set("Authorization", `Bearer ${token}`);

    expect(account.saldo).toBe(50);
    expect(list.body).toHaveLength(1);
    expect(balance.body.saldo).toBe(50);
  });

  test("deposita, saca e emite extrato", async () => {
    const token = await authUser();
    const account = await createAccount(token, "corrente", 100);

    const deposit = await request(app)
      .post(`/api/contas/${account.id}/deposito`)
      .set("Authorization", `Bearer ${token}`)
      .send({ valor: 25.5 });
    const withdraw = await request(app)
      .post(`/api/contas/${account.id}/saque`)
      .set("Authorization", `Bearer ${token}`)
      .send({ valor: 10 });
    const statement = await request(app).get(`/api/contas/${account.id}/extrato`).set("Authorization", `Bearer ${token}`);

    expect(deposit.status).toBe(201);
    expect(deposit.body.saldoApos).toBe(125.5);
    expect(withdraw.body.saldoApos).toBe(115.5);
    expect(statement.body.map((item) => item.tipo)).toEqual(["saque", "deposito"]);
  });

  test("rejeita saque sem saldo suficiente", async () => {
    const token = await authUser();
    const account = await createAccount(token, "corrente", 20);

    const response = await request(app)
      .post(`/api/contas/${account.id}/saque`)
      .set("Authorization", `Bearer ${token}`)
      .send({ valor: 30 });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Saldo insuficiente");
  });

  test("transfere entre contas do usuario", async () => {
    const token = await authUser();
    const origem = await createAccount(token, "corrente", 200);
    const destino = await createAccount(token, "poupanca", 10);

    const response = await request(app)
      .post("/api/transferencia")
      .set("Authorization", `Bearer ${token}`)
      .send({ origem: origem.id, destino: destino.id, valor: 75 });

    const sourceBalance = await request(app).get(`/api/contas/${origem.id}/saldo`).set("Authorization", `Bearer ${token}`);
    const targetBalance = await request(app).get(`/api/contas/${destino.id}/saldo`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(sourceBalance.body.saldo).toBe(125);
    expect(targetBalance.body.saldo).toBe(85);
  });

  test("nao exclui conta com saldo ou movimentacoes", async () => {
    const token = await authUser();
    const withBalance = await createAccount(token, "corrente", 10);
    const withMovement = await createAccount(token, "corrente", 0);

    await request(app)
      .post(`/api/contas/${withMovement.id}/deposito`)
      .set("Authorization", `Bearer ${token}`)
      .send({ valor: 5 });
    await request(app)
      .post(`/api/contas/${withMovement.id}/saque`)
      .set("Authorization", `Bearer ${token}`)
      .send({ valor: 5 });

    const balanceDelete = await request(app).delete(`/api/contas/${withBalance.id}`).set("Authorization", `Bearer ${token}`);
    const movementDelete = await request(app).delete(`/api/contas/${withMovement.id}`).set("Authorization", `Bearer ${token}`);

    expect(balanceDelete.status).toBe(400);
    expect(movementDelete.status).toBe(400);
  });
});
