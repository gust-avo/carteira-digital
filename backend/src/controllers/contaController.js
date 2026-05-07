const contaService = require("../services/contaService");

async function list(req, res, next) {
  try {
    res.json(await contaService.listAccounts(req.user.id));
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    res.status(201).json(await contaService.createAccount(req.user.id, req.body));
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    res.json(await contaService.updateAccountUser(req.params.id, req.user.id, req.body));
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    res.json(await contaService.deleteAccount(req.params.id, req.user.id));
  } catch (error) {
    next(error);
  }
}

async function balance(req, res, next) {
  try {
    res.json(await contaService.getBalance(req.params.id, req.user.id));
  } catch (error) {
    next(error);
  }
}

module.exports = { list, create, updateUser, remove, balance };
