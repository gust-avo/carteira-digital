const router = require("express").Router();
const transacaoController = require("../controllers/transacaoController");
const { authMiddleware } = require("../middlewares/auth");

router.post("/transferencia", authMiddleware, transacaoController.transfer);

module.exports = router;
