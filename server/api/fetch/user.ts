import { FetchUserSchema } from '~/schemas/fetch'

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event, { statusCode: 401, message: 'Você não tem pemissão para executar essa ação' })

  const body = await readValidatedBody(event, FetchUserSchema.safeParse)

  if(!body.success) throw createError({ status: 401, message: body.error.errors[0].message })

  const { user: email } = body.data

  if(user.email !== email) throw createError({ status: 401, message: 'Você não tem permissão para acessar esses dados' })

  if(user.level === 'Usuário'){
    const usuario = await Users.findOne({ email }).lean()
      .catch(() => { throw createError({ status: 404, message: 'Auditório não existe' }) })

    return usuario
  }
})
