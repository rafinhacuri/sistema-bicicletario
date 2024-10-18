import { unlink, writeFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { UserFotoSchema } from '~/schemas/user'

const { FILES_PATH } = useRuntimeConfig()

export default defineEventHandler(async event => {
  await requireUserSession(event, { statusCode: 401, message: 'Você não tem pemissão para executar essa ação' })

  const formData = await readFormData(event)
  const fotoFD = formData.get('imagem') as File
  const idFD = formData.get('id')

  const body = UserFotoSchema.safeParse({ foto: fotoFD, id: idFD })

  if(!body.success) throw createError({ status: 401, message: body.error.errors[0].message })

  const { id } = body.data

  const user = await Users.findById(id)

  if(!user) throw createError({ status: 404, message: 'Usuário não encontrado' })

  if(fotoFD){
    if(user.foto){
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await unlink(`${FILES_PATH}user/${user.foto}`)
    }

    const fotoExtension = fotoFD.name.split('.').pop()?.toLocaleLowerCase() || ''
    const fotoCaminho = `${Date.now()}.${fotoExtension}`

    if(fotoCaminho.includes('/')) throw createError({ status: 404, message: 'Banner não encontrado' })

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await writeFile(`${FILES_PATH}user/${basename(fotoCaminho)}`, new Uint8Array(await fotoFD.arrayBuffer()))
    user.foto = fotoCaminho

    await user.save()
    return `Sua Foto foi atualizada com sucesso`
  }
  return `Nenhuma foto foi enviada`
})
