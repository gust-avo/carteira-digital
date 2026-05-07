const jwt = require("jsonwebtoken");
const { HttpError } = require("../utils/httpError");

function authMiddleware(req, _res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new HttpError(401, "Token nao informado."));
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    return next();
  } catch (_error) {
    return next(new HttpError(401, "Token invalido ou expirado."));
  }
}

module.exports = { authMiddleware };
