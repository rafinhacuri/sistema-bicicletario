import { z } from 'zod'

export const AlugueSchema = z.object({
  email: z.string().email({ message: 'Preencha um Email válido' }),
  codigo: z.string().min(1, { message: 'Preencha o codigo da bicicleta' }),
})

export type Alugue = z.infer<typeof AlugueSchema>

export const FimAlugueSchema = z.object({
  id: z.string().min(1, { message: 'Preencha o id do aluguel' }),
  email: z.string().email({ message: 'Preencha um Email válido' }),
  codigo: z.string().min(1, { message: 'Preencha o codigo da bicicleta' }),
  dataFim: z.string().min(1, { message: 'Preencha a data fim da bicicleta' }),
  valor: z.number().min(1, { message: 'Preencha o valor do aluguel' }),
})

export type FimAlugue = z.infer<typeof FimAlugueSchema>

export const AlugueMongoSchema = z.object({
  email: z.string().email({ message: 'Preencha um Email válido' }),
  codigo: z.string().min(1, { message: 'Preencha o codigo da bicicleta' }),
  dataInicio: z.string().min(1, { message: 'Preencha a data de inicio' }),
  dataFim: z.string().optional(),
  valor: z.number().optional(),
  pago: z.boolean(),
  devolvido: z.boolean(),
})

export type AlugueMongo = z.infer<typeof AlugueMongoSchema>
