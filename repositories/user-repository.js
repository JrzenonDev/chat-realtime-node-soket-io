require("../models/user-model");
const base = require("../bin/base/repository-base");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class userRepository {
  constructor() {
    this._base = new base("User");
    this._projection = "nome email";
  }
  async authenticate(Email, Senha, flag) {
    let user = await this._base._model.findOne({email:Email});
    let userR = await this._base._model.findOne({email:Email}, this._projection);
    if(await bcrypt.compareSync(Senha, user.senha)) {
      return userR;
    }
    return null;
  }
  async IsEmailExiste(Email) {
    return await this._base._model.findOne({email:Email}, this._projection);
  }
  async create(data, req) {
    let userCriado = await this._base.create(data);
    return userCriado;
  }
  async update(id, data, usuarioLogado) {
    if(usuarioLogado._id === id) {
      if(data.oldPassaword !== data.senha && data.oldPassaword && data.senha !== undefined && data.senhaConfirmacao !== undefined && data.senha === data.senhaConfirmacao) {
        let user = await this._base._model.findOne({_id:id});
        if(await bcrypt.compareSync(data.oldPassaword, user.senha)) {
          var salt = await bcrypt.genSaltSync(10);
          let _hashSenha = await bcrypt.hashSync(data.senha, salt);
          let nome = user.nome;
          let email = user.email;
          if(data.email) {
            email = data.email;
          }
          if(data.nome) {
            nome = data.nome;
          }
          let usuarioAtualizado = await this._base.upadate(id, {nome:nome, email:email, senha:_hashSenha});
          return this._base._model.findById(userAtualizado._id, this._projection);
        } else {
          return { message: 'Senha inválida' };
        }
      }
    } else {
      return { message: 'Você não tem permissão para editar esse usuário' };
    }
  }

  async getAll() {
    return await this._base.getAll();
  }
  async delete(id) {
    return await this._base.delete(id);
  }
}

module.exports = userRepository;