import { z } from 'zod'

export const FetchUserSchema = z.object({
  user: z.string().trim().min(1, { message: 'Preencha o usuário' }),
})

export type FetchUser = z.infer<typeof FetchUserSchema>

export const FetchBikeSchema = z.object({
  codigo: z.string().trim().min(1, { message: 'Preencha o usuário' }),
})

export type FetchBike = z.infer<typeof FetchBikeSchema>
