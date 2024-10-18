import { unlink } from 'node:fs/promises'
import { IdSchema } from '~/schemas/id'

const { FILES_PATH } = useRuntimeConfig()

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event, { statusCode: 401, message: 'Você não tem pemissão para executar essa ação' })

  if(user.level !== 'Administrador') throw createError({ status: 401, message: 'Você não tem permissão para acessar esses dados' })

  const body = await readValidatedBody(event, IdSchema.safeParse)

  if(!body.success) throw createError({ status: 401, message: body.error.errors[0].message })

  const { id } = body.data

  const bike = await Bikes.findById(id)

  if(!bike) throw createError({ status: 401, message: 'Bicicleta não Existe' })

  if(bike.foto){
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await unlink(`${FILES_PATH}bikes/${bike.foto}`)
  }

  await Bikes.findByIdAndDelete(id)
    .catch(() => { throw createError({ status: 401, message: 'Bicicleta não Existe' }) })

  return `A bicicleta foi excluida com sucesso`
})
