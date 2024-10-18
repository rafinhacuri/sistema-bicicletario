import mime from 'mime'
import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { z } from 'zod'

const { FILES_PATH } = useRuntimeConfig()

const paramsSchema = z.object({
  foto: z.string().min(1, { message: 'Imagem não selecionada' }),
})

export default defineEventHandler(async event => {
  const params = await getValidatedRouterParams(event, paramsSchema.safeParse)

  if(!params.success) throw createError({ status: 401, message: params.error.errors[0].message })

  const { foto: nomeArquivo } = params.data
  if(!nomeArquivo) throw createError({ status: 404, message: 'imagem não encontrado' })

  const fileExtension = nomeArquivo.split('.').pop() || ''

  if(nomeArquivo.includes('/')) throw createError({ status: 404, message: 'imagem não encontrado 2' })

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const imagem = await readFile(`${FILES_PATH}bikes/${basename(nomeArquivo)}`)
    .catch(() => { throw createError({ status: 404, message: 'imagem não encontrado 3' }) })

  const mimeType = mime.getType(fileExtension)

  appendResponseHeaders(event, {
    'Content-Type': mimeType || 'application/octet-stream',
    'Content-Disposition': `inline; filename="${nomeArquivo}"`,
    'Cache-Control': 'max-age=3600',
  })

  return imagem
})
