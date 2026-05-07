const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../models/db");
const { HttpError } = require("../utils/httpError");
const { assertName, assertEmail, assertCpf, assertPassword } = require("../utils/validators");

function publicUser(row) {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    cpf: row.cpf,
  };
}

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "dev-secret", {
    expiresIn: "1d",
  });
}

async function register(payload) {
  const nome = assertName(payload.nome);
  const email = assertEmail(payload.email);
  const cpf = assertCpf(payload.cpf);
  const senha = assertPassword(payload.senha);

  const existing = await db("users").where({ email }).orWhere({ cpf }).first();
  if (existing) {
    throw new HttpError(400, "Email ou CPF ja cadastrado.");
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const [id] = await db("users").insert({ nome, email, cpf, senha_hash: senhaHash });
  const user = await db("users").where({ id }).first();

  return { user: publicUser(user), token: signToken(user) };
}

async function login(payload) {
  const email = assertEmail(payload.email);
  const senha = String(payload.senha || "");
  const user = await db("users").where({ email }).first();

  if (!user || !(await bcrypt.compare(senha, user.senha_hash))) {
    throw new HttpError(401, "Credenciais invalidas.");
  }

  return { user: publicUser(user), token: signToken(user) };
}

module.exports = { register, login, publicUser };
