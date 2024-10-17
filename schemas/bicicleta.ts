import { z } from 'zod'

export const BikeSchema = z.object({
  codigo: z.string().trim().min(1, { message: 'Preencha o codigo' }),
  modelo: z.string().trim().min(1, { message: 'Preencha o modelo' }),
  marca: z.string().trim().min(1, { message: 'Preencha a marca' }),
  precoMinuto: z.number().min(0, { message: 'Preço minimo deve ser maior que 0' }),
  valor: z.number().min(0, { message: 'Valor deve ser maior que 0' }),
})

export type Bike = z.infer<typeof BikeSchema>

export const BikeMongoSchema = z.object({
  status: z.string().trim().min(1, { message: 'Preencha o status' }),
  codigo: z.string().trim().min(1, { message: 'Preencha o codigo' }),
  modelo: z.string().trim().min(1, { message: 'Preencha o modelo' }),
  marca: z.string().trim().min(1, { message: 'Preencha a marca' }),
  precoMinuto: z.number().min(0, { message: 'Preço minimo deve ser maior que 0' }),
  valor: z.number().min(0, { message: 'Valor deve ser maior que 0' }),
})

export type BikeMongo = z.infer<typeof BikeMongoSchema>

export const BikeUpadateSchema = z.object({
  id: z.string().trim().min(1, { message: 'Preencha o id' }),
  codigo: z.string().optional(),
  modelo: z.string().optional(),
  marca: z.string().optional(),
  precoMinuto: z.number().optional(),
  valor: z.number().optional(),
})

export type BikeUpadate = z.infer<typeof BikeUpadateSchema>
