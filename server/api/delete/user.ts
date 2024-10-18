import { unlink } from 'node:fs/promises'
import { IdSchema } from '~/schemas/id'

const { FILES_PATH } = useRuntimeConfig()

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event, { statusCode: 401, message: 'Você não tem pemissão para executar essa ação' })

  if(user.level !== 'Administrador') throw createError({ status: 401, message: 'Você não tem permissão para acessar esses dados' })

  const body = await readValidatedBody(event, IdSchema.safeParse)

  if(!body.success) throw createError({ status: 401, message: body.error.errors[0].message })

  const { id } = body.data

  const usuario = await Users.findById(id)

  if(!usuario) throw createError({ status: 401, message: 'Usuário não Existe' })

  if(usuario.foto){
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await unlink(`${FILES_PATH}user/${usuario.foto}`)
  }

  await Users.findByIdAndDelete(id)
    .catch(() => { throw createError({ status: 401, message: 'Usuário não Existe' }) })

  return `O Usuário foi excluido com sucesso`
})
