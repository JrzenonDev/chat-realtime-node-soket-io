"use strict";

const repository = require("../repositories/user-repository");
const validation = require("../bin/helpers/validation");
const ctrlBase = require("../bin/base/controller-base");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const variables = require("../bin/configuration/variables");
const _repo = new repository();

function userController() {

}

userController.prototype.post = async (req, res) => {
  let _validationContract = new validation();
  _validationContract.isRequired(req.body.nome, "Informe o seu nome");
  _validationContract.isRequired(req.body.email, "Informe o seu email");
  _validationContract.isRequired(req.body.senha, "Informe o seu senha");
  _validationContract.isRequired(req.body.senhaConfirmacao, "Informe o seu senha confirmação");
  _validationContract.isTrue(req.body.senhaConfirmacao !== req.body.senha, "As senhas devem ser iguais");
  _validationContract.isEmail(req.body.email, "Informe email válido");

  try {
    let usuarioEmailExiste = await _repo.IsEmailExite(req.body.email);
    if(usuarioEmailExiste) {
      _validationContract.isTrue(usuarioEmailExiste.nome != undefined, `Já existe o email ${req.body.email} cadastrado no banco de dados`);
    }
    var salt = await bcrypt.genSaltSync(10);
    req.body.senha = await bcrypt.hashSync(req.body.senha, salt);
    ctrlBase.post(_repo, _validationContract, req, res);
  } catch(e) {
    res.status(500).send({message: "Interna server error", error:e});
  }

}

userController.prototype.put = async (req, res) => {
  let _validationContract = new validation();
  _validationContract.isRequired(req.body.nome, "Informe o seu nome");
  _validationContract.isRequired(req.params.id, "Informe o seu id");
  _validationContract.isRequired(req.body.email, "Informe o seu email");
  _validationContract.isRequired(req.body.senha, "Informe o seu senha");
  _validationContract.isRequired(req.body.senhaConfirmacao, "Informe o seu senha confirmação");
  _validationContract.isTrue(req.body.senhaConfirmacao !== req.body.senha, "As senhas devem ser iguais");
  _validationContract.isEmail(req.body.email, "Informe email válido");

  try {
    let usuarioEmailExiste = await _repo.IsEmailExite(req.body.email);
    if(usuarioEmailExiste) {
      _validationContract.isTrue(usuarioEmailExiste.nome != undefined && usuarioEmailExiste._id != req.params.id, `Já existe o email ${req.body.email} cadastrado no banco de dados`);
    }
    ctrlBase.put(_repo, _validationContract, req, res);
  } catch(e) {
    res.status(500).send({message: "Interna server error", error:e});
  }

}

userController.prototype.get = async (req, res) => {
  ctrlBase.get(_repo, req, res);
};

userController.prototype.delete = async (req, res) => {
  _validationContract.isRequired(req.params.id, "Informe o seu id");
  ctrlBase.delete(_repo, req, res);
};

userController.prototype.authenticate = async (req, res) => {
  let _validationContract = new validation();
  _validationContract.isRequired(req.params.id, "Informe o seu id");
  _validationContract.isRequired(req.body.email, "Informe o seu email");
  _validationContract.isRequired(req.body.senha, "Informe o seu senha");
  _validationContract.isRequired(req.body.senhaConfirmacao, "Informe o seu senha confirmação");
  _validationContract.isTrue(req.body.senhaConfirmacao !== req.body.senha, "As senhas devem ser iguais");
  _validationContract.isEmail(req.body.email, "Informe email válido");
  if(!_validationContract.isValid()) {
    res.status(400).send({
      message: "Não foi possível efetuar o login",
      validation: _validationContract.errors()
    });
    return;
  }
  let usuarioEncontrado = await _repo.authenticate(req.body.email, req.body.senha, false);
  if(usuarioEncontrado == null) {
    res.status(404).send({message: "Usuário ou senha informados são inválidos"});
  }
  if(usuarioEncontrado) {
    res.status(200).send({usuario:usuarioEncontrado, token:jwt.sign({user:usuarioEncontrado}, variables.secretKey)});
  } else {
    res.status(404).send({message: "Usuário ou senha informados são inválidos"});
  }
};

module.exports = userController;