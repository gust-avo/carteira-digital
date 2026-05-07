const router = require("express").Router();
const contaController = require("../controllers/contaController");
const transacaoController = require("../controllers/transacaoController");
const { authMiddleware } = require("../middlewares/auth");

router.use(authMiddleware);

router.get("/", contaController.list);
router.post("/", contaController.create);
router.put("/:id/usuario", contaController.updateUser);
router.delete("/:id", contaController.remove);
router.post("/:id/deposito", transacaoController.deposit);
router.post("/:id/saque", transacaoController.withdraw);
router.get("/:id/saldo", contaController.balance);
router.get("/:id/extrato", transacaoController.statement);

module.exports = router;
