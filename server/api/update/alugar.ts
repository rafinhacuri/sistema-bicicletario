import { FimAlugueSchema } from '~/schemas/alugar'

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event, { statusCode: 401, message: 'Você não tem pemissão para executar essa ação' })

  const body = await readValidatedBody(event, FimAlugueSchema.safeParse)

  if(!body.success) throw createError({ status: 401, message: body.error.errors[0].message })

  const { email, codigo, dataFim, id, valor } = body.data

  if(user.email !== email) throw createError({ status: 401, message: 'Você não tem permissão para acessar esses dados' })

  const existe = await Users.findOne({ email })

  if(!existe) throw createError({ status: 401, message: 'Usuário não cadastrado' })

  if(!existe.devedor) throw createError({ status: 401, message: 'Usuário não devendo' })

  existe.devedor = false

  const existe2 = await Bikes.findOne({ codigo })

  if(!existe2) throw createError({ status: 401, message: 'Bicicleta não cadastrado' })

  if(existe2.status === 'Disponível') throw createError({ status: 401, message: 'Bicicleta está disponível' })

  existe2.status = 'Disponível'

  const aluguel = await Alugueis.findById(id)

  if(!aluguel) throw createError({ status: 401, message: 'Aluguel não encontrado' })

  if(aluguel.email !== email) throw createError({ status: 401, message: 'Você não tem permissão para acessar esses dados' })

  if(aluguel.codigo !== codigo) throw createError({ status: 401, message: 'Código não corresponde ao aluguel' })

  aluguel.dataFim = dataFim
  aluguel.valor = valor
  aluguel.pago = true
  aluguel.devolvido = true

  await existe.save()
  await existe2.save()
  await aluguel.save()

  return `Finalização feita com sucesso`
})
