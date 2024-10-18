export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event, { statusCode: 401, message: 'Você não tem pemissão para executar essa ação' })

  if(user.level !== 'Administrador') throw createError({ status: 401, message: 'Você não tem permissão para acessar esses dados' })

  const todosAluguel = await Alugueis.find().lean()
    .catch(() => { throw createError({ status: 404, message: 'Auditório não existe' }) })

  let total = 0
  let totalPago = 0

  const aluguemPromisse = todosAluguel.map(async aluguel => {
    total++
    if(aluguel.valor) totalPago += aluguel.valor
  })

  await Promise.all(aluguemPromisse)

  return { total, totalPago }
})
