import { IdSchema } from '~/schemas/id'

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event, { statusCode: 401, message: 'Você não tem pemissão para executar essa ação' })

  if(user.level !== 'Administrador') throw createError({ status: 401, message: 'Você não tem permissão para acessar esses dados' })

  const body = await readValidatedBody(event, IdSchema.safeParse)

  if(!body.success) throw createError({ status: 401, message: body.error.errors[0].message })

  const { id } = body.data

  await Users.findByIdAndDelete(id)
    .catch(() => { throw createError({ status: 401, message: 'Usuário não Existe' }) })

  return `O Usuário foi excluido com sucesso`
})
