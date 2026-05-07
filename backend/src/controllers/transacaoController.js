const transacaoService = require("../services/transacaoService");

async function deposit(req, res, next) {
  try {
    res.status(201).json(await transacaoService.deposit(req.params.id, req.user.id, req.body));
  } catch (error) {
    next(error);
  }
}

async function withdraw(req, res, next) {
  try {
    res.status(201).json(await transacaoService.withdraw(req.params.id, req.user.id, req.body));
  } catch (error) {
    next(error);
  }
}

async function transfer(req, res, next) {
  try {
    res.status(201).json(await transacaoService.transfer(req.user.id, req.body));
  } catch (error) {
    next(error);
  }
}

async function statement(req, res, next) {
  try {
    res.json(await transacaoService.statement(req.params.id, req.user.id));
  } catch (error) {
    next(error);
  }
}

module.exports = { deposit, withdraw, transfer, statement };
