import { z } from 'zod'

export const AuthenticationSchema = z.object({
  email: z.string().email({ message: 'Preencha um Email válido' }),
  senha: z.string().min(1, { message: 'Preencha sua Senha' }),
})

export type Authentication = z.infer<typeof AuthenticationSchema>

export const UserAdmSchema = z.object({
  email: z.string().email({ message: 'Preencha um Email válido' }),
  senha: z.string().min(1, { message: 'Preencha sua Senha' }),
  nome: z.string().min(1, { message: 'Preencha seu Nome' }),
})

export type UserAdm = z.infer<typeof UserAdmSchema>

export const UserSchema = z.object({
  email: z.string().email({ message: 'Preencha um Email válido' }),
  senha: z.string().min(1, { message: 'Preencha sua Senha' }),
  nome: z.string().min(1, { message: 'Preencha seu Nome' }),
  sobrenome: z.string().min(1, { message: 'Preencha seu Sobrenome' }),
  cpf: z.string().min(1, { message: 'Preencha seu CPF' }),
  confirmacaoSenha: z.string().min(1, { message: 'Confirme sua Senha' }),
  dadosBancarios: z.boolean(),
  numeroCartao: z.string().optional(),
  cvv: z.string().optional(),
  dataValidade: z.string().optional(),
  nomeCartao: z.string().optional(),
  cpfCartao: z.string().optional(),
})
  .refine(data => data.senha === data.confirmacaoSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmacaoSenha', 'senha'],
  })

export type User = z.infer<typeof UserSchema>

export const UserMongoSchema = z.object({
  email: z.string().email({ message: 'Preencha um Email válido' }),
  senha: z.string().min(1, { message: 'Preencha sua Senha' }),
  nome: z.string().min(1, { message: 'Preencha seu Nome' }),
  sobrenome: z.string().min(1, { message: 'Preencha seu Sobrenome' }),
  cpf: z.string().min(1, { message: 'Preencha seu CPF' }),
  dadosBancarios: z.boolean(),
  numeroCartao: z.string().optional(),
  cvv: z.string().optional(),
  dataValidade: z.string().optional(),
  nomeCartao: z.string().optional(),
  cpfCartao: z.string().optional(),
})

export type UserMongo = z.infer<typeof UserMongoSchema>
