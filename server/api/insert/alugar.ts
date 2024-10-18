import { AlugueSchema } from '~/schemas/alugar'

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event, { statusCode: 401, message: 'Você não tem pemissão para executar essa ação' })

  const body = await readValidatedBody(event, AlugueSchema.safeParse)

  if(!body.success) throw createError({ status: 401, message: body.error.errors[0].message })

  const { email, codigo } = body.data

  if(user.email !== email) throw createError({ status: 401, message: 'Você não tem permissão para acessar esses dados' })

  const existe = await Users.findOne({ email })

  if(!existe) throw createError({ status: 401, message: 'Usuário não cadastrado' })

  if(existe.devedor) throw createError({ status: 401, message: 'Usuário está devendo' })

  existe.devedor = true

  const existe2 = await Bikes.findOne({ codigo })

  if(!existe2) throw createError({ status: 401, message: 'Bicicleta não cadastrado' })

  if(existe2.status !== 'Disponível') throw createError({ status: 401, message: 'Bicicleta não está disponível' })

  existe2.status = 'Alugada'

  const dataInicio = new Date()

  await new Alugueis({ email, codigo, dataInicio }).save()
  await existe.save()
  await existe2.save()

  return `aluguel feito com sucesso`
})
