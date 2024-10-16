export default defineEventHandler(async event => {
  console.log('update user', event)

  return `Sua conta foi registrada com sucesso`
})
