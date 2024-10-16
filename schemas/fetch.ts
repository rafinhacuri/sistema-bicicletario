import { z } from 'zod'

export const FetchUserSchema = z.object({
  user: z.string().trim().min(1, { message: 'Preencha o usuário' }),
})

export type FetchUser = z.infer<typeof FetchUserSchema>
