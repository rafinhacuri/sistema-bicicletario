import mongoose, { Schema } from 'mongoose'
import type { BikeMongo } from '~/schemas/bicicleta'
import type { UserAdm, UserMongo } from '~/schemas/user'

const { MONGO_URL, MONGO_USERNAME, MONGO_PASSWORD, MONGO_DB_NAME } = useRuntimeConfig()

mongoose.connect(MONGO_URL, {
  tls: true,
  auth: { username: MONGO_USERNAME, password: MONGO_PASSWORD },
  dbName: MONGO_DB_NAME,
})

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

export const Bikes = mongoose.model('bikes', new Schema<BikeMongo>({
  status: { type: String, default: 'Disponível' },
  codigo: { type: String, required: true },
  modelo: { type: String, required: true },
  marca: { type: String, required: true },
  precoMinuto: { type: Number, required: true },
  valor: { type: Number, required: true },
}))
