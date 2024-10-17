export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event, { statusCode: 401, message: 'Você não tem pemissão para executar essa ação' })

  if(user.level !== 'Administrador') throw createError({ status: 401, message: 'Você não tem permissão para acessar esses dados' })

  const usuario = await Users.find().lean()
    .catch(() => { throw createError({ status: 404, message: 'Auditório não existe' }) })

  return usuario
})
