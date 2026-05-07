const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const contaRoutes = require("./routes/contaRoutes");
const transacaoRoutes = require("./routes/transacaoRoutes");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000,http://127.0.0.1:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const isLocalDevOrigin = (origin) => {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  return /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
};

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || isLocalDevOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
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
