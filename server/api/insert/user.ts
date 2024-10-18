import { sha512Crypt } from 'ldap-passwords'
import { UserSchema } from '~/schemas/user'

export default defineEventHandler(async event => {
  const body = await readValidatedBody(event, UserSchema.safeParse)

  if(!body.success) throw createError({ status: 401, message: body.error.errors[0].message })

  const { email, nome, senha } = body.data

  const existe = await Users.findOne({ email })

  if(existe) throw createError({ status: 401, message: 'Usuário já cadastrado' })

  const existe2 = await Adm.findOne({ email })

  if(existe2) throw createError({ status: 401, message: 'Usuário já cadastrado' })

  const senhaCrypt = sha512Crypt(senha)

  if(!senhaCrypt) throw createError({ status: 500, message: 'Erro ao criptografar a senha' })

  await new Users({ nome, email, senha: senhaCrypt }).save()

  return `Sua conta foi registrada com sucesso`
})
