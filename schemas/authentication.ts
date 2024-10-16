import { z } from 'zod'

export const AuthenticationSchema = z.object({
  email: z.string().email({ message: 'Preencha um Email válido' }),
  senha: z.string().min(1, { message: 'Preencha sua Senha' }),
})

export type Authentication = z.infer<typeof AuthenticationSchema>
