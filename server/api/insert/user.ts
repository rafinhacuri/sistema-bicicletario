import { sha512Crypt } from 'ldap-passwords'
import { UserSchema } from '~/schemas/user'

export default defineEventHandler(async event => {
  const body = await readValidatedBody(event, UserSchema.safeParse)

  if(!body.success) throw createError({ status: 401, message: body.error.errors[0].message })

  const { cpf, dadosBancarios, email, nome, senha, sobrenome, cpfCartao, cvv, dataValidade, nomeCartao, numeroCartao } = body.data

  const existe = await Users.findOne({ email })

  if(existe) throw createError({ status: 401, message: 'Usuário já cadastrado' })

  const existe2 = await Adm.findOne({ email })

  if(existe2) throw createError({ status: 401, message: 'Usuário já cadastrado' })

  const senhaCrypt = sha512Crypt(senha)

  if(!senhaCrypt) throw createError({ status: 500, message: 'Erro ao criptografar a senha' })

  if(dadosBancarios && (!numeroCartao || !cvv || !dataValidade || !nomeCartao || !cpfCartao)) throw createError({ status: 401, message: 'Preencha todos os campos de pagamento' })

  await new Users({ cpf, dadosBancarios, nome, sobrenome, cpfCartao, cvv, dataValidade, nomeCartao, numeroCartao, email, senha: senhaCrypt }).save()

  return `Sua conta foi registrada com sucesso`
})
