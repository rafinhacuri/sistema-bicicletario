import { BikeSchema } from '~/schemas/bicicleta'

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event, { statusCode: 401, message: 'Você não tem pemissão para executar essa ação' })

  if(user.level !== 'Administrador') throw createError({ status: 401, message: 'Você não tem permissão para acessar esses dados' })

  const body = await readValidatedBody(event, BikeSchema.safeParse)

  if(!body.success) throw createError({ status: 401, message: body.error.errors[0].message })

  const { codigo, modelo, marca, precoMinuto, valor } = body.data

  const existe = await Bikes.findOne({ codigo })

  if(existe) throw createError({ status: 401, message: 'Bicicleta já cadastrada' })

  await new Bikes({ codigo, modelo, marca, precoMinuto, valor }).save()

  return `A bicileta foi registrada com sucesso`
})
