import { verifySha512Crypt } from 'ldap-passwords'
import type { Levels } from '~/types/auth'
import { AuthenticationSchema } from '~/schemas/authentication'

export default defineEventHandler(async event => {
  const body = await readValidatedBody(event, AuthenticationSchema.safeParse)

  if(!body.success) throw createError({ status: 401, message: body.error.errors[0].message })

  const { email, senha } = body.data

  const user: { email: string, level: Levels, nome: string } = { email, nome: '', level: 'Usuário' }

  const userAdm = await Adm.findOne({ email })
    .catch(() => { throw createError({ status: 500, message: 'Não foi possivel ler os usuarios do banco de dados' }) })

  const userNormal = await Users.findOne({ email })
    .catch(() => { throw createError({ status: 500, message: 'Não foi possivel ler os usuarios do banco de dados' }) })

  if(userAdm){
    const senhas = userAdm.senha

    if(!senhas) throw createError({ status: 401, message: 'Usuário e/ou senha inválidos' })

    if(!verifySha512Crypt(senha, senhas)) throw createError({ status: 401, message: 'Usuário e/ou senha inválidos' })

    user.level = 'Administrador'
    user.nome = userAdm.nome
  }

  if(userNormal){
    const senhas = userNormal.senha

    if(!senhas) throw createError({ status: 401, message: 'Usuário e/ou senha inválidos' })

    if(!verifySha512Crypt(senha, senhas)) throw createError({ status: 401, message: 'Usuário e/ou senha inválidos' })

    user.nome = userNormal.nome
    user.level = 'Usuário'
  }

  if(!userAdm && !userNormal) throw createError({ status: 401, message: 'Usuário e/ou senha inválidos' })

  await setUserSession(event, { user: { level: user.level, email: user.email, nome: user.nome } })

  return 'Autenticado com sucesso!'
})
