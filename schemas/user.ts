import { z } from 'zod'

export const UserAdmSchema = z.object({
  email: z.string().email({ message: 'Preencha um Email válido' }),
  senha: z.string().trim().min(1, { message: 'Preencha sua Senha' }),
  nome: z.string().trim().min(1, { message: 'Preencha seu Nome' }),
})

export type UserAdm = z.infer<typeof UserAdmSchema>

export const UserSchema = z.object({
  nome: z.string().trim().min(1, { message: 'Preencha seu nome' }),
  email: z.string().email({ message: 'Preencha um Email válido' }),
  senha: z.string().trim().min(1, { message: 'Preencha sua Senha' }),
  confirmacaoSenha: z.string().trim().min(1, { message: 'Confirme sua Senha' }),
})
  .refine(data => data.senha === data.confirmacaoSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmacaoSenha', 'senha'],
  })

export type User = z.infer<typeof UserSchema>

export const UserMongoSchema = z.object({
  email: z.string().email({ message: 'Preencha um Email válido' }),
  senha: z.string().min(1, { message: 'Preencha sua Senha' }),
  nome: z.string().trim().min(1, { message: 'Preencha seu nome' }),
  sobrenome: z.string().optional(),
  cpf: z.string().optional(),
  dadosBancarios: z.boolean(),
  numeroCartao: z.string().optional(),
  cvv: z.string().optional(),
  dataValidade: z.string().optional(),
  nomeCartao: z.string().optional(),
  cpfCartao: z.string().optional(),
})

export type UserMongo = z.infer<typeof UserMongoSchema>

export const UserEditSchema = z.object({
  id: z.string().trim().min(1, { message: 'Preencha seu ID' }),
  email: z.string().optional(),
  senhaAtual: z.string().trim().min(1, { message: 'Preencha sua Senha' }),
  senhaNova: z.string().optional(),
  nome: z.string().optional(),
  sobrenome: z.string().optional(),
  cpf: z.string().optional(),
  confirmacaoSenha: z.string().optional(),
  dadosBancarios: z.boolean(),
  numeroCartao: z.string().optional(),
  cvv: z.string().optional(),
  dataValidade: z.string().optional(),
  nomeCartao: z.string().optional(),
  cpfCartao: z.string().optional(),
})
  .refine(data => data.senhaNova === data.confirmacaoSenha || !data.senhaNova, {
    message: 'As senhas não coincidem',
    path: ['confirmacaoSenha', 'senhaNova'],
  })

export type UserEdit = z.infer<typeof UserEditSchema>
