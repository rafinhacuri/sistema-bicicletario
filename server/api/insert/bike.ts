import { Jimp } from 'jimp'
import { Buffer } from 'node:buffer'
import { BikeSchema } from '~/schemas/bicicleta'

const { FILES_PATH } = useRuntimeConfig()

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event, { statusCode: 401, message: 'Você não tem pemissão para executar essa ação' })

  if(user.level !== 'Administrador') throw createError({ status: 401, message: 'Você não tem permissão para acessar esses dados' })

  const formData = await readFormData(event)
  const fotoFD = formData.get('foto') as File
  const codigoFD = formData.get('codigo')
  const modeloFD = formData.get('modelo')
  const marcaFD = formData.get('marca')
  const precoMinutoFD = Number.parseFloat(formData.get('precoMinuto') as string)
  const valorFD = Number.parseFloat(formData.get('valor') as string)

  const body = BikeSchema.safeParse({ foto: fotoFD, codigo: codigoFD, modelo: modeloFD, marca: marcaFD, precoMinuto: precoMinutoFD, valor: valorFD })

  if(!body.success) throw createError({ status: 401, message: body.error.errors[0].message })

  const { codigo, modelo, marca, precoMinuto, valor } = body.data

  const existe = await Bikes.findOne({ codigo })

  if(existe) throw createError({ status: 401, message: 'Bicicleta já cadastrada' })

  let fotoCaminho = ''

  if(fotoFD){
    const imagem = `${Date.now()}`
    const fotoJimp = await Jimp.read(Buffer.from(await fotoFD.arrayBuffer()))
    await fotoJimp.cover({ w: 1920, h: 1080 }).write(`${FILES_PATH}bikes/${imagem}.png`)
    fotoCaminho = `${imagem}.png`
  }

  await new Bikes({ codigo, modelo, marca, precoMinuto, valor, foto: fotoCaminho }).save()

  return `A bicileta foi registrada com sucesso`
})
