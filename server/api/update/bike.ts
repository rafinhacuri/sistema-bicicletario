import { Jimp } from 'jimp'
import { Buffer } from 'node:buffer'
import { unlink } from 'node:fs/promises'
import { BikeUpadateSchema } from '~/schemas/bicicleta'

const { FILES_PATH } = useRuntimeConfig()

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event, { statusCode: 401, message: 'Você não tem pemissão para executar essa ação' })

  if(user.level !== 'Administrador') throw createError({ status: 401, message: 'Você não tem permissão para acessar esses dados' })

  const formData = await readFormData(event)
  const fotoFD = formData.get('foto') as File
  const idFD = formData.get('id')
  const codigoFD = formData.get('codigo')
  const modeloFD = formData.get('modelo')
  const marcaFD = formData.get('marca')
  const precoMinutoFD = Number.parseFloat(formData.get('precoMinuto') as string)
  const valorFD = Number.parseFloat(formData.get('valor') as string)

  const body = BikeUpadateSchema.safeParse({ foto: fotoFD, codigo: codigoFD, modelo: modeloFD, marca: marcaFD, precoMinuto: precoMinutoFD, valor: valorFD, id: idFD })

  if(!body.success) throw createError({ status: 401, message: body.error.errors[0].message })

  const { modelo, marca, precoMinuto, valor, id } = body.data

  const bike = await Bikes.findById(id)

  if(!bike) throw createError({ status: 401, message: 'Bicicleta não Existe' })

  let fotoCaminho = ''

  if(fotoFD){
    if(bike.foto){
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await unlink(`${FILES_PATH}bikes/${bike.foto}`)
    }

    const imagem = `${Date.now()}`
    const fotoJimp = await Jimp.read(Buffer.from(await fotoFD.arrayBuffer()))
    await fotoJimp.cover({ w: 1920, h: 1080 }).write(`${FILES_PATH}bikes/${imagem}.png`)
    fotoCaminho = `${imagem}.png`
  }

  if(modelo && modelo !== bike.modelo) bike.modelo = modelo

  if(marca && marca !== bike.marca) bike.marca = marca

  if(precoMinuto && precoMinuto !== bike.precoMinuto) bike.precoMinuto = precoMinuto

  if(valor && valor !== bike.valor) bike.valor = valor

  if(fotoCaminho) bike.foto = fotoCaminho

  await bike.save()

  return `A bicicleta foi com sucesso`
})
