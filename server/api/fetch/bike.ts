import { FetchBikeSchema } from '~/schemas/fetch'

export default defineEventHandler(async event => {
  await requireUserSession(event, { statusCode: 401, message: 'Você não tem pemissão para executar essa ação' })

  const body = await readValidatedBody(event, FetchBikeSchema.safeParse)

  if(!body.success) throw createError({ status: 401, message: body.error.errors[0].message })

  const { codigo } = body.data

  if(!codigo) throw createError({ status: 401, message: 'Código não informado' })
  const bike = await Bikes.findOne({ codigo }).lean()
    .catch(() => { throw createError({ status: 404, message: 'Bike não existe' }) })

  return bike
})
