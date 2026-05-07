const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const contaRoutes = require("./routes/contaRoutes");
const transacaoRoutes = require("./routes/transacaoRoutes");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/contas", contaRoutes);
app.use("/api", transacaoRoutes);
app.use(errorHandler);

module.exports = { app };
