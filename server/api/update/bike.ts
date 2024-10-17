import { BikeUpadateSchema } from '~/schemas/bicicleta'

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event, { statusCode: 401, message: 'Você não tem pemissão para executar essa ação' })

  if(user.level !== 'Administrador') throw createError({ status: 401, message: 'Você não tem permissão para acessar esses dados' })

  const body = await readValidatedBody(event, BikeUpadateSchema.safeParse)

  if(!body.success) throw createError({ status: 401, message: body.error.errors[0].message })

  const { modelo, marca, precoMinuto, valor, id } = body.data

  const bike = await Bikes.findById(id)

  if(!bike) throw createError({ status: 401, message: 'Bicicleta não Existe' })

  if(modelo && modelo !== bike.modelo) bike.modelo = modelo

  if(marca && marca !== bike.marca) bike.marca = marca

  if(precoMinuto && precoMinuto !== bike.precoMinuto) bike.precoMinuto = precoMinuto

  if(valor && valor !== bike.valor) bike.valor = valor

  await bike.save()

  return `A bicicleta foi com sucesso`
})
