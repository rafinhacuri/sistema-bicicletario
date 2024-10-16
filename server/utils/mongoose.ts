import mongoose, { Schema } from 'mongoose'
import type { UserAdm, UserMongo } from '~/schemas/authentication'

const { MONGO_URL, MONGO_USERNAME, MONGO_PASSWORD, MONGO_DB_NAME } = useRuntimeConfig()

mongoose.connect(MONGO_URL, {
  tls: true,
  auth: { username: MONGO_USERNAME, password: MONGO_PASSWORD },
  dbName: MONGO_DB_NAME,
})

export const Log = mongoose.model('log', new Schema({
  usuario: { type: String, required: true },
  acao: { type: String, required: true },
  data: { type: Date, default: Date.now },
  ip: { type: String, required: false },
}))

export const Adm = mongoose.model('adm', new Schema<UserAdm>({
  email: { type: String, required: true },
  senha: { type: String, required: true },
  nome: { type: String, required: true },
}))

export const Users = mongoose.model('user', new Schema<UserMongo>({
  email: { type: String, required: true },
  senha: { type: String, required: true },
  nome: { type: String, required: true },
  sobrenome: { type: String, required: true },
  cpf: { type: String, required: true },
  dadosBancarios: { type: Boolean, required: true },
  numeroCartao: { type: String, required: false },
  cvv: { type: String, required: false },
  dataValidade: { type: String, required: false },
  nomeCartao: { type: String, required: false },
  cpfCartao: { type: String, required: false },
}))
