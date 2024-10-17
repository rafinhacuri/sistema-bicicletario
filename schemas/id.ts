import { z } from 'zod'

export const IdSchema = z.object({
  id: z.string().trim().min(1, { message: 'Preencha o id' }),
})

export type Id = z.infer<typeof IdSchema>
