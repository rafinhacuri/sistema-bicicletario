import { sha512Crypt, verifySha512Crypt } from 'ldap-passwords'
import { UserEditSchema } from '~/schemas/user'

export default defineEventHandler(async event => {
  const body = await readValidatedBody(event, UserEditSchema.safeParse)

  if(!body.success) throw createError({ status: 401, message: body.error.errors[0].message })

  const { id, cpf, dadosBancarios, email, nome, senhaAtual, senhaNova, sobrenome, cpfCartao, cvv, dataValidade, nomeCartao, numeroCartao } = body.data

  const user = await Users.findById(id)

  if(!user) throw createError({ status: 401, message: 'Usuário não encontrado' })

  const senhaCrypt = sha512Crypt(senhaAtual || '')

  if(!senhaCrypt) throw createError({ status: 500, message: 'Erro ao criptografar a senha' })

  const senhas = user.senha

  if(!senhas) throw createError({ status: 401, message: 'Usuário e/ou senha inválidos' })

  if(!verifySha512Crypt(senhaAtual, senhas)) throw createError({ status: 401, message: 'Usuário e/ou senha inválidos' })

  if(dadosBancarios && (!numeroCartao || !cvv || !dataValidade || !nomeCartao || !cpfCartao)) throw createError({ status: 401, message: 'Preencha todos os campos de pagamento' })

  if(email && email !== user.email) user.email = email
  if(nome && nome !== user.nome) user.nome = nome
  if(sobrenome && sobrenome !== user.sobrenome) user.sobrenome = sobrenome
  if(cpf && cpf !== user.cpf) user.cpf = cpf
  if(senhaNova) user.senha = sha512Crypt(senhaNova)
  if(dadosBancarios !== user.dadosBancarios) user.dadosBancarios = dadosBancarios
  if(numeroCartao && numeroCartao !== user.numeroCartao) user.numeroCartao = numeroCartao
  if(cvv && cvv !== user.cvv) user.cvv = cvv
  if(dataValidade && dataValidade !== user.dataValidade) user.dataValidade = dataValidade
  if(nomeCartao && nomeCartao !== user.nomeCartao) user.nomeCartao = nomeCartao
  if(cpfCartao && cpfCartao !== user.cpfCartao) user.cpfCartao = cpfCartao

  await user.save()

  await clearUserSession(event)

  await setUserSession(event, { user: { level: 'Usuário', email: email || user.email, nome: nome || user.nome } })

  return `Sua conta foi atualizada com sucesso`
})
